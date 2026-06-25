-- ================================================================
-- MASTER SCHEMA FIX — Run this ENTIRE script in Supabase SQL Editor
-- Fixes:
--   1. "Could not find 'description' column in markets"
--   2. "Insertion failed: Could not find 'vendor_name' column in shops"
-- ================================================================

-- ───────────────────────────────────────────────
-- MARKETS TABLE — Add missing columns
-- ───────────────────────────────────────────────
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS cover_image text;
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- ───────────────────────────────────────────────
-- SHOPS TABLE — Add missing columns
-- ───────────────────────────────────────────────
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS vendor_name text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS vendor_id uuid;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- ───────────────────────────────────────────────
-- PRODUCTS TABLE — Add missing columns
-- ───────────────────────────────────────────────
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock integer DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category text;

-- ───────────────────────────────────────────────
-- RLS POLICIES — Markets
-- ───────────────────────────────────────────────
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view markets" ON public.markets;
DROP POLICY IF EXISTS "Admins can manage markets" ON public.markets;

CREATE POLICY "Anyone can view markets"
  ON public.markets FOR SELECT USING (true);

CREATE POLICY "Admins can manage markets"
  ON public.markets FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ───────────────────────────────────────────────
-- RLS POLICIES — Shops
-- ───────────────────────────────────────────────
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view approved shops" ON public.shops;
DROP POLICY IF EXISTS "Authenticated users can create shops" ON public.shops;
DROP POLICY IF EXISTS "Admins can manage all shops" ON public.shops;

CREATE POLICY "Anyone can view approved shops"
  ON public.shops FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create shops"
  ON public.shops FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage all shops"
  ON public.shops FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'market_manager'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'market_manager'))
  );

-- ───────────────────────────────────────────────
-- RLS POLICIES — Products
-- ───────────────────────────────────────────────
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Products are visible to everyone" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

CREATE POLICY "Products are visible to everyone"
  ON public.products FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'seller', 'market_manager')));

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'market_manager')));

-- ───────────────────────────────────────────────
-- Fix duplicate FK constraint on shops (resolves PGRST201)
-- ───────────────────────────────────────────────
ALTER TABLE public.shops DROP CONSTRAINT IF EXISTS fk_market;
ALTER TABLE public.shops DROP CONSTRAINT IF EXISTS shops_market_id_fkey;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'shops_market_id_fkey'
    AND table_name = 'shops'
  ) THEN
    ALTER TABLE public.shops
      ADD CONSTRAINT shops_market_id_fkey
      FOREIGN KEY (market_id) REFERENCES public.markets(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ───────────────────────────────────────────────
-- Reload the PostgREST schema cache (CRITICAL!)
-- ───────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
