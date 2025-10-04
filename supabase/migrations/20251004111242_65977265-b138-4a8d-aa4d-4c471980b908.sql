-- Create bookings table for gold/jewellery bookings
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_code TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customer_profiles(id),
  full_name TEXT NOT NULL,
  primary_mobile TEXT NOT NULL,
  secondary_mobile TEXT,
  email TEXT NOT NULL,
  full_address TEXT NOT NULL,
  booking_type TEXT NOT NULL CHECK (booking_type IN ('24k_gold_995', '24k_gold_normal', 'gold_jewellery')),
  gold_weight NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Customers can view their own bookings
CREATE POLICY "Customers can view own bookings"
ON public.bookings
FOR SELECT
USING (
  (auth.uid() IS NOT NULL AND customer_id IN (
    SELECT id FROM public.customer_profiles WHERE user_id = auth.uid()
  ))
  OR
  (EXISTS (
    SELECT 1 FROM public.customer_profiles 
    WHERE user_id = auth.uid() AND is_owner = true
  ))
);

-- Policy: Anyone can insert bookings (for guest bookings)
CREATE POLICY "Anyone can insert bookings"
ON public.bookings
FOR INSERT
WITH CHECK (true);

-- Policy: Only owner can update bookings
CREATE POLICY "Owner can update bookings"
ON public.bookings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.customer_profiles 
    WHERE user_id = auth.uid() AND is_owner = true
  )
);

-- Create function to generate booking code
CREATE OR REPLACE FUNCTION public.generate_booking_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_year TEXT;
  booking_count INT;
  generated_code TEXT;
  max_attempts INT := 100;
  attempt_count INT := 0;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  LOOP
    SELECT COALESCE(MAX(CAST(SPLIT_PART(booking_code, '-', 3) AS INT)), 0) + 1 
    INTO booking_count
    FROM public.bookings
    WHERE booking_code LIKE 'SA-' || current_year || '-%'
    AND booking_code ~ '^SA-[0-9]{4}-[0-9]+$';
    
    generated_code := 'SA-' || current_year || '-' || LPAD(booking_count::TEXT, 4, '0');
    
    IF NOT EXISTS (SELECT 1 FROM public.bookings WHERE booking_code = generated_code) THEN
      RETURN generated_code;
    END IF;
    
    attempt_count := attempt_count + 1;
    IF attempt_count >= max_attempts THEN
      RAISE EXCEPTION 'Unable to generate unique booking code after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$$;

-- Create trigger to auto-generate booking code
CREATE OR REPLACE FUNCTION public.auto_generate_booking_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.booking_code IS NULL OR NEW.booking_code = '' THEN
    NEW.booking_code := public.generate_booking_code();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_generate_booking_code_trigger
BEFORE INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.auto_generate_booking_code();

-- Create trigger to update updated_at
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for bookings table
ALTER TABLE public.bookings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;