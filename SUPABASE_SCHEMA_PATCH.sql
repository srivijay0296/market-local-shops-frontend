-- 🔥 MEGA HEAL: PATCH FOR MISSING TABLES/COLUMNS
-- Run this if you see 400 (Bad Request) errors related to missing columns.

-- 1. Ensure 'shops' has 'location' and 'address'
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='location') THEN
    ALTER TABLE public.shops ADD COLUMN location text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='address') THEN
    ALTER TABLE public.shops ADD COLUMN address text;
  END IF;
END $$;

-- 2. CREATE SELLER POSTS (If missing)
CREATE TABLE IF NOT EXISTS public.seller_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  caption text,
  media_url text,
  media_type text DEFAULT 'image',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ENABLE RLS ON SELLER POSTS
ALTER TABLE public.seller_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public posts are viewable" ON public.seller_posts FOR SELECT USING (true);
CREATE POLICY "Sellers manage own posts" ON public.seller_posts FOR ALL USING (auth.uid() = seller_id);
