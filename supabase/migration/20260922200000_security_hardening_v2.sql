-- ============================================================================
-- 20260922200000_security_hardening_v2.sql
-- Security Hardening v2 — Fixes all audit findings
-- ============================================================================

-- ============================================================================
-- FIX A: Restore open_gift idempotency guard (🔴 HIGH)
-- The previous migration accidentally removed `AND is_opened = false` from
-- the UPDATE WHERE clause, allowing anyone with a slug to re-read the message
-- unlimited times. This restores the one-time-open semantic.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.open_gift(_slug text)
RETURNS TABLE(
  was_opened boolean,
  message text,
  image_urls text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_message text;
  v_images text[];
  v_count int;
BEGIN
  PERFORM public.check_rate_limit('open_gift', 60, 60);

  -- CRITICAL: `AND is_opened = false` ensures a gift can only be opened ONCE.
  -- If the gift was already opened, ROW_COUNT = 0 and we return was_opened=false
  -- with NULL message — the client must show the "already opened" screen.
  UPDATE public.gifts
     SET is_opened = true,
         opened_at = coalesce(opened_at, now())
   WHERE slug = _slug
     AND is_opened = false
   RETURNING gifts.message,
             CASE WHEN gifts.photo_deleted_at IS NOT NULL THEN '{}'::text[] ELSE gifts.image_urls END
     INTO v_message, v_images;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  IF v_count = 1 THEN
    RETURN QUERY SELECT true, v_message, coalesce(v_images, '{}'::text[]);
  ELSE
    RETURN QUERY SELECT false, NULL::text, NULL::text[];
  END IF;
END;
$$;


-- ============================================================================
-- FIX B: Restrict storage INSERT policy to `uploads/` path only (🟡 MEDIUM)
-- Prevents attackers from uploading to arbitrary paths in the bucket.
-- ============================================================================
DROP POLICY IF EXISTS "Anyone can upload gift images" ON storage.objects;
CREATE POLICY "Anyone can upload gift images" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'gift-images'
    AND (storage.foldername(name))[1] = 'uploads'
  );


-- ============================================================================
-- FIX C: Upload rate limiting RPC (🟡 MEDIUM)
-- Client must call this before uploading a file to storage.
-- Storage uploads bypass SQL RPCs, so this is a "gentleman's gate" —
-- the real enforcement is the bucket's file_size_limit + MIME restrictions.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.check_upload_rate_limit()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Max 10 uploads per 10 minutes per IP
  PERFORM public.check_rate_limit('storage_upload', 10, 600);
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RAISE;
END;
$$;

REVOKE ALL ON FUNCTION public.check_upload_rate_limit() FROM public;
GRANT EXECUTE ON FUNCTION public.check_upload_rate_limit() TO anon, authenticated;


