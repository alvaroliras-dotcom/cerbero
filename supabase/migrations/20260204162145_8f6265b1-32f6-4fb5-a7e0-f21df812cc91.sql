
-- =====================================================
-- MIGRACIÓN MULTI-TENANT DEFINITIVA
-- =====================================================

-- 1) CREAR TABLA companies
-- =====================================================
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT companies_name_unique UNIQUE (name)
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Trigger para updated_at en companies
DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2) CREAR TABLA company_user_roles
-- =====================================================
CREATE TABLE IF NOT EXISTS public.company_user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL, -- FK se añade después de backfill
  role app_role NOT NULL DEFAULT 'worker',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT company_user_roles_user_company_unique UNIQUE (user_id, company_id)
);

ALTER TABLE public.company_user_roles ENABLE ROW LEVEL SECURITY;

-- 3) AÑADIR company_id A TABLAS EXISTENTES (sin FK por ahora)
-- =====================================================
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS company_id uuid;

ALTER TABLE public.clock_entries 
  ADD COLUMN IF NOT EXISTS company_id uuid;

ALTER TABLE public.company_rules 
  ADD COLUMN IF NOT EXISTS company_id uuid;

-- 4) CREAR TABLAS approval_requests Y audit_log
-- =====================================================
CREATE TABLE IF NOT EXISTS public.approval_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL, -- FK después del backfill
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT approval_requests_status_check CHECK (status IN ('pending', 'approved', 'rejected')),
  CONSTRAINT approval_requests_request_type_check CHECK (request_type IN ('time_correction', 'absence', 'overtime', 'other'))
);

ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL, -- FK después del backfill
  entity text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  before jsonb,
  after jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- 5) BACKFILL: Crear empresa por defecto y migrar datos
-- =====================================================
DO $$
DECLARE
  default_company_id uuid;
BEGIN
  -- Insertar empresa por defecto si no existe
  INSERT INTO public.companies (name)
  SELECT 'Solvento (demo)'
  WHERE NOT EXISTS (SELECT 1 FROM public.companies WHERE name = 'Solvento (demo)');
  
  -- Obtener ID de la empresa por defecto
  SELECT id INTO default_company_id FROM public.companies WHERE name = 'Solvento (demo)' LIMIT 1;
  
  -- Si no hay empresa, crear una
  IF default_company_id IS NULL THEN
    INSERT INTO public.companies (name) VALUES ('Solvento (demo)')
    RETURNING id INTO default_company_id;
  END IF;
  
  -- Backfill profiles
  UPDATE public.profiles 
  SET company_id = default_company_id 
  WHERE company_id IS NULL;
  
  -- Backfill clock_entries
  UPDATE public.clock_entries 
  SET company_id = default_company_id 
  WHERE company_id IS NULL;
  
  -- Backfill company_rules (limpiar duplicados primero)
  -- Mantener solo la fila más reciente por company_id (o sin company_id)
  DELETE FROM public.company_rules cr1
  WHERE EXISTS (
    SELECT 1 FROM public.company_rules cr2
    WHERE cr2.updated_at > cr1.updated_at
    AND cr1.id != cr2.id
    AND (cr1.company_id IS NULL AND cr2.company_id IS NULL)
  );
  
  -- Asignar company_id a company_rules existentes
  UPDATE public.company_rules 
  SET company_id = default_company_id 
  WHERE company_id IS NULL;
  
  -- Si no hay reglas, crear una por defecto
  IF NOT EXISTS (SELECT 1 FROM public.company_rules WHERE company_id = default_company_id) THEN
    INSERT INTO public.company_rules (id, company_id, work_start, work_end, tolerance_minutes, break_minutes)
    VALUES (1, default_company_id, '09:00', '18:00', 10, 30);
  END IF;
  
  -- Migrar roles existentes a company_user_roles
  INSERT INTO public.company_user_roles (user_id, company_id, role)
  SELECT ur.user_id, default_company_id, ur.role
  FROM public.user_roles ur
  WHERE NOT EXISTS (
    SELECT 1 FROM public.company_user_roles cur 
    WHERE cur.user_id = ur.user_id AND cur.company_id = default_company_id
  );
