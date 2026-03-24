INSERT INTO storage.buckets (id, name, public) VALUES ('vendor-logos', 'vendor-logos', true);

CREATE POLICY "Anyone can view vendor logos" ON storage.objects FOR SELECT USING (bucket_id = 'vendor-logos');
CREATE POLICY "Authenticated users can upload logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'vendor-logos');
CREATE POLICY "Authenticated users can update logos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'vendor-logos');
CREATE POLICY "Authenticated users can delete logos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'vendor-logos');