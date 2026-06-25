-- ======================================================================================
-- PERMISSIVE RLS POLICY (FOR ADMIN/DEMO DEVELOPMENT)
-- Run this in your Supabase SQL Editor to grant full access to authenticated users.
-- ======================================================================================

-- 1. ENABLE RLS FOR ALL RELEVANT TABLES
ALTER TABLE IF EXISTS public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 2. WIPE EXISTING RESTRICTIVE POLICIES
DROP POLICY IF EXISTS "Authenticated users full access" ON public.shops;
DROP POLICY IF EXISTS "Authenticated users full access" ON public.products;
DROP POLICY IF EXISTS "Authenticated users full access" ON public.markets;
DROP POLICY IF EXISTS "Authenticated users full access" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users full access" ON public.subscriptions;

-- 3. CREATE PERMISSIVE "FULL ACCESS" POLICIES FOR AUTHENTICATED USERS
-- This allows anyone logged in (including your admin) to perform ALL operations.

-- Shops
CREATE POLICY "Authenticated users full access" ON public.shops 
    FOR ALL USING (auth.role() = 'authenticated') 
    WITH CHECK (auth.role() = 'authenticated');

-- Products
CREATE POLICY "Authenticated users full access" ON public.products 
    FOR ALL USING (auth.role() = 'authenticated') 
    WITH CHECK (auth.role() = 'authenticated');

-- Markets
CREATE POLICY "Authenticated users full access" ON public.markets 
    FOR ALL USING (auth.role() = 'authenticated') 
    WITH CHECK (auth.role() = 'authenticated');

-- Profiles
CREATE POLICY "Authenticated users full access" ON public.profiles 
    FOR ALL USING (auth.role() = 'authenticated') 
    WITH CHECK (auth.role() = 'authenticated');

-- Subscriptions
CREATE POLICY "Authenticated users full access" ON public.subscriptions 
    FOR ALL USING (auth.role() = 'authenticated') 
    WITH CHECK (auth.role() = 'authenticated');

-- 4. PUBLIC READ ACCESS (Optional but helpful for shoppers)
CREATE POLICY "Public Read Access" ON public.shops FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.markets FOR SELECT USING (true);

-- 5. RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
