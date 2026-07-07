-- Factory Feed System Migration Script
-- Execute this in the Supabase SQL Editor

-- 1. ENHANCE SELLER_POSTS TABLE
-- Add new fields for the advanced feed
ALTER TABLE public.seller_posts 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS price NUMERIC CHECK (price >= 0),
ADD COLUMN IF NOT EXISTS offer_tag TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS media_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Move data from old `caption` to `title` and `description` if necessary
DO $$
BEGIN
    UPDATE public.seller_posts
    SET title = substring(caption for 50),
        description = caption
    WHERE caption IS NOT NULL AND title IS NULL;
END $$;

-- Drop old single media_url if we are only using multi-media now
-- Not dropping to prevent breaking old data, we'll keep it backwards compatible.
-- ALTER TABLE public.seller_posts DROP COLUMN IF EXISTS caption;
-- ALTER TABLE public.seller_posts DROP COLUMN IF EXISTS media_url;

-- 2. CREATE LIKES TABLE
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.seller_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(post_id, user_id)
);

-- 3. CREATE SAVES/BOOKMARKS TABLE  
CREATE TABLE IF NOT EXISTS public.post_saves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.seller_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(post_id, user_id)
);

-- 4. CREATE FOLLOWERS TABLE
CREATE TABLE IF NOT EXISTS public.seller_followers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(seller_id, user_id)
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.seller_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_followers ENABLE ROW LEVEL SECURITY;

-- Post Policies
CREATE POLICY "Anyone can view seller posts" ON public.seller_posts FOR SELECT USING (true);
CREATE POLICY "Sellers can manage their own posts" ON public.seller_posts FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM public.sellers WHERE id = seller_id)
);

-- Like Policies
CREATE POLICY "Anyone can view likes" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users can add/remove their own likes" ON public.post_likes FOR ALL USING (auth.uid() = user_id);

-- Save Policies
CREATE POLICY "Users can manage their own saves" ON public.post_saves FOR ALL USING (auth.uid() = user_id);

-- Follower Policies
CREATE POLICY "Anyone can view followers" ON public.seller_followers FOR SELECT USING (true);
CREATE POLICY "Users can add/remove their own follows" ON public.seller_followers FOR ALL USING (auth.uid() = user_id);

-- Storage bucket for feed media
INSERT INTO storage.buckets (id, name, public) VALUES ('feed_media', 'feed_media', true) ON CONFLICT DO NOTHING;
CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (bucket_id = 'feed_media');
CREATE POLICY "Authenticated Users can upload feed media" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND bucket_id = 'feed_media');
