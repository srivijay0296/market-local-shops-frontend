-- ======================================================================================
-- 🔥 15-DAY FREE TRIAL SUBSCRIPTION SYSTEM MIGRATION
-- Run this script in the Supabase SQL Editor to alter the public.profiles table
-- and update the auth.users signup trigger.
-- ======================================================================================

-- 1. Add subscription columns to the profiles table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'trial_start_date') THEN
    ALTER TABLE public.profiles ADD COLUMN trial_start_date timestamp with time zone DEFAULT now();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'trial_end_date') THEN
    ALTER TABLE public.profiles ADD COLUMN trial_end_date timestamp with time zone DEFAULT (now() + interval '15 days');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_status') THEN
    ALTER TABLE public.profiles ADD COLUMN subscription_status text DEFAULT 'TRIAL';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_plan') THEN
    ALTER TABLE public.profiles ADD COLUMN subscription_plan text DEFAULT 'FREE';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'payment_status') THEN
    ALTER TABLE public.profiles ADD COLUMN payment_status text DEFAULT 'UNPAID';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_expires_at') THEN
    ALTER TABLE public.profiles ADD COLUMN subscription_expires_at timestamp with time zone;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_payment_id') THEN
    ALTER TABLE public.profiles ADD COLUMN last_payment_id text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'payment_date') THEN
    ALTER TABLE public.profiles ADD COLUMN payment_date timestamp with time zone;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'expiry_date') THEN
    ALTER TABLE public.profiles ADD COLUMN expiry_date timestamp with time zone;
  END IF;
END $$;

-- 2. Update the handle_new_user trigger function to populate trial fields on new signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    name, 
    email, 
    role, 
    trial_start_date, 
    trial_end_date, 
    subscription_status, 
    subscription_plan, 
    payment_status
  )
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', 'Bargur Local'), 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'role', 'buyer'),
    now(),
    now() + interval '15 days',
    'TRIAL',
    'FREE',
    'UNPAID'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
