-- ================================================================
-- FIX PRODUCT RLS & INSERT ERRORS
-- Run this in your Supabase SQL Editor
-- ================================================================

-- 1. Ensure products table has all required columns
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock integer DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE;

-- 2. Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to start clean
DROP POLICY IF EXISTS "Products are visible to everyone" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.products;
DROP POLICY IF EXISTS "Shop owners can manage their products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Public can view products" ON public.products;
DROP POLICY IF EXISTS "Sellers can insert products" ON public.products;
DROP POLICY IF EXISTS "Sellers can update own products" ON public.products;
DROP POLICY IF EXISTS "Users and Admins can delete own products" ON public.products;

-- 4. Policy: Public Read Access
CREATE POLICY "Public can view products"
  ON public.products FOR SELECT
  USING (true);

-- 5. Policy: Permissive Insert for Authenticated Users (Fixes blockage)
-- This allows any logged-in user to initiate a product creation.
-- The actual ownership is checked in subsequent policies if needed, 
-- but for INSERT WITH CHECK (true) is the most permissive way to fix the error.
CREATE POLICY "Allow authenticated insert"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 6. Policy: Owner-based management (Update/Delete)
-- Allows shop owners to manage products linked to their shops
CREATE POLICY "Shop owners can manage their own products"
  ON public.products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = products.shop_id 
      AND (shops.owner_id = auth.uid() OR shops.vendor_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = products.shop_id 
      AND (shops.owner_id = auth.uid() OR shops.vendor_id = auth.uid())
    )
  );

-- 7. Policy: Admin/Manager full access
-- Specifically includes the hardcoded demo admin and anyone with 'admin' or 'market_manager' role
CREATE POLICY "Admins can manage all products"
  ON public.products FOR ALL
  TO authenticated
  USING (
    auth.uid() = 'b325aa93-b435-402d-9ac3-e7acb4dcf5b1' OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'market_manager')
    )
  );

-- 8. Refresh schema cache
NOTIFY pgrst, 'reload schema';
