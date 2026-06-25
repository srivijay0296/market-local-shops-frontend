-- ================================================================
-- PROFILE SCHEMA FIX: ADD EMAIL COLUMN & SYNC TRIGGERS
-- Run this in your Supabase SQL Editor
-- ================================================================

-- 1. Safely add the 'email' column to the profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- 2. Backfill all existing missing emails from the auth layer (auth.users)
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- 3. Replace the Auth trigger to automatically pull in the email on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'New Member'),
    'buyer'
  )
  ON CONFLICT (id) DO UPDATE 
  SET email = EXCLUDED.email;
  
  RETURN NEW;
END;
$$;

-- 4. Force Supabase API to reload the schema cache immediately!
NOTIFY pgrst, 'reload schema';
