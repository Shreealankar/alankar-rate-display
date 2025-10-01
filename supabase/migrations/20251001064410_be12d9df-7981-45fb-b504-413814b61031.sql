-- Add is_locked field to rates table
ALTER TABLE public.rates 
ADD COLUMN is_locked boolean DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN public.rates.is_locked IS 'Flag to lock/unlock rate updates from being displayed';

-- Create a function to update lock status (only one rate can be locked at a time per metal type)
CREATE OR REPLACE FUNCTION update_rate_lock_status(p_metal_type text, p_is_locked boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.rates
  SET is_locked = p_is_locked,
      updated_at = now()
  WHERE metal_type = p_metal_type;
END;
$$;