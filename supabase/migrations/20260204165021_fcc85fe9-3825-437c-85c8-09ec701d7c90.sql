-- =====================================================
-- FASE 4: AUDIT LOG AUTOMÁTICO (TRIGGERS)
-- =====================================================

-- Función genérica de auditoría
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid;
BEGIN
  -- Obtener company_id según la tabla
  IF TG_TABLE_NAME = 'approval_requests' THEN
    v_company_id := COALESCE(NEW.company_id, OLD.company_id);
  ELSIF TG_TABLE_NAME = 'company_rules' THEN
    v_company_id := COALESCE(NEW.company_id, OLD.company_id);
  ELSIF TG_TABLE_NAME = 'company_user_roles' THEN
    v_company_id := COALESCE(NEW.company_id, OLD.company_id);
  ELSE
    v_company_id := NULL;
  END IF;

  INSERT INTO public.audit_log (
    company_id,
    entity,
    entity_id,
    action,
    actor_id,
    before,
    after
  )
  VALUES (
    v_company_id,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    auth.uid(),
    to_jsonb(OLD),
    to_jsonb(NEW)
  );

  RETURN NEW;
END;
$$;

-- =====================================================
-- TRIGGERS POR TABLA CRÍTICA
-- =====================================================

-- approval_requests
DROP TRIGGER IF EXISTS audit_approval_requests ON public.approval_requests;
CREATE TRIGGER audit_approval_requests
AFTER INSERT OR UPDATE OR DELETE
ON public.approval_requests
FOR EACH ROW
EXECUTE FUNCTION public.audit_trigger();

-- company_rules
DROP TRIGGER IF EXISTS audit_company_rules ON public.company_rules;
CREATE TRIGGER audit_company_rules
AFTER INSERT OR UPDATE OR DELETE
ON public.company_rules
FOR EACH ROW
EXECUTE FUNCTION public.audit_trigger();

-- company_user_roles
DROP TRIGGER IF EXISTS audit_company_user_roles ON public.company_user_roles;
CREATE TRIGGER audit_company_user_roles
AFTER INSERT OR UPDATE OR DELETE
ON public.company_user_roles
FOR EACH ROW
EXECUTE FUNCTION public.audit_trigger();