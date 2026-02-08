-- Grant EXECUTE permissions on bootstrap functions to authenticated and anon roles
GRANT EXECUTE ON FUNCTION public.bootstrap_make_owner() TO authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_make_owner() TO anon;

GRANT EXECUTE ON FUNCTION public.bootstrap_get_system_state() TO authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_get_system_state() TO anon;