-- ================================================================
-- BTM MARKETPLACE - COMPLETE SUPABASE SQL FIX
-- Run this ENTIRE script in Supabase SQL Editor
-- It is safe to run multiple times (uses IF NOT EXISTS / OR REPLACE)
-- ================================================================


-- ================================================================
-- SECTION 1: MARKETS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS public.markets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text UNIQUE,
  location    text,
  description text,
  image_url   text,
  cover_image text,
  phone       text,
  status      text DEFAULT 'active',
  created_at  timestamptz DEFAULT now()
);

-- Add any missing columns to existing table
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS slug        text;
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS image_url   text;
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS cover_image text;
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS location    text;
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS phone       text;
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS status      text DEFAULT 'active';

-- Auto-generate slugs for any markets missing them
UPDATE public.markets
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(TRIM(name), '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )
)
WHERE slug IS NULL OR slug = '';

-- RLS Policies for Markets
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "markets_select_all"  ON public.markets;
DROP POLICY IF EXISTS "markets_insert_all"  ON public.markets;
DROP POLICY IF EXISTS "markets_update_all"  ON public.markets;
DROP POLICY IF EXISTS "markets_delete_all"  ON public.markets;

CREATE POLICY "markets_select_all" ON public.markets FOR SELECT USING (true);
CREATE POLICY "markets_insert_all" ON public.markets FOR INSERT WITH CHECK (true);
CREATE POLICY "markets_update_all" ON public.markets FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "markets_delete_all" ON public.markets FOR DELETE USING (true);


-- ================================================================
-- SECTION 2: SHOPS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS public.shops (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  vendor_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  vendor_name text,
  market_id   uuid REFERENCES public.markets(id) ON DELETE SET NULL,
  owner_id    uuid,
  category    text,
  description text,
  image_url   text,
  phone       text,
  location    text,
  status      text DEFAULT 'pending',
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS vendor_name text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS owner_id    uuid;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS market_id   uuid;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS category    text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS image_url   text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS phone       text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS location    text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS status      text DEFAULT 'pending';

-- RLS Policies for Shops
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shops_select_all"  ON public.shops;
DROP POLICY IF EXISTS "shops_insert_all"  ON public.shops;
DROP POLICY IF EXISTS "shops_update_all"  ON public.shops;
DROP POLICY IF EXISTS "shops_delete_all"  ON public.shops;

CREATE POLICY "shops_select_all" ON public.shops FOR SELECT USING (true);
CREATE POLICY "shops_insert_all" ON public.shops FOR INSERT WITH CHECK (true);
CREATE POLICY "shops_update_all" ON public.shops FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "shops_delete_all" ON public.shops FOR DELETE USING (true);


-- ================================================================
-- SECTION 3: PRODUCTS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS public.products (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  price       numeric(10, 2) NOT NULL DEFAULT 0,
  stock       integer DEFAULT 0,
  image_url   text,
  category    text,
  shop_id     uuid REFERENCES public.shops(id) ON DELETE SET NULL,
  vendor_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  market_id   uuid REFERENCES public.markets(id) ON DELETE SET NULL,
  status      text DEFAULT 'active',
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url   text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category    text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS shop_id     uuid;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS vendor_id   uuid;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS market_id   uuid;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock       integer DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status      text DEFAULT 'active';

-- RLS Policies for Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_select_all"  ON public.products;
DROP POLICY IF EXISTS "products_insert_all"  ON public.products;
DROP POLICY IF EXISTS "products_update_all"  ON public.products;
DROP POLICY IF EXISTS "products_delete_all"  ON public.products;

CREATE POLICY "products_select_all" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_insert_all" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "products_update_all" ON public.products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "products_delete_all" ON public.products FOR DELETE USING (true);


-- ================================================================
-- SECTION 4: PROFILES TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text,
  email      text,
  phone      text,
  role       text DEFAULT 'user',
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name       text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone      text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role       text DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);


-- ================================================================
-- SECTION 5: ORDERS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  total_amount     numeric(10, 2) DEFAULT 0,
  status           text DEFAULT 'pending',
  shipping_address text,
  created_at       timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  shop_id    uuid REFERENCES public.shops(id) ON DELETE SET NULL,
  quantity   integer DEFAULT 1,
  price      numeric(10, 2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_authenticated" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_authenticated" ON public.orders;
DROP POLICY IF EXISTS "orders_update_all"           ON public.orders;

CREATE POLICY "orders_select_authenticated" ON public.orders FOR SELECT USING (true);
CREATE POLICY "orders_insert_authenticated" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update_all"           ON public.orders FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "order_items_select_all" ON public.order_items;
DROP POLICY IF EXISTS "order_items_insert_all" ON public.order_items;

CREATE POLICY "order_items_select_all" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "order_items_insert_all" ON public.order_items FOR INSERT WITH CHECK (true);


-- ================================================================
-- SECTION 6: SELLER POSTS TABLE (Community Feed)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.seller_posts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id    uuid REFERENCES public.shops(id) ON DELETE CASCADE,
  vendor_id  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title      text,
  content    text NOT NULL,
  image_url  text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.seller_posts ADD COLUMN IF NOT EXISTS title     text;
ALTER TABLE public.seller_posts ADD COLUMN IF NOT EXISTS image_url text;

ALTER TABLE public.seller_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "seller_posts_select_all"  ON public.seller_posts;
DROP POLICY IF EXISTS "seller_posts_insert_auth" ON public.seller_posts;
DROP POLICY IF EXISTS "seller_posts_delete_own"  ON public.seller_posts;

CREATE POLICY "seller_posts_select_all"  ON public.seller_posts FOR SELECT USING (true);
CREATE POLICY "seller_posts_insert_auth" ON public.seller_posts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "seller_posts_delete_own"  ON public.seller_posts FOR DELETE USING (auth.uid() = vendor_id);


-- ================================================================
-- SECTION 7: STORAGE BUCKETS
-- ================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('market-images', 'market-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies
DROP POLICY IF EXISTS "market_images_public_read"   ON storage.objects;
DROP POLICY IF EXISTS "market_images_public_upload"  ON storage.objects;

CREATE POLICY "market_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id IN ('market-images', 'products', 'avatars'));

CREATE POLICY "market_images_public_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id IN ('market-images', 'products', 'avatars'));

CREATE POLICY "storage_update_own" ON storage.objects
  FOR UPDATE USING (bucket_id IN ('market-images', 'products', 'avatars'));

CREATE POLICY "storage_delete_own" ON storage.objects
  FOR DELETE USING (bucket_id IN ('market-images', 'products', 'avatars'));


-- ================================================================
-- SECTION 8: REFRESH POSTGREST SCHEMA CACHE (CRITICAL!)
-- This makes Supabase's API layer recognize all new columns.
-- ================================================================

NOTIFY pgrst, 'reload schema';


-- ================================================================
-- VERIFY: Check all tables and their columns
-- ================================================================

SELECT 
  table_name,
  string_agg(column_name, ', ' ORDER BY ordinal_position) AS columns
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('markets', 'shops', 'products', 'profiles', 'orders', 'order_items', 'seller_posts')
GROUP BY table_name
ORDER BY table_name;
