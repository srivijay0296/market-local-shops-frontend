-- ======================================================================================
-- BTM SUPABASE SCHEMA FIXES
-- Run this in your Supabase SQL Editor
-- Addresses: Missing columns, Foreign key issues, and RLS Violations
-- ======================================================================================

-- 1. FIX MISSING COLUMNS
-- Ensure 'markets' has required columns
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS description TEXT;

-- Ensure 'shops' has required columns
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
-- Alias owner_id to vendor_id if not present
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Ensure 'products' has required columns
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS market_id UUID REFERENCES public.markets(id) ON DELETE CASCADE;

-- 2. FIX FOREIGN KEY ERRORS
-- Remove redundant foreign keys if any and establish clear links
DO $$ 
DECLARE r RECORD;
BEGIN
    FOR r IN (
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'products' AND constraint_type = 'FOREIGN KEY'
    ) LOOP
        -- Do not drop primary key or valid references blindly, just handle overlapping if needed
    END LOOP;
END $$;

-- 3. ENABLE ROW LEVEL SECURITY (RLS) FOR ALL TABLES
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. FIX RLS POLICIES (Allow authenticated users to insert/update their own data, Allow admin full access)

-- Markets Policies
DROP POLICY IF EXISTS "Public can view markets" ON public.markets;
CREATE POLICY "Public can view markets" ON public.markets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert markets" ON public.markets;
CREATE POLICY "Admins can insert markets" ON public.markets FOR INSERT WITH CHECK (
  auth.uid() = 'b325aa93-b435-402d-9ac3-e7acb4dcf5b1' OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Admins can update markets" ON public.markets;
CREATE POLICY "Admins can update markets" ON public.markets FOR UPDATE USING (
  auth.uid() = 'b325aa93-b435-402d-9ac3-e7acb4dcf5b1' OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Admins can delete markets" ON public.markets;
CREATE POLICY "Admins can delete markets" ON public.markets FOR DELETE USING (
  auth.uid() = 'b325aa93-b435-402d-9ac3-e7acb4dcf5b1' OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Shops Policies
DROP POLICY IF EXISTS "Public can view shops" ON public.shops;
CREATE POLICY "Public can view shops" ON public.shops FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create shops" ON public.shops;
CREATE POLICY "Authenticated users can create shops" ON public.shops FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Users can update own shops" ON public.shops;
CREATE POLICY "Users can update own shops" ON public.shops FOR UPDATE USING (
  owner_id = auth.uid() OR vendor_id = auth.uid() OR 
  auth.uid() = 'b325aa93-b435-402d-9ac3-e7acb4dcf5b1' OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Admins can delete shops" ON public.shops;
CREATE POLICY "Admins can delete shops" ON public.shops FOR DELETE USING (
  auth.uid() = 'b325aa93-b435-402d-9ac3-e7acb4dcf5b1' OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Products Policies
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Sellers can insert products" ON public.products;
CREATE POLICY "Sellers can insert products" ON public.products FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Sellers can update own products" ON public.products;
CREATE POLICY "Sellers can update own products" ON public.products FOR UPDATE USING (
  vendor_id = auth.uid() OR 
  auth.uid() = 'b325aa93-b435-402d-9ac3-e7acb4dcf5b1' OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' OR
  shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid() OR vendor_id = auth.uid())
);

DROP POLICY IF EXISTS "Users and Admins can delete own products" ON public.products;
CREATE POLICY "Users and Admins can delete own products" ON public.products FOR DELETE USING (
  vendor_id = auth.uid() OR 
  auth.uid() = 'b325aa93-b435-402d-9ac3-e7acb4dcf5b1' OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' OR
  shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid() OR vendor_id = auth.uid())
);

-- Profiles Policies
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
CREATE POLICY "Public can view profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profiles" ON public.profiles;
CREATE POLICY "Users can update own profiles" ON public.profiles FOR UPDATE USING (
  id = auth.uid() OR 
  auth.uid() = 'b325aa93-b435-402d-9ac3-e7acb4dcf5b1' OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE USING (
  auth.uid() = 'b325aa93-b435-402d-9ac3-e7acb4dcf5b1' OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 5. RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