-- ============================================================================
-- FIX D: Tighten create_gift rate limit (🟡 MEDIUM)
-- Reduce from 60 per 10 min (too permissive) to 10 per 10 min.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.create_gift(
  _message text,
  _creator_name text,
  _theme text,
  _image_urls text[]
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  new_slug text;
  clean_message text;
  clean_name text;
  i int;
  path_val text;
BEGIN
  -- Rate limit: max 10 gift creations per 10 minutes per IP
  PERFORM public.check_rate_limit('create_gift', 10, 600);

  clean_message := btrim(coalesce(_message, ''));
  clean_name := NULLIF(btrim(coalesce(_creator_name, '')), '');

  IF clean_message = '' THEN
    RAISE EXCEPTION 'message required';
  END IF;
  IF length(clean_message) > 1000 THEN
    RAISE EXCEPTION 'message too long';
  END IF;
  IF _theme NOT IN ('birthday', 'love', 'thanks', 'holiday', 'welcome') THEN
    RAISE EXCEPTION 'invalid theme';
  END IF;
  IF clean_name IS NOT NULL AND length(clean_name) > 40 THEN
    RAISE EXCEPTION 'name too long';
  END IF;
  IF _image_urls IS NOT NULL AND array_length(_image_urls, 1) > 1 THEN
    RAISE EXCEPTION 'too many images';
  END IF;

  -- FIX H: Sanitize image_urls paths — reject dangerous patterns
  IF _image_urls IS NOT NULL THEN
    FOR i IN 1..coalesce(array_length(_image_urls, 1), 0) LOOP
      path_val := _image_urls[i];
      IF path_val IS NOT NULL AND btrim(path_val) <> '' THEN
        -- Reject path traversal
        IF path_val LIKE '%..%' THEN
          RAISE EXCEPTION 'invalid image path';
        END IF;
        -- Reject absolute paths
        IF path_val LIKE '/%' THEN
          RAISE EXCEPTION 'invalid image path';
        END IF;
        -- Reject data: URIs
        IF path_val LIKE 'data:%' THEN
          RAISE EXCEPTION 'invalid image path';
        END IF;
        -- Reject http/https URLs (paths should be relative storage paths)
        IF path_val LIKE 'http://%' OR path_val LIKE 'https://%' THEN
          RAISE EXCEPTION 'invalid image path';
        END IF;
        -- Must start with 'uploads/' prefix
        IF path_val NOT LIKE 'uploads/%' THEN
          RAISE EXCEPTION 'invalid image path';
        END IF;
      END IF;
    END LOOP;
  END IF;

  new_slug := public.generate_gift_slug();

  INSERT INTO public.gifts (slug, message, creator_name, theme, image_urls, open_policy)
  VALUES (new_slug, clean_message, clean_name, _theme, coalesce(_image_urls, ARRAY[]::text[]), 'anyone_with_link');

  RETURN new_slug;
END;
$$;


-- ============================================================================
-- FIX E: Harden rate limiter IP extraction (🟡 MEDIUM)
-- Prefer cf-connecting-ip (set by Cloudflare edge, cannot be spoofed).
-- For x-forwarded-for, take the RIGHTMOST entry (the one appended by the
-- trusted edge proxy closest to the server, not the leftmost which is
-- client-supplied). This is the standard for Cloudflare/Vercel/AWS ALB.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_action text,
  p_max_req int,
  p_window_sec int
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ip inet;
  v_now timestamptz := now();
  v_headers json;
  v_header_ip text;
  v_current_count int;
BEGIN
  -- Extract client IP from PostgREST request headers
  BEGIN
    v_headers := current_setting('request.headers', true)::json;

    -- Priority order: cf-connecting-ip (Cloudflare-set, trusted) > x-real-ip > x-forwarded-for
    v_header_ip := v_headers->>'cf-connecting-ip';

    IF v_header_ip IS NULL THEN
      v_header_ip := v_headers->>'x-real-ip';
    END IF;

    IF v_header_ip IS NULL THEN
      v_header_ip := v_headers->>'x-forwarded-for';
      IF v_header_ip IS NOT NULL THEN
        -- Take the RIGHTMOST entry: this is appended by the trusted edge proxy.
        -- Leftmost entries can be spoofed by the client.
        v_header_ip := btrim(split_part(
          v_header_ip, ',',
          array_length(string_to_array(v_header_ip, ','), 1)
        ));
      END IF;
    END IF;

    IF v_header_ip IS NOT NULL AND v_header_ip <> '' THEN
      v_ip := v_header_ip::inet;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_ip := NULL;
  END;

  IF v_ip IS NULL THEN
    v_ip := coalesce(inet_client_addr(), '127.0.0.1'::inet);
  END IF;

  -- Periodically purge expired buckets
  DELETE FROM public.rate_limits
  WHERE bucket_start < v_now - (p_window_sec || ' seconds')::interval;

  -- Atomic UPSERT without row lock blocking
  INSERT INTO public.rate_limits (ip, action, bucket_start, req_count)
  VALUES (v_ip, p_action, v_now, 1)
  ON CONFLICT (ip, action) DO UPDATE
  SET req_count = CASE
        WHEN rate_limits.bucket_start < v_now - (p_window_sec || ' seconds')::interval THEN 1
        ELSE rate_limits.req_count + 1
      END,
      bucket_start = CASE
        WHEN rate_limits.bucket_start < v_now - (p_window_sec || ' seconds')::interval THEN v_now
        ELSE rate_limits.bucket_start
      END
  RETURNING req_count INTO v_current_count;

  IF v_current_count > p_max_req THEN
    RAISE EXCEPTION 'rate limit exceeded for action %, please try again later', p_action;
  END IF;
END;
$$;


-- ============================================================================
-- FIX F: 30-day message retention cleanup (🟢 LOW)
-- Opened gifts with messages older than 30 days are fully deleted.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.cleanup_expired_gifts_and_photos()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
BEGIN
  ---------------------------------------------------------------------------
  -- Rule 1: Unopened gifts NOT opened within 48 hours
  -- Bulk delete photos from private bucket & bulk delete entire gift records.
  ---------------------------------------------------------------------------
  DELETE FROM storage.objects
  WHERE bucket_id = 'gift-images'
    AND name IN (
      SELECT ltrim(btrim(img), '/')
      FROM public.gifts g,
           unnest(g.image_urls) AS img
      WHERE g.is_opened = false
        AND g.created_at < (now() - INTERVAL '48 hours')
        AND img IS NOT NULL
        AND btrim(img) <> ''
        AND img NOT LIKE 'data:%'
        AND img NOT LIKE 'http%'
    );

  DELETE FROM public.gifts
  WHERE is_opened = false
    AND created_at < (now() - INTERVAL '48 hours');

  ---------------------------------------------------------------------------
  -- Rule 2: Opened gifts opened > 24 hours ago — delete photos only
  ---------------------------------------------------------------------------
  DELETE FROM storage.objects
  WHERE bucket_id = 'gift-images'
    AND name IN (
      SELECT ltrim(btrim(img), '/')
      FROM public.gifts g,
           unnest(g.image_urls) AS img
      WHERE g.is_opened = true
        AND g.opened_at IS NOT NULL
        AND g.opened_at < (now() - INTERVAL '24 hours')
        AND g.photo_deleted_at IS NULL
        AND img IS NOT NULL
        AND btrim(img) <> ''
        AND img NOT LIKE 'data:%'
        AND img NOT LIKE 'http%'
    );

  UPDATE public.gifts
     SET image_urls = '{}'::text[],
         photo_deleted_at = now()
   WHERE is_opened = true
     AND opened_at IS NOT NULL
     AND opened_at < (now() - INTERVAL '24 hours')
     AND photo_deleted_at IS NULL;

  ---------------------------------------------------------------------------
  -- Rule 3 (NEW): Opened gifts older than 30 days — full deletion
  -- Privacy: don't retain personal messages indefinitely.
  ---------------------------------------------------------------------------
  DELETE FROM public.gifts
  WHERE is_opened = true
    AND opened_at IS NOT NULL
    AND opened_at < (now() - INTERVAL '30 days');
END;
$$;


-- ============================================================================
-- FIX G: Revoke check_rate_limit from anon (🟢 LOW)
-- This internal function should only be callable by SECURITY DEFINER RPCs,
-- not directly by API clients.
-- ============================================================================
REVOKE ALL ON FUNCTION public.check_rate_limit(text, int, int) FROM public;
REVOKE ALL ON FUNCTION public.check_rate_limit(text, int, int) FROM anon;
REVOKE ALL ON FUNCTION public.check_rate_limit(text, int, int) FROM authenticated;
-- Only service_role and postgres can call it (and SECURITY DEFINER functions run as owner)


-- ============================================================================
-- Permission grants for updated RPCs
-- ============================================================================
REVOKE ALL ON FUNCTION public.open_gift(text) FROM public;
REVOKE ALL ON FUNCTION public.create_gift(text, text, text, text[]) FROM public;
GRANT EXECUTE ON FUNCTION public.open_gift(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_gift(text, text, text, text[]) TO anon, authenticated;

-- Ensure cleanup is restricted
REVOKE ALL ON FUNCTION public.cleanup_expired_gifts_and_photos() FROM public;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_gifts_and_photos() TO service_role, postgres;
