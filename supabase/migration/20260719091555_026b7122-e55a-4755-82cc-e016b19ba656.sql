DROP FUNCTION IF EXISTS public.get_gift_by_slug(text);
DROP FUNCTION IF EXISTS public.open_gift(text);

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
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT g.slug, g.creator_name, g.theme, g.is_opened, g.opened_at, g.created_at,
         (coalesce(array_length(g.image_urls, 1), 0) > 0) AS has_images
  FROM public.gifts g
  WHERE g.slug = _slug
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.open_gift(_slug text)
 RETURNS TABLE(
   was_opened boolean,
   message text,
   image_urls text[]
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  v_message text;
  v_images text[];
  v_count int;
BEGIN
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

REVOKE ALL ON FUNCTION public.get_gift_by_slug(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.open_gift(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_gift_by_slug(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.open_gift(text) TO anon, authenticated;