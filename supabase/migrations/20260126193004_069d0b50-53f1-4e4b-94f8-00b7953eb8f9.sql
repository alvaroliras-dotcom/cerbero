-- Create diagnostic function to check system state (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.bootstrap_get_system_state()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  current_user_id uuid;
  user_role_exists boolean;
  user_current_role text;
  total_owners integer;
BEGIN
  current_user_id := auth.uid();
  
  -- Check if user has a role entry
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = current_user_id
  ) INTO user_role_exists;
  
  -- Get current role if exists
  SELECT role::text INTO user_current_role
  FROM public.user_roles
  WHERE user_id = current_user_id;
  
  -- Count owners
  SELECT COUNT(*) INTO total_owners
  FROM public.user_roles
  WHERE role = 'owner';
  
  result := jsonb_build_object(
    'current_user_id', current_user_id,
    'user_role_exists', user_role_exists,
    'user_current_role', COALESCE(user_current_role, 'none'),
    'total_owners', total_owners
  );
  
  RETURN result;
END;
$$;