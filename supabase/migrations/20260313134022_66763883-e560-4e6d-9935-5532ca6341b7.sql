-- Create vendors table
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  rents_equipment BOOLEAN DEFAULT false,
  categories TEXT[],
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Public insert policy (no auth required for onboarding)
CREATE POLICY "Anyone can insert vendors" ON public.vendors
  FOR INSERT WITH CHECK (true);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  category TEXT,
  units INTEGER DEFAULT 1,
  channel TEXT DEFAULT 'rental',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public insert policy
CREATE POLICY "Anyone can insert products" ON public.products
  FOR INSERT WITH CHECK (true);