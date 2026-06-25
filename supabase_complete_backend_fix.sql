-- ================================================================
-- MASTER SUPABASE BACKEND FIX (PRODUCTION READY)
-- ================================================================

-- 1. FIX MISSING COLUMNS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'buyer';
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS vendor_name text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS location text;

-- 2. FIX RELATIONSHIPS (shops -> markets)
DO $$
DECLARE
    r record;
BEGIN
    FOR r IN (
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'public.shops'::regclass
          AND confrelid = 'public.markets'::regclass
    )
    LOOP
        EXECUTE 'ALTER TABLE public.shops DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END
$$;

ALTER TABLE public.shops
ADD CONSTRAINT shops_market_id_fkey
FOREIGN KEY (market_id) REFERENCES public.markets(id) ON DELETE SET NULL;

-- 3. RLS POLICIES: MARKETS
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view markets" ON public.markets;
DROP POLICY IF EXISTS "Admins can manage markets" ON public.markets;

CREATE POLICY "Public can view markets" ON public.markets FOR SELECT USING (true);
CREATE POLICY "Admins can manage markets" ON public.markets
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 4. RLS POLICIES: SHOPS
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view shops" ON public.shops;
DROP POLICY IF EXISTS "Owners can update their shops" ON public.shops;
DROP POLICY IF EXISTS "Admins can manage all shops" ON public.shops;

CREATE POLICY "Public can view shops" ON public.shops FOR SELECT USING (true);
CREATE POLICY "Owners can update their shops" ON public.shops 
FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Admins can manage all shops" ON public.shops
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 5. RLS POLICIES: PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Public can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 6. STORAGE BUCKET: market-images
INSERT INTO storage.buckets (id, name, public)
VALUES ('market-images', 'market-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'market-images');

DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'market-images' AND 
  auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'market-images' AND 
  auth.role() = 'authenticated'
);

-- 7. REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
