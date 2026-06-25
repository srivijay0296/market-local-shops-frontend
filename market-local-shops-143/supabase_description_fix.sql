-- ============================================================
-- FIX: "Could not find 'description' column in markets"
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================================

-- STEP 1: Add missing columns to markets table
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- STEP 2: Refresh PostgREST schema cache (CRITICAL!)
-- This tells Supabase to recognize the new columns immediately.
NOTIFY pgrst, 'reload schema';

-- STEP 3: Fix RLS so admin can read/write without restriction
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read markets" ON public.markets;
CREATE POLICY "Public read markets" 
  ON public.markets FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Admin full access markets" ON public.markets;
CREATE POLICY "Admin full access markets" 
  ON public.markets FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- STEP 4: Verify columns now exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'markets'
ORDER BY ordinal_position;