END $$;

-- 6) AÑADIR FOREIGN KEYS (después del backfill)
-- =====================================================
-- company_user_roles.company_id → ON DELETE CASCADE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'company_user_roles_company_id_fkey'
  ) THEN
    ALTER TABLE public.company_user_roles 
      ADD CONSTRAINT company_user_roles_company_id_fkey 
      FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;
  END IF;
END $$;

-- profiles.company_id → ON DELETE SET NULL
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_company_id_fkey'
  ) THEN
    ALTER TABLE public.profiles 
      ADD CONSTRAINT profiles_company_id_fkey 
      FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;
  END IF;
END $$;

-- clock_entries.company_id → ON DELETE CASCADE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'clock_entries_company_id_fkey'
  ) THEN
    ALTER TABLE public.clock_entries 
      ADD CONSTRAINT clock_entries_company_id_fkey 
      FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;
  END IF;
END $$;

-- company_rules.company_id → ON DELETE CASCADE + UNIQUE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'company_rules_company_id_fkey'
  ) THEN
    ALTER TABLE public.company_rules 
      ADD CONSTRAINT company_rules_company_id_fkey 
      FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'company_rules_company_id_unique'
  ) THEN
    ALTER TABLE public.company_rules 
      ADD CONSTRAINT company_rules_company_id_unique UNIQUE (company_id);
  END IF;
END $$;

-- approval_requests.company_id → ON DELETE CASCADE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'approval_requests_company_id_fkey'
  ) THEN
    ALTER TABLE public.approval_requests 
      ADD CONSTRAINT approval_requests_company_id_fkey 
      FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;
  END IF;
END $$;

-- audit_log.company_id → ON DELETE CASCADE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'audit_log_company_id_fkey'
  ) THEN
    ALTER TABLE public.audit_log 
      ADD CONSTRAINT audit_log_company_id_fkey 
      FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 7) FUNCIONES HELPER (SECURITY DEFINER)
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_company_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id
  FROM public.company_user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.has_company_role(_user_id uuid, _company_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.company_user_roles
    WHERE user_id = _user_id
      AND company_id = _company_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_hr_or_owner(_user_id uuid, _company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.company_user_roles
    WHERE user_id = _user_id
      AND company_id = _company_id
      AND role IN ('hr', 'owner')
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_company_role(_user_id uuid, _company_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.company_user_roles
  WHERE user_id = _user_id
    AND company_id = _company_id
  LIMIT 1
$$;

-- 8) ACTUALIZAR TRIGGER handle_new_user
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_users INTEGER;
  assigned_role app_role;
  target_company_id uuid;
BEGIN
  -- Contar usuarios existentes
  SELECT COUNT(*) INTO existing_users FROM public.company_user_roles;
  
  IF existing_users = 0 THEN
    -- Primer usuario: crear company y asignar owner
    assigned_role := 'owner';
    
    INSERT INTO public.companies (name)
    VALUES ('Mi Empresa')
    ON CONFLICT (name) DO NOTHING;
    
    SELECT id INTO target_company_id 
    FROM public.companies 
    WHERE name = 'Mi Empresa' 
    LIMIT 1;
    
    -- Crear reglas por defecto para la empresa
    INSERT INTO public.company_rules (company_id, work_start, work_end, tolerance_minutes, break_minutes)
    VALUES (target_company_id, '09:00', '18:00', 10, 30)
    ON CONFLICT (company_id) DO UPDATE
    SET work_start = EXCLUDED.work_start,
        work_end = EXCLUDED.work_end,
        tolerance_minutes = EXCLUDED.tolerance_minutes,
        break_minutes = EXCLUDED.break_minutes,
        updated_at = now();
  ELSE
    -- Usuarios posteriores: asignar a empresa existente como worker
    assigned_role := 'worker';
    
    SELECT company_id INTO target_company_id
    FROM public.company_user_roles
    WHERE role = 'owner'
    LIMIT 1;
    
    -- Si no hay owner, buscar cualquier empresa
    IF target_company_id IS NULL THEN
      SELECT id INTO target_company_id FROM public.companies LIMIT 1;
    END IF;
  END IF;
  
  -- Crear perfil con company_id
  INSERT INTO public.profiles (id, full_name, company_id)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    target_company_id
  );
  
  -- Crear rol en user_roles (compatibilidad)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role)
  ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
  
  -- Crear rol en company_user_roles (multi-tenant)
  INSERT INTO public.company_user_roles (user_id, company_id, role)
  VALUES (NEW.id, target_company_id, assigned_role)
  ON CONFLICT (user_id, company_id) DO UPDATE SET role = EXCLUDED.role;
  
  RETURN NEW;
