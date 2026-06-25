-- ======================================================================================
-- 🔥 SUPABASE MASTER FIX (ALL-IN-ONE REPAIR)
-- Run this ENTIRE script in Supabase SQL Editor to fix Table, RLS, and Storage issues.
-- ======================================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ADMIN HELPER FUNCTION (Bypasses recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT (raw_user_meta_data->>'role')::text = 'admin'
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. TABLE DEFINITIONS (Idempotent)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  name text,
  email text,
  role text DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin', 'market_manager')),
  phone text,
  aadhaar_id text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.markets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  location text,
  description text,
  image_url text,
  cover_image text,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.shops (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  market_id uuid REFERENCES public.markets(id) ON DELETE SET NULL,
  owner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  name text NOT NULL,
  description text,
  category text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  image_url text,
  cover_image text,
  location text,
  phone text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  category text,
  stock integer DEFAULT 0,
  images text[] DEFAULT '{}',
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cart (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.shop_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  shop_name text NOT NULL,
  phone text NOT NULL,
  aadhaar_id text,
  market_id uuid REFERENCES public.markets(id) ON DELETE SET NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ENABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_requests ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES (Robust & Clean)

-- Profiles
DROP POLICY IF EXISTS "Profiles: Public insert" ON public.profiles;
CREATE POLICY "Profiles: Public insert" ON public.profiles FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Profiles: Owner/Admin view" ON public.profiles;
CREATE POLICY "Profiles: Owner/Admin view" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
DROP POLICY IF EXISTS "Profiles: Owner/Admin update" ON public.profiles;
CREATE POLICY "Profiles: Owner/Admin update" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- Markets (Public View)
DROP POLICY IF EXISTS "Markets: Public View" ON public.markets;
CREATE POLICY "Markets: Public View" ON public.markets FOR SELECT USING (true);
DROP POLICY IF EXISTS "Markets: Admin All" ON public.markets;
CREATE POLICY "Markets: Admin All" ON public.markets FOR ALL USING (public.is_admin());

-- Shops
DROP POLICY IF EXISTS "Shops: Public View" ON public.shops;
CREATE POLICY "Shops: Public View" ON public.shops FOR SELECT USING (true);
DROP POLICY IF EXISTS "Shops: Owner/Admin All" ON public.shops;
CREATE POLICY "Shops: Owner/Admin All" ON public.shops FOR ALL USING (auth.uid() = owner_id OR public.is_admin());
DROP POLICY IF EXISTS "Shops: Authenticated Insert" ON public.shops;
CREATE POLICY "Shops: Authenticated Insert" ON public.shops FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Products
DROP POLICY IF EXISTS "Products: Public View" ON public.products;
CREATE POLICY "Products: Public View" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Products: Shop Owner All" ON public.products;
CREATE POLICY "Products: Shop Owner All" ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.shops WHERE id = shop_id AND owner_id = auth.uid()) OR public.is_admin()
);

-- Product Images
DROP POLICY IF EXISTS "Product Images: Public View" ON public.product_images;
CREATE POLICY "Product Images: Public View" ON public.product_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Product Images: Owner All" ON public.product_images;
CREATE POLICY "Product Images: Owner All" ON public.product_images FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.products p 
    JOIN public.shops s ON p.shop_id = s.id 
    WHERE p.id = product_id AND s.owner_id = auth.uid()
  ) OR public.is_admin()
);

-- Cart
DROP POLICY IF EXISTS "Cart: Owner All" ON public.cart;
CREATE POLICY "Cart: Owner All" ON public.cart FOR ALL USING (auth.uid() = user_id);

-- Shop Requests
DROP POLICY IF EXISTS "Shop Requests: Authenticated Insert" ON public.shop_requests;
CREATE POLICY "Shop Requests: Authenticated Insert" ON public.shop_requests FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Shop Requests: Owner/Admin Select" ON public.shop_requests;
CREATE POLICY "Shop Requests: Owner/Admin Select" ON public.shop_requests FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Shop Requests: Admin Update" ON public.shop_requests;
CREATE POLICY "Shop Requests: Admin Update" ON public.shop_requests FOR UPDATE USING (public.is_admin());

-- 6. STORAGE SETUP
-- Create buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('market-images', 'market-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('shop-images', 'shop-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('seller-media', 'seller-media', true) ON CONFLICT (id) DO NOTHING;

-- Storage Policies (Permissive for objects)
DO $$ 
BEGIN
  -- Cleanup
  DROP POLICY IF EXISTS "Storage: Public Access" ON storage.objects;
  DROP POLICY IF EXISTS "Storage: Authenticated Upload" ON storage.objects;
  DROP POLICY IF EXISTS "Storage: Owner Delete" ON storage.objects;

  -- Create
  CREATE POLICY "Storage: Public Access" ON storage.objects FOR SELECT USING (true);
  CREATE POLICY "Storage: Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  CREATE POLICY "Storage: Authenticated Update" ON storage.objects FOR UPDATE USING (auth.role() = 'authenticated');
  CREATE POLICY "Storage: Authenticated Delete" ON storage.objects FOR DELETE USING (auth.role() = 'authenticated');
END $$;

-- 7. TRIGGER: AUTO-CREATE PROFILE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 
    new.email, 
    'buyer'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. RELOAD
NOTIFY pgrst, 'reload schema';
