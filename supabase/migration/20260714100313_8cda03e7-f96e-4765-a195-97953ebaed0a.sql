
CREATE TABLE public.gifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  creator_name TEXT,
  message TEXT NOT NULL,
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  theme TEXT NOT NULL DEFAULT 'birthday',
  open_policy TEXT NOT NULL DEFAULT 'anyone_with_link',
  is_opened BOOLEAN NOT NULL DEFAULT false,
  opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.gifts TO anon, authenticated;
GRANT ALL ON public.gifts TO service_role;

ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

-- Anyone can create a gift (MVP - no accounts yet)
CREATE POLICY "Anyone can create gifts" ON public.gifts
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Anyone with the slug can read a gift
CREATE POLICY "Anyone can read gifts" ON public.gifts
  FOR SELECT TO anon, authenticated USING (true);

-- Anyone can mark a gift as opened (one-time-open flip)
CREATE POLICY "Anyone can mark opened" ON public.gifts
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX gifts_slug_idx ON public.gifts(slug);