END;
$$;

-- 9) RLS POLICIES MULTI-TENANT
-- =====================================================

-- COMPANIES
DROP POLICY IF EXISTS "Users can view their companies" ON public.companies;
CREATE POLICY "Users can view their companies"
  ON public.companies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.company_user_roles
      WHERE company_user_roles.user_id = auth.uid()
        AND company_user_roles.company_id = companies.id
    )
  );

DROP POLICY IF EXISTS "Owners can update their company" ON public.companies;
CREATE POLICY "Owners can update their company"
  ON public.companies FOR UPDATE
  USING (has_company_role(auth.uid(), id, 'owner'));

DROP POLICY IF EXISTS "Allow first company creation" ON public.companies;
CREATE POLICY "Allow first company creation"
  ON public.companies FOR INSERT
  WITH CHECK (
    has_company_role(auth.uid(), id, 'owner')
    OR NOT EXISTS (SELECT 1 FROM public.companies)
  );

-- COMPANY_USER_ROLES
DROP POLICY IF EXISTS "Users can view own company roles" ON public.company_user_roles;
CREATE POLICY "Users can view own company roles"
  ON public.company_user_roles FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "HR/Owner can view company members" ON public.company_user_roles;
CREATE POLICY "HR/Owner can view company members"
  ON public.company_user_roles FOR SELECT
  USING (is_hr_or_owner(auth.uid(), company_id));

DROP POLICY IF EXISTS "Owners can manage company roles" ON public.company_user_roles;
CREATE POLICY "Owners can manage company roles"
  ON public.company_user_roles FOR INSERT
  WITH CHECK (
    has_company_role(auth.uid(), company_id, 'owner')
    OR NOT EXISTS (SELECT 1 FROM public.company_user_roles)
  );

DROP POLICY IF EXISTS "Owners can update company roles" ON public.company_user_roles;
CREATE POLICY "Owners can update company roles"
  ON public.company_user_roles FOR UPDATE
  USING (has_company_role(auth.uid(), company_id, 'owner'));

DROP POLICY IF EXISTS "Owners can delete company roles" ON public.company_user_roles;
CREATE POLICY "Owners can delete company roles"
  ON public.company_user_roles FOR DELETE
  USING (has_company_role(auth.uid(), company_id, 'owner'));

