
CREATE TABLE public.site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  map_sort_order text NOT NULL DEFAULT 'name',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO public.site_settings (id, map_sort_order) VALUES (1, 'name');

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site settings"
  ON public.site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Only super admins can update site settings"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_super_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_super_admin = true
    )
  );
