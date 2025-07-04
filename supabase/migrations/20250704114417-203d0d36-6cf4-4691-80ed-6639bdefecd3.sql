
-- Create storage bucket for carousel images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true);

-- Create carousel_images table
CREATE TABLE public.carousel_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on carousel_images table
ALTER TABLE public.carousel_images ENABLE ROW LEVEL SECURITY;

-- Create policies for carousel_images (public read, owner-only write)
CREATE POLICY "Anyone can view active carousel images" 
  ON public.carousel_images 
  FOR SELECT 
  USING (is_active = true);

-- For now, we'll allow all authenticated users to manage carousel images
-- You can modify this later to be more restrictive based on user roles
CREATE POLICY "Authenticated users can manage carousel images" 
  ON public.carousel_images 
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create storage policies for the images bucket
CREATE POLICY "Anyone can view images" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images" 
  ON storage.objects 
  FOR INSERT 
  TO authenticated
  WITH CHECK (bucket_id = 'images');

CREATE POLICY "Authenticated users can update images" 
  ON storage.objects 
  FOR UPDATE 
  TO authenticated
  USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can delete images" 
  ON storage.objects 
  FOR DELETE 
  TO authenticated
  USING (bucket_id = 'images');
