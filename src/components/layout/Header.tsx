import { Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function Header({ hasNotifications = false }: { hasNotifications?: boolean }) {
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();

  const roleLabels: Record<string, string> = {
    worker: "Trabajador",
    hr: "RRHH",
    owner: "Dirección",
  };

  const displayName = user?.user_metadata?.name || user?.email || "Usuario";

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login", { replace: true });
      toast.success("Sesión cerrada correctamente");
    } catch {
      toast.error("Error al cerrar sesión");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border safe-top">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src="/logos/solvento-mark-cropped.svg"
            alt="Solvento"
            className="h-9 w-auto"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
          <span className="hidden text-primary font-semibold">Solvento</span>

          <div>
            <h2 className="font-semibold text-sm">{displayName}</h2>
            {role && (
              <StatusBadge variant="role" className="mt-0.5">
                {roleLabels[role] || role}
              </StatusBadge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative rounded-full">
            <Bell className="w-5 h-5" />
            {hasNotifications && <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
