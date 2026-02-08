-- Modificar la función handle_new_user para asignar "owner" al primer usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
  assigned_role app_role;
BEGIN
  -- Contar usuarios existentes en user_roles
  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  
  -- Si es el primer usuario, asignar owner; de lo contrario, worker
  IF user_count = 0 THEN
    assigned_role := 'owner';
  ELSE
    assigned_role := 'worker';
  END IF;
  
  -- Crear perfil
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  
  -- Crear rol de usuario
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role);
  
  RETURN NEW;
END;
$$;