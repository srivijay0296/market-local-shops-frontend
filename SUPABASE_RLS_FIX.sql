-- ================================================================
-- SUPABASE RLS & TRIGGER RECURSION FIX
-- ================================================================

-- 1. Create a helper function to check if user is admin WITHOUT recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT (raw_user_meta_data->>'role')::text = 'admin'
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update RLS policies for profiles to include admin access and avoid recursion
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "INSERT -> auth.uid() = id" ON public.profiles;
DROP POLICY IF EXISTS "SELECT -> auth.uid() = id" ON public.profiles;
DROP POLICY IF EXISTS "UPDATE -> auth.uid() = id" ON public.profiles;
DROP POLICY IF EXISTS "INSERT policy" ON public.profiles;
DROP POLICY IF EXISTS "SELECT policy" ON public.profiles;
DROP POLICY IF EXISTS "UPDATE policy" ON public.profiles;

-- New robust policies
CREATE POLICY "Profiles are viewable by owner or admin" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Profiles can be updated by owner or admin" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "Profiles can be inserted by anyone signing up" 
  ON public.profiles FOR INSERT 
  WITH CHECK (true); -- Trigger handles the security via auth.users insertion

-- 3. Ensure the trigger function also handles role correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer'),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    role = COALESCE(EXCLUDED.role, profiles.role),
    phone = COALESCE(EXCLUDED.phone, profiles.phone);
  RETURN NEW;
END;
$$;

-- 4. Reload schema
NOTIFY pgrst, 'reload schema';
