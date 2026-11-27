-- ============================================================================
-- Migration: 20261119190000_expand_theme_whitelist.sql
-- Description: Expand create_gift theme whitelist to allow all 12 mood themes:
--   'birthday', 'love', 'thanks', 'holiday', 'welcome',
--   'congrats', 'celestial', 'ocean', 'party', 'romance',
--   'botanical', 'sunset'
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

  -- 12 Supported Mood Themes:
  IF _theme NOT IN (
    'birthday', 'love', 'thanks', 'holiday', 'welcome',
    'congrats', 'celestial', 'ocean', 'party', 'romance',
    'botanical', 'sunset'
  ) THEN
    RAISE EXCEPTION 'invalid theme';
  END IF;

  IF clean_name IS NOT NULL AND length(clean_name) > 40 THEN
    RAISE EXCEPTION 'name too long';
  END IF;
  IF _image_urls IS NOT NULL AND array_length(_image_urls, 1) > 1 THEN
    RAISE EXCEPTION 'too many images';
  END IF;

  -- Sanitize image_urls paths — reject dangerous patterns
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

-- Ensure execution permissions for anonymous and authenticated callers
REVOKE ALL ON FUNCTION public.create_gift(text, text, text, text[]) FROM public;
GRANT EXECUTE ON FUNCTION public.create_gift(text, text, text, text[]) TO anon, authenticated;
