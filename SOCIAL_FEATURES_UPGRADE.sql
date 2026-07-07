-- ======================================================================================
-- 🔥 SOCIAL FEATURES UPGRADE: COMMENTS & INTERACTIONS
-- ======================================================================================

-- 1. POST COMMENTS
CREATE TABLE IF NOT EXISTS public.post_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES public.seller_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ENABLE RLS
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- 3. PERMISSIVE POLICY (For dev)
DROP POLICY IF EXISTS "Allow All" ON public.post_comments;
CREATE POLICY "Allow All" ON public.post_comments FOR ALL USING (true) WITH CHECK (true);

-- 4. REBRANDING METADATA UPDATE (Optional)
UPDATE public.markets SET description = REPLACE(description, 'BTM', 'Namma Market');
UPDATE public.shops SET description = REPLACE(description, 'BTM', 'Namma Market');
