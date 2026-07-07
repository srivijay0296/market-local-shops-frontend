-- Advanced Multi-Market Platform Migration Script
-- Execute this in the Supabase SQL Editor

-------------------------------------------------------------------------------
-- 1. PUBLIC USERS & ROLES
-------------------------------------------------------------------------------
-- Create a public users table synchronized with auth.users for role management.
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('super_admin', 'admin', 'market_manager', 'vendor', 'customer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies for public users
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.users FOR SELECT USING (true);

-- Trigger to automatically create a public.user when auth.user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'customer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to prevent errors on repeated runs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Backfill existing auth.users into public.users
INSERT INTO public.users (id, email, role)
SELECT id, email, 'customer' FROM auth.users
ON CONFLICT (id) DO NOTHING;

-------------------------------------------------------------------------------
-- 2. VENDORS TABLE ENHANCEMENTS
-------------------------------------------------------------------------------
-- Add verification status and SEO slug for the vendor storefront
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;

ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

DO $$ 
BEGIN 
    -- Quick backfill to generate basic slugs for existing vendors if they don't have one
    UPDATE vendors 
    SET slug = lower(regexp_replace(shop_name, '\s+', '-', 'g')) || '-' || substr(cast(id as text), 1, 4)
    WHERE slug IS NULL;
END $$;

-------------------------------------------------------------------------------
-- 3. PRODUCTS TABLE ENHANCEMENTS
-------------------------------------------------------------------------------
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived'));

-------------------------------------------------------------------------------
-- 4. ORDERS & ORDER ITEMS
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) NOT NULL,
    total_price NUMERIC NOT NULL CHECK (total_price >= 0),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    shipping_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL, -- Keeping record even if product deleted
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL, -- Denormalized for easier vendor queries
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Order Policies: Users can view their own orders
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Order Items Policies: Users can view items attached to their own orders
CREATE POLICY "Users can view their own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert order items for their own orders"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Vendors can view order items containing their products
CREATE POLICY "Vendors can view order items for their products"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = order_items.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );
