-- Multi-Market Schema Changes

-- 1. Create Markets Table
CREATE TABLE IF NOT EXISTS public.markets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  location TEXT,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Markets
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read of markets" ON public.markets FOR SELECT USING (true);
-- Give admins full access (assuming admin role exists in auth users)
CREATE POLICY "Admins can manage markets" ON public.markets FOR ALL USING (
  EXISTS(SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Note: We assume the roles 'admin', 'market_manager' might exist in users table role check constraint

-- 2. Insert initial markets
INSERT INTO public.markets (name, slug, location, description) VALUES
('BT Market', 'bt-market', 'Main Street, Bargur', 'The central Bargur Textile Market for sarees and dress materials.'),
('Cotton Market', 'cotton-market', 'Cotton Street, Bargur', 'Specialized market for pure cotton garments and fabrics.'),
('Silk Market', 'silk-market', 'Silk Route, Bargur', 'Premium silk sarees and exclusive traditional wear.'),
('Wholesale Market', 'wholesale-market', 'Industrial Area, Bargur', 'Bulk textiles operations and wholesale bundles.')
ON CONFLICT (slug) DO NOTHING;

-- 3. Update Vendors Table
-- Add market_id to vendors
ALTER TABLE public.vendors
ADD COLUMN market_id UUID REFERENCES public.markets(id) ON DELETE SET NULL;

-- 4. Update Products Table
-- Add market_id to products
ALTER TABLE public.products
ADD COLUMN market_id UUID REFERENCES public.markets(id) ON DELETE SET NULL;

-- Optional: If you want to backfill existing vendors/products to 'BT Market' for example:
DO $$
DECLARE
    bt_market_id UUID;
BEGIN
    SELECT id INTO bt_market_id FROM public.markets WHERE slug = 'bt-market' LIMIT 1;
    
    IF bt_market_id IS NOT NULL THEN
        UPDATE public.vendors SET market_id = bt_market_id WHERE market_id IS NULL;
        UPDATE public.products SET market_id = bt_market_id WHERE market_id IS NULL;
    END IF;
END $$;
