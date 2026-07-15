
-- 1. Remove the permissive policies. Direct table access is no longer allowed.
DROP POLICY IF EXISTS "Anyone can read gifts" ON public.gifts;
DROP POLICY IF EXISTS "Anyone can create gifts" ON public.gifts;
DROP POLICY IF EXISTS "Anyone can mark opened" ON public.gifts;

-- 2. Revoke direct Data API access from anon/authenticated. RLS + no policies = denied.
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.gifts FROM anon, authenticated;
GRANT ALL ON public.gifts TO service_role;

-- 3. SECURITY DEFINER RPC: fetch one gift by exact slug. Never returns lists.
CREATE OR REPLACE FUNCTION public.get_gift_by_slug(_slug text)
RETURNS TABLE (
  slug text,
  message text,
  creator_name text,
  theme text,
  image_urls text[],
  is_opened boolean,
  opened_at timestamptz,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT g.slug, g.message, g.creator_name, g.theme, g.image_urls,
         g.is_opened, g.opened_at, g.created_at
  FROM public.gifts g
  WHERE g.slug = _slug
  LIMIT 1;
$$;

-- 4. SECURITY DEFINER RPC: create a gift. Server generates nothing; caller supplies slug.
CREATE OR REPLACE FUNCTION public.create_gift(
  _slug text,
  _message text,
  _creator_name text,
  _theme text,
  _image_urls text[]
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_slug text;
BEGIN
  -- Basic input validation
  IF _slug IS NULL OR length(_slug) < 8 OR length(_slug) > 32 THEN
    RAISE EXCEPTION 'invalid slug';
  END IF;
  IF _message IS NULL OR length(btrim(_message)) = 0 THEN
    RAISE EXCEPTION 'message required';
  END IF;
  IF length(_message) > 2000 THEN
    RAISE EXCEPTION 'message too long';
  END IF;
  IF _theme NOT IN ('birthday', 'love', 'thanks', 'holiday') THEN
    RAISE EXCEPTION 'invalid theme';
  END IF;
  IF _creator_name IS NOT NULL AND length(_creator_name) > 60 THEN
    RAISE EXCEPTION 'name too long';
  END IF;
  IF _image_urls IS NOT NULL AND array_length(_image_urls, 1) > 3 THEN
    RAISE EXCEPTION 'too many images';
  END IF;

  INSERT INTO public.gifts (slug, message, creator_name, theme, image_urls, open_policy)
  VALUES (_slug, _message, NULLIF(btrim(coalesce(_creator_name, '')), ''),
          _theme, coalesce(_image_urls, ARRAY[]::text[]), 'anyone_with_link')
  RETURNING slug INTO new_slug;

  RETURN new_slug;
END;
$$;

-- 5. SECURITY DEFINER RPC: mark a specific gift opened, race-safe.
CREATE OR REPLACE FUNCTION public.open_gift(_slug text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count int;
BEGIN
  UPDATE public.gifts
  SET is_opened = true, opened_at = now()
  WHERE slug = _slug AND is_opened = false;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count = 1;
END;
$$;

-- 6. Expose RPCs to the public API. Table itself remains inaccessible.
REVOKE ALL ON FUNCTION public.get_gift_by_slug(text) FROM public;
REVOKE ALL ON FUNCTION public.create_gift(text, text, text, text, text[]) FROM public;
REVOKE ALL ON FUNCTION public.open_gift(text) FROM public;

GRANT EXECUTE ON FUNCTION public.get_gift_by_slug(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_gift(text, text, text, text, text[]) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.open_gift(text) TO anon, authenticated;
