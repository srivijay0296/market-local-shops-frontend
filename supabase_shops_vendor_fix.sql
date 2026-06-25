-- ================================================================
-- FIX MISSING VENDOR_NAME IN SHOPS
-- Run this in your Supabase SQL Editor
-- ================================================================

-- 1. Add missing missing columns to the shops table
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS vendor_name text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS vendor_id uuid;

-- 2. Ensure RLS allows shop creation 
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to create shops
DROP POLICY IF EXISTS "Authenticated users can create shops" ON public.shops;
CREATE POLICY "Authenticated users can create shops"
  ON public.shops FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 3. Refresh schema cache so the frontend knows about the new column immediately
NOTIFY pgrst, 'reload schema';
