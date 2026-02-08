import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRole {
  id: string;
  full_name: string | null;
  role: AppRole | null; // null = sin fila en company_user_roles
  created_at: string;
}

const roleLabels: Record<AppRole, string> = {
  worker: "Trabajador",
  hr: "RRHH",
  owner: "Dirección",
};

const roleBadgeVariants: Record<AppRole, "default" | "secondary" | "destructive" | "outline"> = {
  worker: "secondary",
  hr: "default",
  owner: "destructive",
};

export default function GestiónDeUsuarios() {
  const { user, companyId } = useAuth();

  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const fetchUsers = async () => {
    if (!companyId) {
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // 1) Perfiles SOLO de la empresa actual
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, created_at, company_id")
        .eq("company_id", companyId);

      if (profilesError) throw profilesError;

      // 2) Roles SOLO de la empresa actual (fuente de verdad)
      const { data: roles, error: rolesError } = await supabase
        .from("company_user_roles")
        .select("user_id, role, company_id")
        .eq("company_id", companyId);

      if (rolesError) throw rolesError;

      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.id);
        return {
          id: profile.id,
          full_name: profile.full_name,
          role: (userRole?.role as AppRole) ?? null,
          created_at: profile.created_at,
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Cierra el agujero: si no existe fila en company_user_roles, la crea.
  const upsertCompanyRole = async (userId: string, newRole: AppRole) => {
    if (!companyId) throw new Error("No companyId");

    // Intento 1: upsert si hay constraint (user_id, company_id)
    const { error: upsertError } = await supabase.from("company_user_roles").upsert(
      { user_id: userId, company_id: companyId, role: newRole },
      // si existe constraint compuesto, esto funciona perfecto
      { onConflict: "user_id,company_id" as any },
    );

    if (!upsertError) return;

    // Intento 2: si el onConflict no existe (o falla), hacemos: update -> si 0 filas, insert
    const { error: updateError } = await supabase
      .from("company_user_roles")
      .update({ role: newRole })
      .eq("user_id", userId)
      .eq("company_id", companyId);

    if (!updateError) return;

    const { error: insertError } = await supabase
      .from("company_user_roles")
      .insert({ user_id: userId, company_id: companyId, role: newRole });

    if (insertError) throw insertError;
  };

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    if (userId === user?.id) {
      toast.error("No puedes cambiar tu propio rol");
      return;
    }

    if (!companyId) {
      toast.error("No se ha detectado tu empresa");
      return;
    }

    setUpdating(userId);

    try {
      await upsertCompanyRole(userId, newRole);

      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));

      toast.success(`Rol actualizado a ${roleLabels[newRole]}`);
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Error al actualizar el rol");
    } finally {
      setUpdating(null);
    }
  };

  // 🔥 Botón “arregla todo”: crea filas faltantes en company_user_roles
  const handleSyncMissing = async () => {
    if (!companyId) {
      toast.error("No se ha detectado tu empresa");
      return;
    }

    const missing = users.filter((u) => !u.role).map((u) => u.id);
    if (missing.length === 0) {
      toast.success("No hay usuarios pendientes de sincronizar");
      return;
    }

    setSyncing(true);

    try {
      const payload = missing.map((userId) => ({
        user_id: userId,
        company_id: companyId,
        role: "worker" as AppRole,
      }));

      // Intento upsert masivo
      const { error } = await supabase
        .from("company_user_roles")
        .upsert(payload, { onConflict: "user_id,company_id" as any });

      if (error) throw error;

      toast.success(`Sincronizados: ${missing.length}`);
      await fetchUsers();
    } catch (e) {
      console.error("sync missing roles failed:", e);
      toast.error("No se pudieron sincronizar usuarios");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
            <p className="text-muted-foreground">Administra los roles de los usuarios de tu empresa</p>
            {!companyId && (
              <p className="text-sm text-destructive mt-2">
                No se ha detectado tu empresa. No puedes gestionar usuarios.
              </p>
            )}
          </div>

          <Button variant="outline" onClick={handleSyncMissing} disabled={!companyId || syncing || loading}>
            {syncing ? "Sincronizando..." : "Sincronizar usuarios sin rol"}
          </Button>
        </div>

        <Card className="overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !companyId ? (
            <div className="p-8 text-center text-muted-foreground">No hay empresa detectada.</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No hay usuarios en tu empresa</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol actual</TableHead>
                  <TableHead>Cambiar rol</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((userItem) => (
                  <TableRow key={userItem.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{userItem.full_name || "Sin nombre"}</p>
                        <p className="text-xs text-muted-foreground">{userItem.id === user?.id && "(Tú)"}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      {userItem.role ? (
                        <Badge variant={roleBadgeVariants[userItem.role]}>{roleLabels[userItem.role]}</Badge>
                      ) : (
                        <Badge variant="outline">Sin rol (NO asignado)</Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      <Select
                        value={(userItem.role ?? "worker") as AppRole}
                        onValueChange={(value: AppRole) => handleRoleChange(userItem.id, value)}
                        disabled={updating === userItem.id || userItem.id === user?.id || !companyId}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="worker">Trabajador</SelectItem>
                          <SelectItem value="hr">RRHH</SelectItem>
                          <SelectItem value="owner">Dirección</SelectItem>
                        </SelectContent>
                      </Select>

                      {!userItem.role && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Este usuario no tiene fila en <code>company_user_roles</code>. Al cambiar rol se crea.
                        </p>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
