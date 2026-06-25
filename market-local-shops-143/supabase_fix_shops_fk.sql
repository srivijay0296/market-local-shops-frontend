-- ================================================================
-- FOREIGN KEY CONFLICT RESOLUTION SCRIPT (PGRST201 FIX)
-- Run this in your Supabase Dashboard -> SQL Editor
-- ================================================================

-- This script uses an anonymous PL/pgSQL block to hunt down 
-- and delete EVERY foreign key constraint connecting 'shops' to 'markets'.
DO $$
DECLARE
    row_record record;
BEGIN
    FOR row_record IN (
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'public.shops'::regclass
          AND confrelid = 'public.markets'::regclass
    )
    LOOP
        EXECUTE 'ALTER TABLE public.shops DROP CONSTRAINT ' || quote_ident(row_record.conname);
    END LOOP;
END
$$;

-- With the slate wiped clean, we explicitly establish the SINGLE correct relationship.
ALTER TABLE public.shops
ADD CONSTRAINT shops_market_id_fkey
FOREIGN KEY (market_id) REFERENCES public.markets(id) ON DELETE CASCADE;

-- Reload the PostgREST schema cache to instantly clear the PGRST201 error
NOTIFY pgrst, 'reload schema';
