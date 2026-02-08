import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface CompanyRoleState {
  role: AppRole | null;
  companyId: string | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook para obtener el rol del usuario en su empresa desde company_user_roles.
 * Esta es la fuente de verdad para RBAC multi-tenant.
 */
export function useCompanyRole(userId: string | undefined) {
  const [state, setState] = useState<CompanyRoleState>({
    role: null,
    companyId: null,
    loading: true,
    error: null,
  });

  const fetchCompanyRole = useCallback(async () => {
    if (!userId) {
      setState({ role: null, companyId: null, loading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Obtener el rol y company_id desde company_user_roles (fuente de verdad multi-tenant)
      const { data, error } = await supabase
        .from("company_user_roles")
        .select("role, company_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching company role:", error);
        setState({
          role: "worker", // fallback seguro
          companyId: null,
          loading: false,
          error: error as Error,
        });
        return;
      }

      if (data) {
        setState({
          role: data.role as AppRole,
          companyId: data.company_id,
          loading: false,
          error: null,
        });
      } else {
        // Usuario sin rol asignado - fallback a worker
        setState({
          role: "worker",
          companyId: null,
          loading: false,
          error: null,
        });
      }
    } catch (err) {
      console.error("Error in fetchCompanyRole:", err);
      setState({
        role: "worker",
        companyId: null,
        loading: false,
        error: err as Error,
      });
    }
  }, [userId]);

  useEffect(() => {
    fetchCompanyRole();
  }, [fetchCompanyRole]);

  return {
    ...state,
    refresh: fetchCompanyRole,
  };
}
