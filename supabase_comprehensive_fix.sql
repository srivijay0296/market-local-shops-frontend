-- ==========================================
-- 1. MARKETS TABLE FIXES
-- ==========================================
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Ensure RLS is enabled and policies are permissive for the demo
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select" ON public.markets;
CREATE POLICY "Allow public select" ON public.markets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all update" ON public.markets;
CREATE POLICY "Allow all update" ON public.markets FOR ALL USING (true);

-- ==========================================
-- 2. SHOPS TABLE FIXES
-- ==========================================
-- Add missing columns to shops
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS vendor_name text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id);
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS market_id uuid REFERENCES public.markets(id);
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Add 'vendor_id' if your code uses it instead of owner_id
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS vendor_id text;

-- Enable RLS and set policies
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all shops" ON public.shops;
CREATE POLICY "Allow all shops" ON public.shops FOR ALL USING (true);

-- ==========================================
-- 3. PRODUCTS TABLE FIXES
-- ==========================================
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS shop_id uuid REFERENCES public.shops(id);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all products" ON public.products;
CREATE POLICY "Allow all products" ON public.products FOR ALL USING (true);

-- ==========================================
-- 4. STORAGE BUCKET FIXES
-- ==========================================
-- Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('market-images', 'market-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing complex policies for clean state
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Delete" ON storage.objects;

-- Create simple permissive policies for development
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (true);
CREATE POLICY "Allow Public Upload" ON storage.objects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Public Update" ON storage.objects FOR UPDATE WITH CHECK (true);
CREATE POLICY "Allow Public Delete" ON storage.objects FOR DELETE USING (true);
