-- ================================================================
-- PRODUCT SCHEMA FIX: ADD MISSING COLUMNS & RLS
-- Run this in your Supabase SQL Editor
-- ================================================================

-- 1. Ensure the 'products' table exists with all required columns
CREATE TABLE IF NOT EXISTS public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  category text,
  stock integer DEFAULT 0,
  images text[] DEFAULT '{}'::text[]
);

-- 2. If table already existed, safely add any missing columns
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock integer DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}'::text[];
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price numeric DEFAULT 0;

-- 3. Enable RLS for Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Delete old policies to avoid duplicates
DROP POLICY IF EXISTS "Public can view products" ON public.products;
DROP POLICY IF EXISTS "Shop owners can manage their products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;

-- Everyone can see products
CREATE POLICY "Public can view products" ON public.products
FOR SELECT USING (true);

-- Shop owners can manage their own products
-- This assumes the shops table has an 'owner_id' column
CREATE POLICY "Shop owners can manage their products" ON public.products
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM shops 
    WHERE shops.id = products.shop_id 
    AND shops.owner_id = auth.uid()
  )
);

-- Admins can manage everything
CREATE POLICY "Admins can manage all products" ON public.products
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 4. Storage Bucket: Ensure 'products' bucket exists if needed
-- (Though the code currently uses 'market-images' or 'products')
-- Let's make sure 'products' is a valid bucket too.
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS for 'products' bucket
DROP POLICY IF EXISTS "Public Access Products" ON storage.objects;
CREATE POLICY "Public Access Products" ON storage.objects FOR SELECT USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Auth Upload Products" ON storage.objects;
CREATE POLICY "Auth Upload Products" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

-- 5. Force PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';
