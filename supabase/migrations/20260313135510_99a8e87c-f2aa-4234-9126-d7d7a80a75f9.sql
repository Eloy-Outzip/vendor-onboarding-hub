
-- Add phone column to vendors
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS phone text;

-- Add status column to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  vendor_id uuid REFERENCES public.vendors(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "Anyone can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own categories" ON public.categories
  FOR SELECT TO authenticated
  USING (vendor_id IN (SELECT vendor_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert own categories" ON public.categories
  FOR INSERT TO authenticated
  WITH CHECK (vendor_id IN (SELECT vendor_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE TO authenticated
  USING (vendor_id IN (SELECT vendor_id FROM public.profiles WHERE id = auth.uid()));

-- Allow vendors to update their own row
CREATE POLICY "Vendors can update own row" ON public.vendors
  FOR UPDATE TO authenticated
  USING (id IN (SELECT vendor_id FROM public.profiles WHERE profiles.id = auth.uid()))
  WITH CHECK (id IN (SELECT vendor_id FROM public.profiles WHERE profiles.id = auth.uid()));
