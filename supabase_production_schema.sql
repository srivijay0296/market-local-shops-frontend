-- =========================================================================================
-- MARKETPLACE PRODUCTION SCHEMA 
-- Run this in the Supabase SQL Editor to establish a production-ready database structure.
-- =========================================================================================

-- =========================================================================================
-- 1. EXTENSIONS & BASICS
-- =========================================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================================
-- 2. CREATE TABLES
-- =========================================================================================

-- A. Profiles (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  phone text,
  role text DEFAULT 'buyer',
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- B. Markets (Bazaar Zones)
CREATE TABLE IF NOT EXISTS public.markets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  location text,
  image_url text,
  cover_image text,
  phone text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- C. Shops (Individual Boutiques/Vendors)
CREATE TABLE IF NOT EXISTS public.shops (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  market_id uuid REFERENCES public.markets(id) ON DELETE SET NULL,
  owner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  vendor_name text,
  description text,
  category text,
  status text DEFAULT 'pending',
  location text,
  address text,
  phone text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- D. Products
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  category text,
  stock integer DEFAULT 1 CHECK (stock >= 0),
  images text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- =========================================================================================
-- 3. TRIGGERS (Auto-Create Profile)
-- =========================================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =========================================================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Flush existing policies
DROP POLICY IF EXISTS "Public can view profiles" ON profiles; DROP POLICY IF EXISTS "Users update own profile" ON profiles; DROP POLICY IF EXISTS "Admins manage profiles" ON profiles;
DROP POLICY IF EXISTS "Public read markets" ON markets; DROP POLICY IF EXISTS "Admins manage markets" ON markets;
DROP POLICY IF EXISTS "Public read shops" ON shops; DROP POLICY IF EXISTS "Owners manage shops" ON shops; DROP POLICY IF EXISTS "Admins manage shops" ON shops;
DROP POLICY IF EXISTS "Public read products" ON products; DROP POLICY IF EXISTS "Owners manage products" ON products; DROP POLICY IF EXISTS "Admins manage products" ON products;

-- Profiles RLS
CREATE POLICY "Public can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins manage profiles" ON public.profiles FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Markets RLS (Public Read, Admin Write)
CREATE POLICY "Public read markets" ON public.markets FOR SELECT USING (true);
CREATE POLICY "Admins manage markets" ON public.markets FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Shops RLS (Public Read, Owner Manage, Admin Manage)
CREATE POLICY "Public read shops" ON public.shops FOR SELECT USING (true);
CREATE POLICY "Owners manage shops" ON public.shops FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Admins manage shops" ON public.shops FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Products RLS (Public Read, Owner Manage, Admin Manage)
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Owners manage products" ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.shops WHERE shops.id = products.shop_id AND shops.owner_id = auth.uid())
);
CREATE POLICY "Admins manage products" ON public.products FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- =========================================================================================
-- 5. PERFORMANCE INDEXES
-- =========================================================================================
CREATE INDEX IF NOT EXISTS idx_markets_slug ON public.markets(slug);
CREATE INDEX IF NOT EXISTS idx_shops_market_id ON public.shops(market_id);
CREATE INDEX IF NOT EXISTS idx_shops_owner_id ON public.shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON public.products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- =========================================================================================
-- 6. STORAGE CONFIGURATION
-- =========================================================================================

-- Create the market-images bucket (Does nothing if it exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('market-images', 'market-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create the products bucket (Does nothing if it exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Flush existing storage policies
DROP POLICY IF EXISTS "Public Image Read" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Image Upload" ON storage.objects;
DROP POLICY IF EXISTS "Owner Image Delete" ON storage.objects;

-- Storage Rules (Public Read, Auth Upload)
CREATE POLICY "Public Image Read" ON storage.objects FOR SELECT USING (bucket_id IN ('market-images', 'products'));
CREATE POLICY "Authenticated Image Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('market-images', 'products'));
CREATE POLICY "Owner Image Delete" ON storage.objects FOR DELETE TO authenticated USING (auth.uid() = owner);

-- =========================================================================================
-- 7. REFRESH CACHE
-- =========================================================================================
NOTIFY pgrst, 'reload schema';
