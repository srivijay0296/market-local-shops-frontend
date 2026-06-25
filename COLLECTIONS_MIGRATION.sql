-- ======================================================================================
-- 🔥 COLLECTIONS & PRODUCT GROUPING
-- ======================================================================================

-- 1. COLLECTIONS
CREATE TABLE IF NOT EXISTS public.collections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. COLLECTION PRODUCTS (Linking table)
CREATE TABLE IF NOT EXISTS public.collection_products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id uuid REFERENCES public.collections(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(collection_id, product_id)
);

-- 3. ENABLE RLS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_products ENABLE ROW LEVEL SECURITY;

-- 4. PERMISSIVE POLICIES
DROP POLICY IF EXISTS "Allow All" ON public.collections;
CREATE POLICY "Allow All" ON public.collections FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All" ON public.collection_products;
CREATE POLICY "Allow All" ON public.collection_products FOR ALL USING (true) WITH CHECK (true);
