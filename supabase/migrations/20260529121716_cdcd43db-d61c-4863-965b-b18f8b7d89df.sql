
-- Sequence for ticket numbers
CREATE SEQUENCE IF NOT EXISTS public.complaint_ticket_seq START 1;

-- Function to generate ticket number TKT-YYYY-NNNN
CREATE OR REPLACE FUNCTION public.generate_complaint_ticket_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_number INTEGER;
  current_year TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW())::TEXT;
  SELECT COALESCE(MAX(
    CASE WHEN ticket_number ~ ('^TKT-' || current_year || '-[0-9]{4}$')
    THEN SUBSTRING(ticket_number FROM 10)::INTEGER
    ELSE 0 END
  ), 0) + 1
  INTO next_number FROM public.complaints
  WHERE ticket_number LIKE 'TKT-' || current_year || '-%';
  RETURN 'TKT-' || current_year || '-' || LPAD(next_number::TEXT, 4, '0');
END;
$$;

-- complaints table
CREATE TABLE public.complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text NOT NULL UNIQUE DEFAULT '',
  customer_id uuid,
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'raised',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.complaints TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.complaints TO authenticated;
GRANT ALL ON public.complaints TO service_role;

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit complaints" ON public.complaints
FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Customers can view their own complaints" ON public.complaints
FOR SELECT TO authenticated
USING (
  email = (SELECT email FROM public.customer_profiles WHERE user_id = auth.uid())
  OR customer_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_owner = true)
);

CREATE POLICY "Owner can update complaints" ON public.complaints
FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_owner = true));

-- Trigger to auto-generate ticket number
CREATE OR REPLACE FUNCTION public.set_complaint_ticket_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    NEW.ticket_number := public.generate_complaint_ticket_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER complaints_set_ticket_number
BEFORE INSERT ON public.complaints
FOR EACH ROW EXECUTE FUNCTION public.set_complaint_ticket_number();

CREATE TRIGGER complaints_updated_at
BEFORE UPDATE ON public.complaints
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- complaint_updates table
CREATE TABLE public.complaint_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  status text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.complaint_updates TO anon;
GRANT SELECT, INSERT ON public.complaint_updates TO authenticated;
GRANT ALL ON public.complaint_updates TO service_role;

ALTER TABLE public.complaint_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View updates for accessible complaints" ON public.complaint_updates
FOR SELECT TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.complaints c
    WHERE c.id = complaint_id
    AND (
      c.email = (SELECT email FROM public.customer_profiles WHERE user_id = auth.uid())
      OR c.customer_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_owner = true)
    )
  )
);

CREATE POLICY "Owner can add updates" ON public.complaint_updates
FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_owner = true));
