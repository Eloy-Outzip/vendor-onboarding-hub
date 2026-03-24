CREATE POLICY "Super admins can update any vendor"
ON public.vendors FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_super_admin = true))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_super_admin = true));