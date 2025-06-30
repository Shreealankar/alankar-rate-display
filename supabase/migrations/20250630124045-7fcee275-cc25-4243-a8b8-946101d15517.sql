
-- Create a table for storing subscribers
CREATE TABLE public.subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to the subscribers table
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to view active subscribers (for sending notifications)
CREATE POLICY "Anyone can view active subscribers" 
  ON public.subscribers 
  FOR SELECT 
  USING (is_active = true);

-- Create policy that allows anyone to insert subscribers (for public subscription)
CREATE POLICY "Anyone can create subscribers" 
  ON public.subscribers 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy that allows anyone to update subscribers (for managing subscriptions)
CREATE POLICY "Anyone can update subscribers" 
  ON public.subscribers 
  FOR UPDATE 
  USING (true);

-- Create policy that allows anyone to delete subscribers (for unsubscribing)
CREATE POLICY "Anyone can delete subscribers" 
  ON public.subscribers 
  FOR DELETE 
  USING (true);

-- Create an index on phone_number for faster lookups
CREATE INDEX idx_subscribers_phone_number ON public.subscribers(phone_number);

-- Create an index on active subscribers
CREATE INDEX idx_subscribers_active ON public.subscribers(is_active) WHERE is_active = true;
