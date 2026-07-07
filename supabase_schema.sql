-- Create custom extension for UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Extends Supabase Auth)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('buyer', 'seller', 'admin', 'market_manager')) DEFAULT 'buyer',
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Vendors table
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert initial categories
INSERT INTO public.categories (name, description) VALUES
('Sarees', 'Various kinds of sarees including silk, cotton, etc.'),
('Cotton', 'Cotton fabrics and textiles'),
('Silk', 'Premium silk materials'),
('Wholesale', 'Bulk materials for wholesale buyers');

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  shipping_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Order Items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price_at_time DECIMAL(10, 2) NOT NULL
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (permissive for development, tighten in production)
CREATE POLICY "Allow public read of categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public read of products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public read of vendors" ON public.vendors FOR SELECT USING (true);

-- Allow users to read and update their own profiles
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Allow vendors to manage their own products
CREATE POLICY "Vendors can insert products" ON public.products FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id)
);
CREATE POLICY "Vendors can update own products" ON public.products FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id)
);
CREATE POLICY "Vendors can delete own products" ON public.products FOR DELETE USING (
  auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id)
);

-- Create a trigger to automatically create a user record upon signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email, COALESCE(new.raw_user_meta_data->>'role', 'buyer'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Setup Storage for product images
INSERT INTO storage.buckets (id, name) VALUES ('product_images', 'product_images') ON CONFLICT DO NOTHING;
CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (bucket_id = 'product_images');
CREATE POLICY "Authenticated Users can upload images" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND bucket_id = 'product_images');