-- PROFILES (actualizar policies existentes)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "HR and Owner can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "HR/Owner can view company profiles" ON public.profiles;
CREATE POLICY "HR/Owner can view company profiles"
  ON public.profiles FOR SELECT
  USING (is_hr_or_owner(auth.uid(), company_id));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND company_id IS NOT DISTINCT FROM (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;
CREATE POLICY "System can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- CLOCK_ENTRIES (actualizar policies existentes)
DROP POLICY IF EXISTS "Users can view own clock entries" ON public.clock_entries;
CREATE POLICY "Users can view own clock entries"
  ON public.clock_entries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "HR/Owner can view all clock entries" ON public.clock_entries;
DROP POLICY IF EXISTS "HR/Owner can view company clock entries" ON public.clock_entries;
CREATE POLICY "HR/Owner can view company clock entries"
  ON public.clock_entries FOR SELECT
  USING (is_hr_or_owner(auth.uid(), company_id));

DROP POLICY IF EXISTS "Users can insert own clock entries" ON public.clock_entries;
CREATE POLICY "Users can insert own clock entries"
  ON public.clock_entries FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND company_id = get_user_company_id(auth.uid())
  );

-- COMPANY_RULES (actualizar policies existentes)
DROP POLICY IF EXISTS "HR and Owner can view company rules" ON public.company_rules;
DROP POLICY IF EXISTS "Company members can view rules" ON public.company_rules;
CREATE POLICY "Company members can view rules"
  ON public.company_rules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.company_user_roles
      WHERE company_user_roles.user_id = auth.uid()
        AND company_user_roles.company_id = company_rules.company_id
    )
  );

DROP POLICY IF EXISTS "Owner can insert company rules" ON public.company_rules;
CREATE POLICY "Owner can insert company rules"
  ON public.company_rules FOR INSERT
  WITH CHECK (has_company_role(auth.uid(), company_id, 'owner'));

DROP POLICY IF EXISTS "Owner can update company rules" ON public.company_rules;
CREATE POLICY "Owner can update company rules"
  ON public.company_rules FOR UPDATE
  USING (has_company_role(auth.uid(), company_id, 'owner'));

-- APPROVAL_REQUESTS
DROP POLICY IF EXISTS "Users can view own requests" ON public.approval_requests;
CREATE POLICY "Users can view own requests"
  ON public.approval_requests FOR SELECT
  USING (auth.uid() = requester_id);

DROP POLICY IF EXISTS "HR/Owner can view company requests" ON public.approval_requests;
CREATE POLICY "HR/Owner can view company requests"
  ON public.approval_requests FOR SELECT
  USING (is_hr_or_owner(auth.uid(), company_id));

DROP POLICY IF EXISTS "Users can create own requests" ON public.approval_requests;
CREATE POLICY "Users can create own requests"
  ON public.approval_requests FOR INSERT
  WITH CHECK (
    auth.uid() = requester_id 
    AND company_id = get_user_company_id(auth.uid())
  );

DROP POLICY IF EXISTS "HR/Owner can update requests" ON public.approval_requests;
CREATE POLICY "HR/Owner can update requests"
  ON public.approval_requests FOR UPDATE
  USING (is_hr_or_owner(auth.uid(), company_id))
  WITH CHECK (
    company_id IS NOT DISTINCT FROM (SELECT company_id FROM public.approval_requests WHERE id = approval_requests.id)
    AND requester_id IS NOT DISTINCT FROM (SELECT requester_id FROM public.approval_requests WHERE id = approval_requests.id)
  );

-- AUDIT_LOG
DROP POLICY IF EXISTS "HR/Owner can view audit log" ON public.audit_log;
CREATE POLICY "HR/Owner can view audit log"
  ON public.audit_log FOR SELECT
  USING (is_hr_or_owner(auth.uid(), company_id));

DROP POLICY IF EXISTS "System can insert audit log" ON public.audit_log;
CREATE POLICY "System can insert audit log"
  ON public.audit_log FOR INSERT
  WITH CHECK (
    actor_id = auth.uid() 
    AND company_id = get_user_company_id(auth.uid())
  );

-- 10) ÍNDICES DE RENDIMIENTO
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_company_user_roles_user_id ON public.company_user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_company_user_roles_company_id ON public.company_user_roles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_clock_entries_company_id ON public.clock_entries(company_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_company_id ON public.approval_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_requester_id ON public.approval_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_company_id ON public.audit_log(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON public.audit_log(entity, entity_id);
