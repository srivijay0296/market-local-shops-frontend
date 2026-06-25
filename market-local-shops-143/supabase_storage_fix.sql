-- 📦 Update Storage Policies for the 'products' bucket
-- This ensures that images uploaded by admins are publicly readable

-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Allow public read access to the 'products' bucket
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- 3. Allow authenticated users to upload to the 'products' bucket
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

-- 4. Allow owners to update/delete their own objects in 'products'
CREATE POLICY "Delete/Update Own Objects"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'products' AND auth.uid() = owner);

-- 5. Repeat for 'shops' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('shops', 'shops', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public Read Access Shops"
ON storage.objects FOR SELECT
USING (bucket_id = 'shops');

CREATE POLICY "Authenticated Upload Shops"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'shops');
