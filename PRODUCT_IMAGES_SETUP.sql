-- ====================================================
-- BTM Marketplace: product_images table setup
-- Run this in Supabase SQL Editor
-- ====================================================

-- 1. Create product_images table
CREATE TABLE IF NOT EXISTS public.product_images (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id  uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url   text NOT NULL,
  sort_order  int  DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Anyone can view product images (public marketplace)
CREATE POLICY "Public can view product images"
  ON public.product_images FOR SELECT
  USING (true);

-- Authenticated users (sellers/admins) can insert images
CREATE POLICY "Auth users can insert product images"
  ON public.product_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can delete their own product images
CREATE POLICY "Auth users can delete product images"
  ON public.product_images FOR DELETE
  TO authenticated
  USING (true);

-- 4. Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);

-- 5. Verify (optional check query)
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'product_images';
