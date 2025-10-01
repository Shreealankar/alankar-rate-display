-- Fix search_path for update_rate_lock_status function
DROP FUNCTION IF EXISTS update_rate_lock_status(text, boolean);

CREATE OR REPLACE FUNCTION update_rate_lock_status(p_metal_type text, p_is_locked boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.rates
  SET is_locked = p_is_locked,
      updated_at = now()
  WHERE metal_type = p_metal_type;
END;
$$;