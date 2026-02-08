import { NavLink, useLocation } from "react-router-dom";
import { Home, Calendar, Clock, FileText, Settings, Users, BarChart3, Send, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface MobileNavProps {
  role: AppRole;
}

const navItemsByRole: Record<AppRole, { to: string; icon: typeof Home; label: string }[]> = {
  worker: [
    { to: "/", icon: Home, label: "Inicio" },
    { to: "/week", icon: Calendar, label: "Semana" },
    { to: "/requests", icon: Send, label: "Solicitudes" },
    { to: "/reports", icon: FileText, label: "Informes" },
    { to: "/settings", icon: Settings, label: "Ajustes" },
  ],

  hr: [
    { to: "/hr", icon: Home, label: "Dashboard" },
    { to: "/approvals", icon: CheckSquare, label: "Aprobar" },
    { to: "/reports", icon: FileText, label: "Informes" },
    { to: "/settings", icon: Settings, label: "Ajustes" },
  ],

  owner: [
    { to: "/admin", icon: BarChart3, label: "Dashboard" },
    { to: "/users", icon: Users, label: "Usuarios" },
    { to: "/approvals", icon: CheckSquare, label: "Aprobar" },
    { to: "/reports", icon: FileText, label: "Informes" },
  ],
};

export function MobileNav({ role }: MobileNavProps) {
  const location = useLocation();
  const navItems = navItemsByRole[role] ?? [];

  return (
    <nav className="mobile-nav z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-full transition-all duration-200",
                "min-w-[60px]",
                isActive ? "text-primary bg-solvento-soft" : "text-muted-foreground hover:text-solvento-dark",
              )}
            >
              <Icon className={cn("w-5 h-5 transition-transform duration-200", isActive && "scale-110")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
