-- ================================================================
-- FIX DUPLICATE FOREIGN KEY CONSTRAINTS (PGRST201)
-- Run this in your Supabase SQL Editor
-- ================================================================

DO $$ 
DECLARE
  rec record;
BEGIN
  -------------------------------------------------------------
  -- 1. Find and Drop ALL foreign keys from `shops` to `markets`
  -------------------------------------------------------------
  FOR rec IN 
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'public.shops'::regclass 
      AND confrelid = 'public.markets'::regclass
  LOOP
    EXECUTE 'ALTER TABLE public.shops DROP CONSTRAINT ' || quote_ident(rec.conname);
  END LOOP;

  -------------------------------------------------------------
  -- 2. Find and Drop ALL foreign keys from `products` to `shops`
  -- (Just in case the same duplication issue exists there)
  -------------------------------------------------------------
  FOR rec IN 
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'public.products'::regclass 
      AND confrelid = 'public.shops'::regclass
  LOOP
    EXECUTE 'ALTER TABLE public.products DROP CONSTRAINT ' || quote_ident(rec.conname);
  END LOOP;

  -------------------------------------------------------------
  -- 3. Find and Drop ALL foreign keys from `shops` to `profiles`
  -------------------------------------------------------------
  FOR rec IN 
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'public.shops'::regclass 
      AND confrelid = 'public.profiles'::regclass
  LOOP
    EXECUTE 'ALTER TABLE public.shops DROP CONSTRAINT ' || quote_ident(rec.conname);
  END LOOP;
END $$;

-------------------------------------------------------------
-- 4. Re-establish exactly ONE of each necessary relationship
-------------------------------------------------------------
ALTER TABLE public.shops 
  ADD CONSTRAINT shops_market_id_fkey 
  FOREIGN KEY (market_id) REFERENCES public.markets(id) ON DELETE SET NULL;

ALTER TABLE public.shops 
  ADD CONSTRAINT shops_owner_id_fkey 
  FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.products 
  ADD CONSTRAINT products_shop_id_fkey 
  FOREIGN KEY (shop_id) REFERENCES public.shops(id) ON DELETE CASCADE;

-------------------------------------------------------------
-- 5. Reload Schema Cache
-------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
