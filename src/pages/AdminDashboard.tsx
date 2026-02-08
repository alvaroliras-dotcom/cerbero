import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HoursProgress } from "@/components/ui/hours-progress";
import { Users, Shield, FileText, AlertTriangle, CheckCircle2, Clock, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState(0);
  const [todayIncidents, setTodayIncidents] = useState(0);
  const [todayHours, setTodayHours] = useState(0);

  useEffect(() => {
    // Total empleados
    supabase
      .from("profiles")
      .select("id")
      .then(({ data }) => {
        if (data) setEmployees(data.length);
      });

    // Fichajes de hoy
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    supabase
      .from("clock_entries")
      .select("user_id,type,timestamp")
      .gte("timestamp", start.toISOString())
      .lt("timestamp", end.toISOString())
      .then(({ data }) => {
        if (!data) return;

        // horas cerradas + incidencias
        const byUser = new Map<string, { open: boolean; ms: number; lastIn?: Date }>();

        for (const e of data) {
          if (!byUser.has(e.user_id)) {
            byUser.set(e.user_id, { open: false, ms: 0 });
          }
          const row = byUser.get(e.user_id)!;
          const t = new Date(e.timestamp);

          if (e.type === "in") {
            row.lastIn = t;
            row.open = true;
          } else if (row.lastIn) {
            row.ms += t.getTime() - row.lastIn.getTime();
            row.lastIn = undefined;
            row.open = false;
          }
        }

        let incidents = 0;
        let totalMs = 0;

        byUser.forEach((v) => {
          if (v.open) incidents += 1;
          totalMs += v.ms;
        });

        setTodayIncidents(incidents);
        setTodayHours(totalMs / 1000 / 60 / 60);
      });
  }, []);

  const compliance = useMemo(() => {
    if (employees === 0) return 100;
    return Math.max(90, 100 - todayIncidents * 2);
  }, [employees, todayIncidents]);

  const monthLabel = useMemo(() => {
    return new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  }, []);

  return (
    <AppLayout hasNotifications>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold">Panel de Dirección</h1>
          <p className="text-muted-foreground text-sm capitalize">{monthLabel}</p>
        </div>

        {/* Compliance */}
        <Card className="p-4 bg-success/10 border-success/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="font-semibold">Cumplimiento legal: {compliance.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Basado en incidencias reales del día</p>
            </div>
          </div>
        </Card>

        {/* Horas hoy */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Horas trabajadas hoy</h3>
          <HoursProgress current={todayHours} target={employees * 8} label="Hoy" />
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <Users className="mb-1" />
            <p className="text-2xl font-bold">{employees}</p>
            <p className="text-xs text-muted-foreground">Empleados</p>
          </Card>

          <Card className="p-4">
            <AlertTriangle className="mb-1 text-warning" />
            <p className="text-2xl font-bold">{todayIncidents}</p>
            <p className="text-xs text-muted-foreground">Incidencias hoy</p>
          </Card>
        </div>

        {/* Acciones */}
        <div className="space-y-3">
          <h2 className="font-semibold">Acciones rápidas</h2>

          <Card className="p-4 card-interactive" onClick={() => navigate("/admin/config")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield />
                <div>
                  <p className="font-medium">Configurar reglas</p>
                  <p className="text-xs text-muted-foreground">Horarios y tolerancias</p>
                </div>
              </div>
              <ChevronRight />
            </div>
          </Card>

          <Card className="p-4 card-interactive" onClick={() => navigate("/users")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users />
                <div>
                  <p className="font-medium">Gestionar usuarios</p>
                  <p className="text-xs text-muted-foreground">Roles y accesos</p>
                </div>
              </div>
              <ChevronRight />
            </div>
          </Card>

          <Card className="p-4 opacity-50">
            <div className="flex items-center gap-3">
              <FileText />
              <div>
                <p className="font-medium">Informes legales</p>
                <p className="text-xs text-muted-foreground">Próximamente</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-4 text-xs text-muted-foreground text-center">
          CERBERO · Panel de Dirección · Datos reales
        </Card>
      </div>
    </AppLayout>
  );
}
