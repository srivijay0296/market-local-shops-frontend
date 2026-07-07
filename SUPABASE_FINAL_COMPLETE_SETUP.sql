-- ======================================================================================
-- 🔥 SUPABASE FINAL COMPLETE SETUP (ALL-IN-ONE)
-- Run this ENTIRE script in Supabase SQL Editor to fix all table and storage issues.
-- ======================================================================================

-- 1. CLEANUP (Optional: Uncomment if you want a totally fresh start)
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;

-- 2. ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. CREATE PROFILES (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  name text,
  email text,
  role text DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin', 'market_manager')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. MARKETS
CREATE TABLE IF NOT EXISTS public.markets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  location text,
  description text,
  image_url text,
  cover_image text,
  phone text,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. SHOPS
CREATE TABLE IF NOT EXISTS public.shops (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  market_id uuid REFERENCES public.markets(id) ON DELETE SET NULL,
  owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  category text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  image_url text,
  vendor_name text,
  location text,
  phone text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT shops_market_id_fkey FOREIGN KEY (market_id) REFERENCES public.markets(id) ON DELETE SET NULL,
  CONSTRAINT shops_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 7. SELLERS (Used by community/social features)
CREATE TABLE IF NOT EXISTS public.sellers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  shop_name text NOT NULL,
  owner_name text,
  gst_number text,
  phone_number text,
  location text,
  description text,
  profile_image text,
  shop_banner text,
  market_id uuid REFERENCES public.markets(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. PRODUCTS
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
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT products_shop_id_fkey FOREIGN KEY (shop_id) REFERENCES public.shops(id) ON DELETE CASCADE
);


-- 9. PRODUCT IMAGES (Extra support for multiple images)
CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_amount numeric NOT NULL,
  status text DEFAULT 'pending',
  shipping_address text,
  customer_name text,
  customer_phone text,
  customer_email text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10.1 ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid NOT NULL,
  shop_id uuid,
  quantity integer DEFAULT 1,
  price_at_time numeric NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10.2 ECOM CUSTOMERS (For tracking guest/non-logged users)
CREATE TABLE IF NOT EXISTS public.ecom_customers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text,
  phone text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. CART
CREATE TABLE IF NOT EXISTS public.cart (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, product_id)
);

-- 12. BANNERS (Homepage sliders)
CREATE TABLE IF NOT EXISTS public.banners (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url text NOT NULL,
  active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. SHOP REQUESTS (Onboarding)
CREATE TABLE IF NOT EXISTS public.shop_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  market_id uuid REFERENCES public.markets(id) ON DELETE SET NULL,
  shop_name text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. SELLER POSTS (Community Feed)
CREATE TABLE IF NOT EXISTS public.seller_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id uuid REFERENCES public.sellers(id) ON DELETE CASCADE NOT NULL,
  title text,
  caption text,
  description text,
  category text,
  price numeric,
  offer_tag text,
  location text,
  media_urls text[] DEFAULT '{}',
  media_url text,
  media_type text DEFAULT 'image',
  video_url text,
  status text DEFAULT 'approved',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. POST INTERACTIONS
CREATE TABLE IF NOT EXISTS public.post_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES public.seller_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.post_saves (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES public.seller_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(post_id, user_id)
);

-- 16. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan text NOT NULL,
  status text DEFAULT 'active',
  start_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  end_date timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─────────────────────────────────────────────────────────────────
-- 🔥 ENABLE ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecom_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────
-- 🔥 PERMISSIVE POLICIES (FOR DEVELOPMENT)
-- ─────────────────────────────────────────────────────────────────
-- Note: In production, you would restrict INSERT/UPDATE/DELETE to owners/admins
DO $$ 
DECLARE 
  t text;
BEGIN
  FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' 
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "Allow All" ON public.' || t;
    EXECUTE 'CREATE POLICY "Allow All" ON public.' || t || ' FOR ALL USING (true) WITH CHECK (true)';
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────
-- 🔥 STORAGE SETUP
-- ─────────────────────────────────────────────────────────────────

-- Create Buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('market-images', 'market-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('product_images', 'product_images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('seller-media', 'seller-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public Access" ON storage.objects;
  CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (true);
  
  DROP POLICY IF EXISTS "Allow All" ON storage.objects;
  CREATE POLICY "Allow All" ON storage.objects FOR ALL USING (true) WITH CHECK (true);
END $$;

-- ─────────────────────────────────────────────────────────────────
-- 🔥 CORE TRIGGERS
-- ─────────────────────────────────────────────────────────────────

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', 'Bargur Local'), 
    new.email, 
    'buyer'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────
-- 🔥 INITIAL DATA SEED
-- ─────────────────────────────────────────────────────────────────
INSERT INTO public.markets (name, slug, location, description)
VALUES 
('Bargur Textile Hub', 'bargur-textile-hub', 'NH 48 Road, Bargur', 'The central wholesale market for silk and cotton.'),
('Grand Bazaar', 'grand-bazaar', 'Market Street, Bargur', 'Traditional artifacts and local produce since 1980.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (name)
VALUES ('Silk Sarees'), ('Cotton Fabrics'), ('Menswear'), ('Wholesale')
ON CONFLICT (name) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────
-- 🔥 FINAL SYNC
-- ─────────────────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
