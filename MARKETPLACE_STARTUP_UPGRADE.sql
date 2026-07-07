-- ======================================================================================
-- 🚀 MARKETPLACE STARTUP UPGRADE (SUPABASE)
-- Adds Notifications, Approval Checks, and Real-time Support
-- ======================================================================================

-- 1. ADD MISSING COLUMNS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT true;

-- 2. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can only see their own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Allow system to insert notifications" 
ON public.notifications FOR INSERT 
WITH CHECK (true);

-- 3. REAL-TIME REGISTRATION
-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 4. AUTOMATIC NOTIFICATION TRIGGERS
-- Trigger when product is approved
CREATE OR REPLACE FUNCTION public.notify_product_approval()
RETURNS trigger AS $$
BEGIN
  IF (OLD.is_approved = false AND NEW.is_approved = true) THEN
    -- Find the shop owner
    DECLARE
       owner_id uuid;
    BEGIN
       SELECT s.owner_id INTO owner_id FROM public.shops s WHERE s.id = NEW.shop_id;
       
       INSERT INTO public.notifications (user_id, message, type)
       VALUES (owner_id, 'Your product "' || NEW.name || '" has been approved and is now live.', 'success');
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_product_approval ON public.products;
CREATE TRIGGER tr_product_approval
  AFTER UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.notify_product_approval();

-- 5. ANALYTICS HELPER VIEW (Optional)
CREATE OR REPLACE VIEW public.marketplace_stats AS
SELECT 
  (SELECT count(*) FROM profiles) as total_users,
  (SELECT count(*) FROM profiles WHERE role = 'seller') as total_sellers,
  (SELECT count(*) FROM products) as total_products,
  (SELECT count(*) FROM shops WHERE status = 'pending') as pending_shops;
