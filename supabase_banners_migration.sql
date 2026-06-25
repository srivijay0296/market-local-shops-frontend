-- ==============================================================================
-- BANNERS SYSTEM MIGRATION
-- ==============================================================================

-- 1. Create the banners table
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link TEXT,
    type TEXT NOT NULL CHECK (type IN ('image', 'video')),
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Enable Row Level Security
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- 3. Define RLS Policies
-- Anyone can read the banners (for the homepage)
CREATE POLICY "Public can view banners"
    ON public.banners
    FOR SELECT
    USING (true);

-- Only Admins can insert new banners
CREATE POLICY "Admins can insert banners"
    ON public.banners
    FOR INSERT
    WITH CHECK (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- Only Admins can update banners
CREATE POLICY "Admins can update banners"
    ON public.banners
    FOR UPDATE
    USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- Only Admins can delete banners
CREATE POLICY "Admins can delete banners"
    ON public.banners
    FOR DELETE
    USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- 4. Insert Initial Demo Banners
INSERT INTO public.banners (title, image_url, link, type, sort_order) VALUES
('Welcome to Bargur Textile Market', 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?q=80&w=2670&auto=format&fit=crop', '/products', 'image', 1),
('Discover Premium Silks', 'https://images.unsplash.com/photo-1584443916723-9562a1ba2e31?q=80&w=2670&auto=format&fit=crop', '/search?q=silk', 'image', 2),
('Wholesale Export Ready', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=2572&auto=format&fit=crop', '/sellers', 'image', 3);
