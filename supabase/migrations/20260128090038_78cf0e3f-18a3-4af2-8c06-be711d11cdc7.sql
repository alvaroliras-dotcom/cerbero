-- Create company_rules table
CREATE TABLE public.company_rules (
  id int PRIMARY KEY,
  work_start text NOT NULL,
  work_end text NOT NULL,
  tolerance_minutes int NOT NULL DEFAULT 10,
  break_minutes int NOT NULL DEFAULT 30,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insert initial row if not exists
INSERT INTO public.company_rules (id, work_start, work_end, tolerance_minutes, break_minutes)
VALUES (1, '09:00', '18:00', 10, 30)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.company_rules ENABLE ROW LEVEL SECURITY;

-- Policy: HR and Owner can view
CREATE POLICY "HR and Owner can view company rules"
ON public.company_rules
FOR SELECT
USING (
  public.has_role(auth.uid(), 'owner') OR 
  public.has_role(auth.uid(), 'hr')
);

-- Policy: Only Owner can insert
CREATE POLICY "Owner can insert company rules"
ON public.company_rules
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'owner'));

-- Policy: Only Owner can update
CREATE POLICY "Owner can update company rules"
ON public.company_rules
FOR UPDATE
USING (public.has_role(auth.uid(), 'owner'));

-- Trigger for updated_at
CREATE TRIGGER update_company_rules_updated_at
BEFORE UPDATE ON public.company_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();