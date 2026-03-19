
-- Create product_variants table
CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_type text NOT NULL,
  variant_value text NOT NULL,
  units integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Public insert and select (same as products)
CREATE POLICY "Anyone can insert product_variants"
  ON public.product_variants FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Product variants are readable"
  ON public.product_variants FOR SELECT TO public
  USING (true);

-- Drop categories table (redundant — category is a text field on products)
DROP TABLE IF EXISTS public.categories;
