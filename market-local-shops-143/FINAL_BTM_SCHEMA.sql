-- ======================================================================================
-- 🔥 FINAL BTM PRODUCTION DB SCHEMA (CLEAN MAPPING) 🔥
-- Run this in Supabase SQL Editor to wipe out 400/404/Relation bugs.
-- ======================================================================================

-- 1. CLEAN UP BAD CONSTRAINTS
-- Drops overlapping/duplicate relationships between products and shops to fix "more than one relationship found"
DO $$ 
DECLARE r RECORD;
BEGIN
    FOR r IN (
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'products' AND constraint_type = 'FOREIGN KEY'
        AND constraint_name != 'products_shop_id_fkey'
    ) LOOP
        EXECUTE 'ALTER TABLE public.products DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name) || ' CASCADE;';
    END LOOP;
END $$;

-- 2. CREATE CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL
);

-- 3. FIX SHOPS (Ensuring location & category exist)
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT,
  category TEXT,
  image_url TEXT,
  description TEXT,
  status TEXT DEFAULT 'approved',
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  market_id UUID REFERENCES public.markets(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- If tables exist, just add columns safely
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 4. FIX PRODUCTS (Ensuring shop_id & category_id explicit linking)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  stock INTEGER DEFAULT 0,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  market_id UUID REFERENCES public.markets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safely add missing columns
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE;

-- 5. APPLY STRICT ROLE TO PROFILES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'buyer';

-- 6. FLUSH API CACHE IMMEDIATELY
NOTIFY pgrst, 'reload schema';
