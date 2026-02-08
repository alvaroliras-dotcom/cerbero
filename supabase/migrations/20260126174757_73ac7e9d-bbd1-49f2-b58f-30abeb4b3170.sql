-- Add unique constraint on user_id if not exists (needed for ON CONFLICT)
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_key;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);

-- Update bootstrap_make_owner to use UPSERT instead of UPDATE
CREATE OR REPLACE FUNCTION public.bootstrap_make_owner()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_count INTEGER;
BEGIN
  -- Check if any owner already exists
  SELECT COUNT(*) INTO owner_count
  FROM public.user_roles
  WHERE role = 'owner';
  
  -- If owner already exists, deny the operation
  IF owner_count > 0 THEN
    RETURN false;
  END IF;
  
  -- UPSERT: Insert or update the current user's role to owner
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'owner')
  ON CONFLICT (user_id) DO UPDATE SET role = 'owner';
  
  -- Return true (operation succeeded)
  RETURN true;
END;
$$;