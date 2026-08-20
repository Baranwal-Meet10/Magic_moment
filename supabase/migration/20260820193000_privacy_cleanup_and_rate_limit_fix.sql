-- ============================================================================
-- 20260820193000_privacy_cleanup_and_rate_limit_fix.sql
-- Privacy Enforcement: Automatic deletion of expired gifts & photos
-- Storage & Concurrency Hardening Pass
-- ============================================================================

-- 1. Add photo_deleted_at timestamp column to public.gifts table
ALTER TABLE public.gifts 
ADD COLUMN IF NOT EXISTS photo_deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Enforce private status on gift-images bucket (revert public flag)
UPDATE storage.buckets
   SET public = false
 WHERE id = 'gift-images';

-- 3. Atomic, non-blocking check_rate_limit function to prevent concurrency locks
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
  -- Extract client IP from PostgREST request headers or fallback to inet_client_addr()
  BEGIN
    v_headers := current_setting('request.headers', true)::json;
    v_header_ip := coalesce(
      v_headers->>'cf-connecting-ip',
      v_headers->>'x-real-ip',
      v_headers->>'x-forwarded-for'
    );
    IF v_header_ip IS NOT NULL THEN
      v_header_ip := btrim(split_part(v_header_ip, ',', array_length(string_to_array(v_header_ip, ','), 1)));
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

-- 4. Update create_gift RPC: Increased rate limit from 5 to 60 requests per 10 minutes
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
BEGIN
  -- Rate limit: max 60 gift creations per 10 minutes per IP
  PERFORM public.check_rate_limit('create_gift', 60, 600);

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

  new_slug := public.generate_gift_slug();

  INSERT INTO public.gifts (slug, message, creator_name, theme, image_urls, open_policy)
  VALUES (new_slug, clean_message, clean_name, _theme, coalesce(_image_urls, ARRAY[]::text[]), 'anyone_with_link');

  RETURN new_slug;
END;
$$;

-- 5. Update get_gift_by_slug RPC: Check photo_deleted_at status
CREATE OR REPLACE FUNCTION public.get_gift_by_slug(_slug text)
RETURNS TABLE(
  slug text,
  creator_name text,
  theme text,
  is_opened boolean,
  opened_at timestamp with time zone,
  created_at timestamp with time zone,
  has_images boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.check_rate_limit('get_gift_by_slug', 100, 60);

  RETURN QUERY
  SELECT g.slug, g.creator_name, g.theme, g.is_opened, g.opened_at, g.created_at,
         (coalesce(array_length(g.image_urls, 1), 0) > 0 AND g.photo_deleted_at IS NULL) AS has_images
  FROM public.gifts g
  WHERE g.slug = _slug
  LIMIT 1;
END;
$$;

-- 6. Update open_gift RPC: Handle photo deletion state
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

  UPDATE public.gifts
     SET is_opened = true,
         opened_at = coalesce(opened_at, now())
   WHERE slug = _slug
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

-- 7. Automatic Server-side Privacy Cleanup Function
CREATE OR REPLACE FUNCTION public.cleanup_expired_gifts_and_photos()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  v_gift RECORD;
  v_img TEXT;
BEGIN
  -----------------------------------------------------------------------------
  -- Rule 1: Unopened gifts NOT opened within 48 hours
  -- Delete photos from private bucket & delete entire gift record.
  -----------------------------------------------------------------------------
  FOR v_gift IN
    SELECT id, image_urls
    FROM public.gifts
    WHERE is_opened = false
      AND created_at < (now() - INTERVAL '48 hours')
  LOOP
    IF v_gift.image_urls IS NOT NULL AND array_length(v_gift.image_urls, 1) > 0 THEN
      FOREACH v_img IN ARRAY v_gift.image_urls LOOP
        IF v_img NOT LIKE 'data:%' AND v_img NOT LIKE 'http%' THEN
          DELETE FROM storage.objects
          WHERE bucket_id = 'gift-images'
            AND (name = v_img OR name = ltrim(v_img, '/'));
        END IF;
      END LOOP;
    END IF;

    DELETE FROM public.gifts WHERE id = v_gift.id;
  END LOOP;

  -----------------------------------------------------------------------------
  -- Rule 2: Opened gifts opened > 24 hours ago
  -- Delete photos from private bucket, remove photo URLs from DB, record photo_deleted_at, keep gift & message.
  -----------------------------------------------------------------------------
  FOR v_gift IN
    SELECT id, image_urls
    FROM public.gifts
    WHERE is_opened = true
      AND opened_at IS NOT NULL
      AND opened_at < (now() - INTERVAL '24 hours')
      AND photo_deleted_at IS NULL
  LOOP
    IF v_gift.image_urls IS NOT NULL AND array_length(v_gift.image_urls, 1) > 0 THEN
      FOREACH v_img IN ARRAY v_gift.image_urls LOOP
        IF v_img NOT LIKE 'data:%' AND v_img NOT LIKE 'http%' THEN
          DELETE FROM storage.objects
          WHERE bucket_id = 'gift-images'
            AND (name = v_img OR name = ltrim(v_img, '/'));
        END IF;
      END LOOP;
    END IF;

    UPDATE public.gifts
       SET image_urls = '{}'::text[],
           photo_deleted_at = now()
     WHERE id = v_gift.id;
  END LOOP;
END;
$$;

-- 8. Grant Execution & Cron Schedule Setup
REVOKE ALL ON FUNCTION public.cleanup_expired_gifts_and_photos() FROM public;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_gifts_and_photos() TO service_role;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') OR
     EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron') THEN
    CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
    
    PERFORM cron.schedule(
      'gift_privacy_cleanup',
      '*/15 * * * *',
      $$SELECT public.cleanup_expired_gifts_and_photos()$$
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END;
$$;
