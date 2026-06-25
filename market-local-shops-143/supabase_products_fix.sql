-- ================================================================
-- FIX PRODUCT INSERT ERROR - Run in Supabase SQL Editor
-- ================================================================

-- 1. Ensure products table has all required columns with defaults
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock integer DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category text;

-- 2. Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. Drop old policies (clean slate)
DROP POLICY IF EXISTS "Products are visible to everyone" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
DROP POLICY IF EXISTS "Owners can update their products" ON public.products;
DROP POLICY IF EXISTS "Owners can delete their products" ON public.products;

-- 4. Allow anyone to READ products (public marketplace)
CREATE POLICY "Products are visible to everyone"
  ON public.products FOR SELECT
  USING (true);

-- 5. Allow AUTHENTICATED users to INSERT products 
-- (This is what was blocking your "Add Product" button)
CREATE POLICY "Authenticated users can insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 6. Allow admins to UPDATE any product
CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'seller', 'market_manager')
    )
  );

-- 7. Allow admins to DELETE products
CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'market_manager')
    )
  );

-- 8. Refresh API schema cache
NOTIFY pgrst, 'reload schema';
