-- ======================================================================================
-- FINAL SHOPS SCHEMA PATCH (V2)
-- Run this in your Supabase SQL Editor to ensure all columns exist with correct types.
-- ======================================================================================

-- 1. ENSURE SHOPS TABLE HAS ALL REQUIRED COLUMNS
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS location TEXT; 
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- 2. ENSURE UUID COLUMNS EXIST (Handle existing ones)
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS market_id UUID REFERENCES public.markets(id);

-- 3. FIX DATA TYPE MISMATCHES (If they were accidentally created as text)
-- Run these one by one if you get "column already exists with different type"
-- ALTER TABLE public.shops ALTER COLUMN owner_id TYPE UUID USING owner_id::uuid;
-- ALTER TABLE public.shops ALTER COLUMN vendor_id TYPE UUID USING vendor_id::uuid;
-- ALTER TABLE public.shops ALTER COLUMN market_id TYPE UUID USING market_id::uuid;

-- 4. RELOAD CACHE
NOTIFY pgrst, 'reload schema';
