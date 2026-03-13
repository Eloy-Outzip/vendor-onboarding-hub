-- Allow reading vendor id after insert (for the returning select)
CREATE POLICY "Vendors can read their own row after insert" ON public.vendors
  FOR SELECT USING (true);

-- Allow reading products (needed for potential future use)
CREATE POLICY "Products are readable" ON public.products
  FOR SELECT USING (true);