import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function BootstrapOwner() {
  const navigate = useNavigate();
  const { user, loading, refreshRole } = useAuth();
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/acceso", { replace: true });
    }
  }, [loading, user, navigate]);

  const bootstrap = async () => {
    if (!user) return;
    setWorking(true);

    try {
      const { error } = await supabase.rpc("bootstrap_make_owner");
      if (error) {
        toast.error(error.message);
        return;
      }

      await refreshRole();
      window.location.href = "/admin";
    } catch {
      toast.error("Error inicializando el sistema");
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando…</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="p-6 w-full max-w-sm text-center space-y-4">
        <h2 className="text-lg font-semibold">Inicialización del sistema</h2>
        <Button onClick={bootstrap} disabled={working} className="w-full">
          {working ? "Configurando…" : "Convertirme en Dirección"}
        </Button>
      </Card>
    </div>
  );
}
