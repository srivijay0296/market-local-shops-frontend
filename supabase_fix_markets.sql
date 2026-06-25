-- FIX 1: Add missing 'description' column to markets table
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS description text;

-- FIX 2: Storage Bucket Creation & Public Access
-- Ensure 'market-images' bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('market-images', 'market-images', true)
ON CONFLICT (id) DO NOTHING;

-- FIX 3: Storage RLS Policies (Allow public uploads for demo/admin)
-- Remove existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Delete" ON storage.objects;

-- Create policies for public access (adjust to 'authenticated' if security is needed)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'market-images');
CREATE POLICY "Allow Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'market-images');
CREATE POLICY "Allow Public Update" ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'market-images');
CREATE POLICY "Allow Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'market-images');

-- FIX 4: Table RLS for Markets
-- Ensure RLS is enabled
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view markets
DROP POLICY IF EXISTS "Allow public select" ON public.markets;
CREATE POLICY "Allow public select" ON public.markets FOR SELECT USING (true);

-- Allow authenticated users (or everyone for demo) to update markets
DROP POLICY IF EXISTS "Allow all update" ON public.markets;
CREATE POLICY "Allow all update" ON public.markets FOR ALL USING (true);
