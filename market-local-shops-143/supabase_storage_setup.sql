-- ======================================================================================
-- SUPABASE STORAGE SETUP
-- Run this in your Supabase SQL Editor to ensure buckets exist and are public.
-- ======================================================================================

-- 1. CREATE 'products' BUCKET IF NOT EXISTS
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. ALLOW PUBLIC FILE READS
CREATE POLICY "Public Read Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'products');

-- 3. ALLOW AUTHENTICATED FILE UPLOADS
CREATE POLICY "Authenticated Upload Access" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

-- 4. ALLOW AUTHENTICATED FILE UPDATES / DELETIONS
CREATE POLICY "Authenticated Modify Access" ON storage.objects
    FOR UPDATE USING (bucket_id = 'products' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated Removal Access" ON storage.objects
    FOR DELETE USING (bucket_id = 'products' AND auth.role() = 'authenticated');

-- 5. RELOAD CACHE
NOTIFY pgrst, 'reload schema';
