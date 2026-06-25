-- ======================================================================================
-- 🚀 BTM MARKETPLACE - COMPLETE DATABASE & STORAGE SCHEMA
-- ======================================================================================
-- This script prepares your Supabase backend for a full production-ready marketplace.
-- 1. Creates all necessary tables with relationships.
-- 2. Sets up the 'market-images' storage bucket.
-- 3. Configures RLS policies for security.

-- =============================================
-- 1️⃣ CLEANUP (Optional - Use with Caution)
-- =============================================
-- DROP TABLE IF EXISTS public.products CASCADE;
-- DROP TABLE IF EXISTS public.shops CASCADE;
-- DROP TABLE IF EXISTS public.markets CASCADE;
-- DROP TABLE IF EXISTS public.sellers CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;

-- =============================================
-- 2️⃣ CORE TABLES
-- =============================================

-- ✅ MARKETS (The physical market locations)
CREATE TABLE IF NOT EXISTS public.markets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    location TEXT,
    description TEXT,
    image_url TEXT,
    cover_image TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ✅ PROFILES (Extended User Info)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'seller', 'admin')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ✅ SHOPS (Vendors/Shops within a Market)
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    market_id UUID REFERENCES public.markets(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    location TEXT, -- Internal shop location (e.g. Shop No. 12)
    phone TEXT,
    image_url TEXT,
    cover_image TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ✅ PRODUCTS (Items listed for sale)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category TEXT,
    stock INTEGER DEFAULT 100,
    images TEXT[] DEFAULT '{}', -- Supports multiple images
    image_url TEXT, -- Fallback for single image
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'out_of_stock', 'discontinued')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 3️⃣ STORAGE SETUP ('market-images' bucket)
-- =============================================

-- Ensure bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('market-images', 'market-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Remove old policies to prevent identity conflicts
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public Read" ON storage.objects;
    DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;
    DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;
END $$;

-- Policies for storage.objects
CREATE POLICY "Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'market-images');
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'market-images' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE USING (bucket_id = 'market-images' AND auth.role() = 'authenticated');

-- =============================================
-- 4️⃣ RLS (Row Level Security)
-- =============================================

-- Enable RLS
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- ✅ PUBLIC VIEWING POLICIES
CREATE POLICY "Public Markets View" ON public.markets FOR SELECT USING (true);
CREATE POLICY "Public Shops View" ON public.shops FOR SELECT USING (status = 'approved');
CREATE POLICY "Public Products View" ON public.products FOR SELECT USING (true);

-- ✅ ADMIN POLICIES
CREATE POLICY "Admin Markets All" ON public.markets FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin Shops All" ON public.shops FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin Products All" ON public.products FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ✅ SELLER POLICIES
CREATE POLICY "Seller Manage Own Shop" ON public.shops FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "Seller Manage Own Products" ON public.products FOR ALL USING (
    EXISTS (SELECT 1 FROM public.shops WHERE id = public.products.shop_id AND owner_id = auth.uid())
);

-- =============================================
-- 5️⃣ HELPER VIEWS / TRIGGERS
-- =============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =============================================
-- 🚀 REFRESH CACHE
-- =============================================
NOTIFY pgrst, 'reload schema';
