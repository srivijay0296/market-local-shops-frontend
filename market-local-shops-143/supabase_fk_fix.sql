-- ================================================================
-- FIX DUPLICATE FOREIGN KEY CONSTRAINTS 
-- Run this in your Supabase SQL Editor
-- ================================================================

-- This fixes the PGRST201 error: "Could not embed because more than one relationship was found for 'shops' and 'markets'"

-- 1. Drop ALL potentially duplicate foreign keys between shops and markets
ALTER TABLE public.shops DROP CONSTRAINT IF EXISTS fk_market;
ALTER TABLE public.shops DROP CONSTRAINT IF EXISTS shops_market_id_fkey;
ALTER TABLE public.shops DROP CONSTRAINT IF EXISTS shops_market_id_fkey1;

-- 2. Add just ONE clean foreign key constraint
ALTER TABLE public.shops
ADD CONSTRAINT shops_market_id_fkey 
FOREIGN KEY (market_id) REFERENCES public.markets(id) ON DELETE SET NULL;

-- 3. Reload the schema so Supabase updates its API
NOTIFY pgrst, 'reload schema';
