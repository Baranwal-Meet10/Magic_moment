-- ============================================================================
-- 20260816120000_security_reliability_hardening.sql
-- Production Security & Reliability Hardening Pass for GiftLink
-- ============================================================================

-- 1. Rate Limiting Table & Function (Database-level protection for PostgREST)
CREATE TABLE IF NOT EXISTS public.rate_limits (
  ip inet NOT NULL,
  action text NOT NULL,
  bucket_start timestamptz NOT NULL,
  req_count int NOT NULL DEFAULT 1,
  PRIMARY KEY (ip, action)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.rate_limits FROM anon, authenticated, public;
GRANT ALL ON TABLE public.rate_limits TO service_role;

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
  v_bucket_start timestamptz;
BEGIN
  -- Extract client IP from PostgREST request headers or fallback to inet_client_addr()
  BEGIN
    v_headers := current_setting('request.headers', true)::json;
    v_header_ip := coalesce(
      v_headers->>'x-forwarded-for',
      v_headers->>'x-real-ip',
      v_headers->>'cf-connecting-ip'
    );
    IF v_header_ip IS NOT NULL THEN
      v_header_ip := split_part(v_header_ip, ',', 1);
      v_ip := v_header_ip::inet;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_ip := NULL;
  END;

  IF v_ip IS NULL THEN
    v_ip := coalesce(inet_client_addr(), '127.0.0.1'::inet);
  END IF;

  -- Cleanup expired buckets periodically
  DELETE FROM public.rate_limits
  WHERE bucket_start < v_now - (p_window_sec || ' seconds')::interval;

  SELECT req_count, bucket_start INTO v_current_count, v_bucket_start
  FROM public.rate_limits
  WHERE ip = v_ip AND action = p_action
  FOR UPDATE;

  IF NOT FOUND OR v_bucket_start < v_now - (p_window_sec || ' seconds')::interval THEN
    INSERT INTO public.rate_limits (ip, action, bucket_start, req_count)
    VALUES (v_ip, p_action, v_now, 1)
    ON CONFLICT (ip, action) DO UPDATE
    SET bucket_start = EXCLUDED.bucket_start,
        req_count = EXCLUDED.req_count;
  ELSE
    IF v_current_count >= p_max_req THEN
      RAISE EXCEPTION 'rate limit exceeded for action %, please try again later', p_action;
    END IF;

    UPDATE public.rate_limits
    SET req_count = req_count + 1
    WHERE ip = v_ip AND action = p_action;
  END IF;
END;
$$;


-- 2. Server-side Cryptographic Slug Generator
CREATE OR REPLACE FUNCTION public.generate_gift_slug()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_bytes bytea;
  v_slug text;
  v_exists boolean;
BEGIN
  LOOP
    -- 12 bytes of cryptographic entropy -> base64url string without padding (16 chars)
    v_bytes := gen_random_bytes(12);
    v_slug := translate(encode(v_bytes, 'base64'), '+/=', '-_');
    v_slug := rtrim(v_slug, '=');
    
    SELECT EXISTS (SELECT 1 FROM public.gifts WHERE slug = v_slug) INTO v_exists;
    IF NOT v_exists THEN
      RETURN v_slug;
    END IF;
  END LOOP;
END;
$$;


-- 3. Update create_gift RPC: Server-side slug generation, input parity, rate limiting
DROP FUNCTION IF EXISTS public.create_gift(text, text, text, text, text[]);

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
  -- Rate limit: max 5 gift creations per 10 minutes per IP
  PERFORM public.check_rate_limit('create_gift', 5, 600);

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

  -- Generate slug server-side inside RPC
  new_slug := public.generate_gift_slug();

  INSERT INTO public.gifts (slug, message, creator_name, theme, image_urls, open_policy)
  VALUES (new_slug, clean_message, clean_name, _theme, coalesce(_image_urls, ARRAY[]::text[]), 'anyone_with_link');

  RETURN new_slug;
END;
$$;


-- 4. Update get_gift_by_slug RPC: Rate limiting to prevent slug brute-forcing
DROP FUNCTION IF EXISTS public.get_gift_by_slug(text);

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
  -- Rate limit: max 30 reads per 60s per IP
  PERFORM public.check_rate_limit('get_gift_by_slug', 30, 60);

  RETURN QUERY
  SELECT g.slug, g.creator_name, g.theme, g.is_opened, g.opened_at, g.created_at,
         (coalesce(array_length(g.image_urls, 1), 0) > 0) AS has_images
  FROM public.gifts g
  WHERE g.slug = _slug
  LIMIT 1;
END;
$$;


-- 5. Update open_gift RPC: Rate limiting
DROP FUNCTION IF EXISTS public.open_gift(text);

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
  -- Rate limit: max 10 open calls per 60s per IP
  PERFORM public.check_rate_limit('open_gift', 10, 60);

  UPDATE public.gifts
     SET is_opened = true, opened_at = now()
   WHERE slug = _slug AND is_opened = false
   RETURNING gifts.message, gifts.image_urls
     INTO v_message, v_images;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  IF v_count = 1 THEN
    RETURN QUERY SELECT true, v_message, v_images;
  ELSE
    RETURN QUERY SELECT false, NULL::text, NULL::text[];
  END IF;
END;
$$;


-- 6. RPC Grant and Revoke Permissions
REVOKE ALL ON FUNCTION public.check_rate_limit(text, int, int) FROM public;
REVOKE ALL ON FUNCTION public.generate_gift_slug() FROM public;
REVOKE ALL ON FUNCTION public.get_gift_by_slug(text) FROM public;
REVOKE ALL ON FUNCTION public.create_gift(text, text, text, text[]) FROM public;
REVOKE ALL ON FUNCTION public.open_gift(text) FROM public;

GRANT EXECUTE ON FUNCTION public.get_gift_by_slug(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_gift(text, text, text, text[]) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.open_gift(text) TO anon, authenticated;


-- 7. Storage Bucket Hardening & Policy Updates
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gift-images',
  'gift-images',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

DROP POLICY IF EXISTS "Anyone can upload gift images" ON storage.objects;
CREATE POLICY "Anyone can upload gift images" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'gift-images' AND
    octet_length(file) <= 5242880
  );
