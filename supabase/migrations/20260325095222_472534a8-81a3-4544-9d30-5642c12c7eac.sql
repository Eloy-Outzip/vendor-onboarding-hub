
ALTER TABLE public.vendors ADD COLUMN slug text;

UPDATE public.vendors SET slug = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) WHERE slug IS NULL;

CREATE UNIQUE INDEX vendors_slug_unique ON public.vendors (slug);
