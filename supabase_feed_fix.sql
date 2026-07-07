-- Ensure 'slug' column in markets exists
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS slug text;
UPDATE public.markets SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;

-- Ensure 'status' column in shops uses correct values from app interface
ALTER TABLE public.shops ALTER COLUMN status SET DEFAULT 'pending';

-- Update existing shops if they have 'active' (my previous script's default) to 'approved'
UPDATE public.shops SET status = 'approved' WHERE status = 'active';

-- Ensure seller_posts table exists for the feed
CREATE TABLE IF NOT EXISTS public.seller_posts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id uuid REFERENCES auth.users(id),
    media_url text,
    media_type text DEFAULT 'image',
    caption text,
    price numeric,
    category text,
    location text,
    created_at timestamptz DEFAULT now()
);

-- RLS for seller_posts
ALTER TABLE public.seller_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Select seller_posts" ON public.seller_posts;
CREATE POLICY "Public Select seller_posts" ON public.seller_posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth Insert seller_posts" ON public.seller_posts;
CREATE POLICY "Auth Insert seller_posts" ON public.seller_posts FOR INSERT WITH CHECK (true);
