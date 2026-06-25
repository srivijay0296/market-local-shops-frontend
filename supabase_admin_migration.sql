-- Admin Panel Enhancements Migration

-- 1. Add 'status' to Products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Update existing products to act as 'approved' by default if they were created before this system
UPDATE public.products SET status = 'approved' WHERE status IS NULL;
ALTER TABLE public.products ALTER COLUMN status SET NOT NULL;

-- 2. Add 'is_blocked' to Users
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false NOT NULL;

-- 3. Update Policies to allow Admins full access
-- Delete existing permissive or restrictive policies that might conflict with admin override for products
DROP POLICY IF EXISTS "Vendors can insert products" ON public.products;
DROP POLICY IF EXISTS "Vendors can update own products" ON public.products;
DROP POLICY IF EXISTS "Vendors can delete own products" ON public.products;

-- Recreate standard seller policies but with an "AND NOT is_blocked" condition on user
CREATE POLICY "Vendors can insert products" ON public.products FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id) AND
  auth.uid() IN (SELECT id FROM public.users WHERE is_blocked = false)
);

CREATE POLICY "Vendors can update own products" ON public.products FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id) AND
  auth.uid() IN (SELECT id FROM public.users WHERE is_blocked = false)
);

CREATE POLICY "Vendors can delete own products" ON public.products FOR DELETE USING (
  auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id) AND
  auth.uid() IN (SELECT id FROM public.users WHERE is_blocked = false)
);

-- Admin Override Policies (Admins can do anything on these tables)
CREATE POLICY "Admins can do all on users" ON public.users FOR ALL USING (
  auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
);

CREATE POLICY "Admins can do all on vendors" ON public.vendors FOR ALL USING (
  auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
);

CREATE POLICY "Admins can do all on products" ON public.products FOR ALL USING (
  auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
);

CREATE POLICY "Admins can do all on orders" ON public.orders FOR ALL USING (
  auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
);

CREATE POLICY "Admins can do all on subscriptions" ON public.subscriptions FOR ALL USING (
  auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
);

-- Note: The original generic RLS policies on 'users' allowed 'auth.uid() = id'
-- We keep that so normal users can still read/update themselves,
-- but the new admin policy allows admins to update anyone.
