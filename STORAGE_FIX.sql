-- ======================================================================================
-- 🔥 STORAGE, SCHEMA & CORS FIX (RUN THIS IN SUPABASE SQL EDITOR)
-- ======================================================================================

-- 1. FIX TABLES (ADD missing columns)
ALTER TABLE IF EXISTS public.markets 
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS description text;

ALTER TABLE IF EXISTS public.shops ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS image_url text;

-- 2. CREATE BUCKET
INSERT INTO storage.buckets (id, name, public) 
VALUES ('market-images', 'market-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. ENABLE PUBLIC UPLOAD/ACCESS POLICIES
DO $$ 
BEGIN
  -- Cleanup old policies
  DROP POLICY IF EXISTS "Public Access" ON storage.objects;
  DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
  DROP POLICY IF EXISTS "Public Delete" ON storage.objects;
  DROP POLICY IF EXISTS "Public Update" ON storage.objects;

  -- Create new permissive policies
  CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (true);
  CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'market-images');
  CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'market-images');
  CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'market-images');
END $$;

-- 4. FIX CORS & AUTH (INSTRUCTIONS)
-- Go to Supabase Dashboard > Authentication > URL Configuration
-- 1. Set "Site URL" to: http://localhost:3000
-- 2. Add to "Redirect URLs": http://localhost:3000/**

-- 5. RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
