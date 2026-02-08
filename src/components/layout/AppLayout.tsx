import { ReactNode } from "react";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { useAuth } from "@/hooks/useAuth";

interface AppLayoutProps {
  children: ReactNode;
  hasNotifications?: boolean;
  hideNav?: boolean;
}

export function AppLayout({ children, hasNotifications = false, hideNav = false }: AppLayoutProps) {
  const { role } = useAuth();

  // Usar el rol desde company_user_roles (ya viene de useAuth actualizado)
  const effectiveRole = role ?? "worker";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header hasNotifications={hasNotifications} />

      <main className="flex-1 overflow-y-auto flex flex-col pb-20">{children}</main>

      {!hideNav && <MobileNav role={effectiveRole} />}
    </div>
  );
}
