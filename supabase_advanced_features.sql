-- BTM Advanced Features Migration (Chat, Notifications, Analytics)
-- Run this in your Supabase SQL Editor

-------------------------------------------------------------------------------
-- 1. CHAT MESSAGES
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages"
    ON public.chat_messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can insert their own messages"
    ON public.chat_messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-------------------------------------------------------------------------------
-- 2. NOTIFICATIONS
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (mark as read)"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

-------------------------------------------------------------------------------
-- 3. SELLER ANALYTICS
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.seller_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    sales NUMERIC DEFAULT 0,
    visits INTEGER DEFAULT 0,
    conversion_rate NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(vendor_id, date)
);

ALTER TABLE public.seller_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view their own analytics"
    ON public.seller_analytics FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.vendors WHERE vendors.id = vendor_id AND vendors.user_id = auth.uid()));

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_chat_order_id ON public.chat_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_vendor_date ON public.seller_analytics(vendor_id, date);
