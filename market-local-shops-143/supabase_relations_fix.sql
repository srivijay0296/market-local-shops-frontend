-- ======================================================================================
-- BTM ADVANCED SCHEMA RELATIONSHIP FIX (Fixes PostgREST Cache & Foreign Keys)
-- Run this completely in your Supabase SQL Editor.
-- ======================================================================================

-- 1. ENSURE USERS (OR PROFILES) TABLE EXISTS
-- Many auth setups use public.users or public.profiles. We will establish public.users here.
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'buyer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. FIX MARKETS TABLE
CREATE TABLE IF NOT EXISTS public.markets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. FIX VENDORS -> USERS RELATIONSHIP
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  shop_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safely drop old constraint if it exists, then add the correct one
ALTER TABLE public.vendors DROP CONSTRAINT IF EXISTS vendors_user_id_fkey;
ALTER TABLE public.vendors ADD CONSTRAINT vendors_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- 4. FIX SHOPS -> MARKETS RELATIONSHIP
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  market_id UUID,
  owner_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safely drop old keys and add valid Foreign Keys
ALTER TABLE public.shops DROP CONSTRAINT IF EXISTS shops_market_id_fkey;
ALTER TABLE public.shops ADD CONSTRAINT shops_market_id_fkey 
  FOREIGN KEY (market_id) REFERENCES public.markets(id) ON DELETE CASCADE;

ALTER TABLE public.shops DROP CONSTRAINT IF EXISTS shops_owner_id_fkey;
ALTER TABLE public.shops ADD CONSTRAINT shops_owner_id_fkey 
  FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- 5. FIX PRODUCTS -> SHOPS RELATIONSHIP
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID,
  seller_id UUID,
  title TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safely link Products to Shops and Users (Sellers)
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_shop_id_fkey;
ALTER TABLE public.products ADD CONSTRAINT products_shop_id_fkey 
  FOREIGN KEY (shop_id) REFERENCES public.shops(id) ON DELETE CASCADE;

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_seller_id_fkey;
ALTER TABLE public.products ADD CONSTRAINT products_seller_id_fkey 
  FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- 6. RELOAD SCHEMA CACHE
-- This is critical! It forces Supabase PostgREST api to recognize the new Foreign Keys
-- allowing queries like supabase.from('products').select("*, shops(*)") to work instantly.
NOTIFY pgrst, 'reload schema';
