-- Create a secure function to bootstrap the first owner
-- This function bypasses RLS and only works if NO owner exists
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
  
  -- Update the current user's role to owner
  UPDATE public.user_roles
  SET role = 'owner'
  WHERE user_id = auth.uid();
  
  -- Return true if a row was updated
  RETURN FOUND;
END;
$$;