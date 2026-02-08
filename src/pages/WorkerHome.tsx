import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { ClockButton } from "@/components/ui/clock-button";
import { TimeDisplay } from "@/components/ui/time-display";
import { HoursProgress } from "@/components/ui/hours-progress";
import { TodayEntries } from "@/components/clock/TodayEntries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

interface DbClockEntry {
  id: string;
  user_id: string;
  company_id: string | null;
  type: string;
  timestamp: string;
  location: string | null;
  created_at: string;
}

interface DisplayEntry {
  id: string;
  type: "in" | "out";
  time: string;
  location?: string;
}

const WorkerHome = () => {
  const { user, companyId, loading: authLoading } = useAuth();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [dbEntries, setDbEntries] = useState<DbClockEntry[]>([]);
  const [currentTime, setCurrentTime] = useState(format(new Date(), "HH:mm:ss"));
  const [loading, setLoading] = useState(true);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(format(new Date(), "HH:mm:ss"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch today's entries on mount
  useEffect(() => {
    if (!user?.id) return;

    const fetchTodayEntries = async () => {
      setLoading(true);

      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

      const { data, error } = await supabase
        .from("clock_entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("timestamp", startOfDay)
        .lt("timestamp", endOfDay)
        .order("timestamp", { ascending: true });

      if (error) {
        console.error("Error fetching entries:", error);
        toast.error("Error al cargar fichajes de hoy");
        setDbEntries([]);
        setIsClockedIn(false);
      } else {
        const rows = (data || []) as DbClockEntry[];
        setDbEntries(rows);
        const lastEntry = rows.length ? rows[rows.length - 1] : null;
        setIsClockedIn(lastEntry?.type === "in");
      }

      setLoading(false);
    };

    fetchTodayEntries();
  }, [user?.id]);

  // Convert DB entries to display format
  const displayEntries: DisplayEntry[] = dbEntries.map((entry) => ({
    id: entry.id,
    type: entry.type as "in" | "out",
    time: format(new Date(entry.timestamp), "HH:mm"),
    location: entry.location || undefined,
  }));

  const handleClockIn = async () => {
    if (!user?.id) return;

    if (!companyId) {
      toast.error("No se ha detectado tu empresa. Cierra sesión y vuelve a entrar.");
      return;
    }

    const now = new Date();
    const newEntry = {
      user_id: user.id,
      company_id: companyId, // ✅ requerido por RLS
      type: "in",
      timestamp: now.toISOString(),
      location: "Oficina Solvento",
    };

    const { data, error } = await supabase.from("clock_entries").insert([newEntry]).select().single();

    if (error) {
      console.error("Error al insertar el fichaje:", error);
      toast.error("No se pudo fichar (RLS/permisos).");
      return;
    }

    if (data) {
      setDbEntries((prev) => [...prev, data as DbClockEntry]);
      setIsClockedIn(true);
    }
  };

  const handleClockOut = async () => {
    if (!user?.id) return;

    if (!companyId) {
      toast.error("No se ha detectado tu empresa. Cierra sesión y vuelve a entrar.");
      return;
    }

    const now = new Date();
    const newEntry = {
      user_id: user.id,
      company_id: companyId, // ✅ requerido por RLS
      type: "out",
      timestamp: now.toISOString(),
      location: "Oficina Solvento",
    };

    const { data, error } = await supabase.from("clock_entries").insert([newEntry]).select().single();

    if (error) {
      console.error("Error al insertar el fichaje:", error);
      toast.error("No se pudo fichar (RLS/permisos).");
      return;
    }

    if (data) {
      setDbEntries((prev) => [...prev, data as DbClockEntry]);
      setIsClockedIn(false);
    }
  };

  const calculateWorkedHours = (): number => {
    let totalMs = 0;
    let lastInTime: Date | null = null;

    for (const entry of dbEntries) {
      if (entry.type === "in") {
        lastInTime = new Date(entry.timestamp);
      } else if (entry.type === "out" && lastInTime) {
        totalMs += new Date(entry.timestamp).getTime() - lastInTime.getTime();
        lastInTime = null;
      }
    }

    if (lastInTime && isClockedIn) {
      totalMs += Date.now() - lastInTime.getTime();
    }

    return totalMs / (1000 * 60 * 60);
  };

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  // ✅ Si no hay companyId, NO intentamos “refrescar” ni hacer loops: mostramos aviso estable
  if (!companyId) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
            </h1>
            <TimeDisplay time={currentTime} size="lg" className="mt-2" />
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <ClockButton
                  variant="enter"
                  onClick={() => toast.error("No se ha detectado tu empresa. Cierra sesión y vuelve a entrar.")}
                />
                <p className="text-sm text-muted-foreground text-center">
                  No se ha detectado tu empresa. <br />
                  Cierra sesión y vuelve a entrar.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
          </h1>
          <TimeDisplay time={currentTime} size="lg" className="mt-2" />
        </div>

        {/* Clock Button */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              {isClockedIn ? (
                <ClockButton variant="exit" onClick={handleClockOut} />
              ) : (
                <ClockButton variant="enter" onClick={handleClockIn} />
              )}
              <p className="text-sm text-muted-foreground">
                {isClockedIn ? "Estás fichado. Pulsa para salir." : "Pulsa para fichar entrada."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Hours Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progreso del día</CardTitle>
          </CardHeader>
          <CardContent>
            <HoursProgress current={calculateWorkedHours()} target={8} />
          </CardContent>
        </Card>

        {/* Today's Entries */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fichajes de hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <TodayEntries entries={displayEntries} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default WorkerHome;
