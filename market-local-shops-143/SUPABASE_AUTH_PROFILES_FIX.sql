-- ================================================================
-- SUPABASE AUTH & PROFILES TRIGGER FIX
-- ================================================================

-- 1. Ensure profiles table structure
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  phone text,
  role text DEFAULT 'buyer',
  created_at timestamptz DEFAULT now()
);

-- 2. Create/Fix the database trigger function
-- This function runs with SECURITY DEFINER to bypass RLS and insert into profiles
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

-- 3. Ensure trigger is attached to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Enable RLS and add strict policies as requested
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop all possible existing policies to avoid conflicts
DROP POLICY IF EXISTS "INSERT -> auth.uid() = id" ON public.profiles;
DROP POLICY IF EXISTS "SELECT -> auth.uid() = id" ON public.profiles;
DROP POLICY IF EXISTS "UPDATE -> auth.uid() = id" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view basic seller profiles" ON public.profiles;
DROP POLICY IF EXISTS "INSERT policy" ON public.profiles;
DROP POLICY IF EXISTS "SELECT policy" ON public.profiles;
DROP POLICY IF EXISTS "UPDATE policy" ON public.profiles;

-- Create the specific policies requested by the user
-- Note: Trigger handles initial INSERT, but policy might be needed for frontend logic
CREATE POLICY "INSERT -> auth.uid() = id" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "SELECT -> auth.uid() = id" ON public.profiles FOR SELECT USING (auth.uid() = id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "UPDATE -> auth.uid() = id" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 5. Reload schema cache
NOTIFY pgrst, 'reload schema';
