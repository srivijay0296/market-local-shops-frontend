-- ======================================================================================
-- SUPABASE STORAGE SETUP FOR MARKET-IMAGES
-- Run this in your Supabase SQL Editor to ensure buckets exist and are public.
-- ======================================================================================

-- 1. CREATE 'market-images' BUCKET IF NOT EXISTS
INSERT INTO storage.buckets (id, name, public) 
VALUES ('market-images', 'market-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. ALLOW PUBLIC FILE READS
CREATE POLICY "Public Read Access Market Images" ON storage.objects
    FOR SELECT USING (bucket_id = 'market-images');

-- 3. ALLOW AUTHENTICATED FILE UPLOADS
CREATE POLICY "Authenticated Upload Access Market Images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'market-images' AND auth.role() = 'authenticated');

-- 4. ALLOW AUTHENTICATED FILE UPDATES / DELETIONS
CREATE POLICY "Authenticated Modify Access Market Images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'market-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated Removal Access Market Images" ON storage.objects
    FOR DELETE USING (bucket_id = 'market-images' AND auth.role() = 'authenticated');

-- 5. RELOAD CACHE
NOTIFY pgrst, 'reload schema';
