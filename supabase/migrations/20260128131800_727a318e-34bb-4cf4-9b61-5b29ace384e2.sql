-- Add SELECT policy for HR and Owner to view all clock entries
-- This keeps existing policies (users own select/insert) intact

DO $$
BEGIN
  -- Try with has_role function if it exists
  BEGIN
    EXECUTE $sql$
      CREATE POLICY "HR/Owner can view all clock entries"
      ON public.clock_entries
      FOR SELECT
      USING (
        has_role(auth.uid(), 'hr') OR has_role(auth.uid(), 'owner')
      );
    $sql$;
  EXCEPTION WHEN undefined_function THEN
    EXECUTE $sql$
      CREATE POLICY "HR/Owner can view all clock entries"
      ON public.clock_entries
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid()
            AND role IN ('hr','owner')
        )
      );
    $sql$;
  END;
END $$;