-- ================================================================
-- 🔧 SELLERS TABLE COMPLETE FIX
-- ================================================================

-- 1. Create sellers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.sellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL,
  owner_name TEXT,
  gst_number TEXT,
  phone_number TEXT,
  location TEXT,
  description TEXT,
  profile_image TEXT,
  shop_banner TEXT,
  market_id UUID REFERENCES public.markets(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Add missing columns safely (won't error if already exist)
ALTER TABLE public.sellers ADD COLUMN IF NOT EXISTS owner_name TEXT;
ALTER TABLE public.sellers ADD COLUMN IF NOT EXISTS gst_number TEXT;
ALTER TABLE public.sellers ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.sellers ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.sellers ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.sellers ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE public.sellers ADD COLUMN IF NOT EXISTS shop_banner TEXT;
ALTER TABLE public.sellers ADD COLUMN IF NOT EXISTS market_id UUID;
ALTER TABLE public.sellers ADD COLUMN IF NOT EXISTS user_id UUID;

-- 3. Add foreign key for market_id if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name='sellers' AND constraint_name='sellers_market_id_fkey'
  ) THEN
    ALTER TABLE public.sellers 
    ADD CONSTRAINT sellers_market_id_fkey 
    FOREIGN KEY (market_id) REFERENCES public.markets(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'FK already exists or markets table not found, skipping.';
END $$;

-- 4. Create unique constraint on user_id (one seller profile per user)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name='sellers' AND constraint_name='sellers_user_id_key'
  ) THEN
    ALTER TABLE public.sellers ADD CONSTRAINT sellers_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Create index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_sellers_user_id ON public.sellers(user_id);

-- 5. Enable RLS
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

-- 6. Drop old broken policies
DROP POLICY IF EXISTS "Sellers Read All" ON public.sellers;
DROP POLICY IF EXISTS "Sellers Write Own" ON public.sellers;
DROP POLICY IF EXISTS "Sellers All Access" ON public.sellers;

-- 7. Create clean RLS policies
-- Anyone can read sellers (public marketplace)
CREATE POLICY "Sellers Read All" ON public.sellers 
FOR SELECT USING (true);

-- Authenticated users can insert their own seller profile
CREATE POLICY "Sellers Insert Own" ON public.sellers 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own seller profile
CREATE POLICY "Sellers Update Own" ON public.sellers 
FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own seller profile
CREATE POLICY "Sellers Delete Own" ON public.sellers 
FOR DELETE USING (auth.uid() = user_id);

-- 8. Refresh schema cache
NOTIFY pgrst, 'reload schema';

SELECT 'Sellers table fixed successfully!' as status;
