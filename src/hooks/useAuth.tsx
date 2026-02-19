import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  companyId: string | null;
  loading: boolean;

  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function roleFromMetadata(u: User | null): AppRole | null {
  if (!u) return null;
  const md: any = u.user_metadata ?? {};
  const r = md.role ?? md.app_role ?? md.appRole;
  if (r === "owner" || r === "hr" || r === "worker") return r;
  return null;
}

function normalizeRole(input: any): AppRole {
  // Tu tabla memberships probablemente tendrá "owner" (y quizá más roles luego).
  // Para no romper la app: owner/hr/worker.
  if (input === "owner" || input === "hr" || input === "worker") return input;
  // si llega algo raro, cae a worker
  return "worker";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCompanyContext = async (u: User) => {
    // Siempre resuelve (nunca deja loading colgado)
    try {
      // ✅ Fuente de verdad en TU Supabase: memberships
      // OJO: hacemos cast "as any" para que no dependa de types.ts del repo (está desactualizado)
      const { data, error } = await (supabase as any)
        .from("memberships")
        .select("company_id, role")
        .eq("user_id", u.id)
        .maybeSingle();

      if (!error && data) {
        setCompanyId(data.company_id ?? null);
        setRole(normalizeRole(data.role) ?? roleFromMetadata(u));
        return;
      }

      // Fallback: rol visual desde metadata si no hay membership
      const mdRole = roleFromMetadata(u);
      setCompanyId(null);
      setRole(mdRole ?? "worker");
    } catch {
      const mdRole = roleFromMetadata(u);
      setCompanyId(null);
      setRole(mdRole ?? "worker");
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        const sess = data.session ?? null;
        const usr = sess?.user ?? null;

        if (!mounted) return;

        setSession(sess);
        setUser(usr);

        if (usr) {
          // rol rápido (UI) mientras se carga la fuente de verdad
          const mdRole = roleFromMetadata(usr);
          if (mdRole) setRole(mdRole);

          await loadCompanyContext(usr);
        } else {
          setRole(null);
          setCompanyId(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setLoading(true);

      try {
        const usr = newSession?.user ?? null;

        if (!mounted) return;

        setSession(newSession);
        setUser(usr);

        if (usr) {
          const mdRole = roleFromMetadata(usr);
          if (mdRole) setRole(mdRole);

          await loadCompanyContext(usr);
        } else {
          setRole(null);
          setCompanyId(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: "worker",
        },
      },
    });

    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    setCompanyId(null);
  };

  const refreshRole = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getUser();
      const freshUser = data.user ?? null;

      setUser(freshUser);

      if (!freshUser) {
        setRole(null);
        setCompanyId(null);
        return;
      }

      const mdRole = roleFromMetadata(freshUser);
      if (mdRole) setRole(mdRole);

      await loadCompanyContext(freshUser);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        companyId,
        loading,
        signIn,
        signUp,
        signOut,
        refreshRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
