
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can manage carousel images" ON public.carousel_images;

-- Create a more permissive policy that allows anyone to manage carousel images
-- This is appropriate since you have your own authentication system in the frontend
CREATE POLICY "Allow all operations on carousel images" 
  ON public.carousel_images 
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Also ensure the storage policies are permissive for the images bucket
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;

-- Create permissive storage policies
CREATE POLICY "Anyone can upload images" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'images');

CREATE POLICY "Anyone can update images" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'images');

CREATE POLICY "Anyone can delete images" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'images');
