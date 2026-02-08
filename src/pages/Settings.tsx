import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, MapPin, Shield, HelpCircle, LogOut, ChevronRight, Moon, Smartphone } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Settings() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(true);
  const [locationReminder, setLocationReminder] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-display font-bold">Ajustes</h1>
          <p className="text-muted-foreground text-sm">Configuración de tu cuenta</p>
        </div>

        {/* Notifications */}
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <h2 className="text-sm font-medium text-muted-foreground px-1">Notificaciones</h2>
          <Card className="divide-y divide-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Recordatorios de fichaje</p>
                  <p className="text-xs text-muted-foreground">Avisos si olvidas fichar</p>
                </div>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Recordatorio en oficina</p>
                  <p className="text-xs text-muted-foreground">Al llegar a la oficina</p>
                </div>
              </div>
              <Switch checked={locationReminder} onCheckedChange={setLocationReminder} />
            </div>
          </Card>
        </div>

        {/* Privacy */}
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: "150ms" }}>
          <h2 className="text-sm font-medium text-muted-foreground px-1">Privacidad</h2>
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="font-medium text-sm">Tu privacidad</p>
                <p className="text-xs text-muted-foreground mt-1">
                  CERBERO solo registra tu ubicación en el momento exacto del fichaje. No realizamos seguimiento
                  continuo ni almacenamos historial de ubicaciones.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* App Settings */}
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <h2 className="text-sm font-medium text-muted-foreground px-1">Aplicación</h2>
          <Card className="divide-y divide-border">
            <button className="flex items-center justify-between p-4 w-full">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                  <Moon className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="font-medium text-sm">Tema oscuro</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button className="flex items-center justify-between p-4 w-full">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="font-medium text-sm">Instalar app</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </Card>
        </div>

        {/* Help */}
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: "250ms" }}>
          <h2 className="text-sm font-medium text-muted-foreground px-1">Ayuda</h2>
          <Card>
            <button className="flex items-center justify-between p-4 w-full">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="font-medium text-sm">Centro de ayuda</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </Card>
        </div>

        {/* Logout */}
        <div className="animate-slide-up" style={{ animationDelay: "300ms" }}>
          <Button
            variant="outline"
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>

        {/* App Version */}
        <div className="text-center text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: "350ms" }}>
          <p>CERBERO v1.0.0</p>
          <p className="mt-1">© 2026 Solvento</p>
        </div>
      </div>
    </AppLayout>
  );
}
