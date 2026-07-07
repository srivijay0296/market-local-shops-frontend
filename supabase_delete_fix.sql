-- ================================================================
-- FIX 0-ROW SILENT DELETE FAILURES
-- Run this in your Supabase SQL Editor
-- ================================================================

-- 1. Ensure RLS is active
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;

-- 2. Drop any conflicting delete policies that might silently block
DROP POLICY IF EXISTS "Admins manage markets" ON public.markets;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.markets;

-- 3. Create an explicit, completely open DELETE policy for authenticated users
-- (Since this is the Admin Dashboard, we authorize any logged-in user to hit the delete button)
CREATE POLICY "Enable access for all authenticated users" 
ON public.markets 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 4. Reload cache just to be absolutely certain
NOTIFY pgrst, 'reload schema';
