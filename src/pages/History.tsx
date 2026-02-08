import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { LogIn, LogOut, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type ClockType = "in" | "out";

interface ClockEntry {
  id: string;
  type: ClockType;
  timestamp: string;
  location?: string | null;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatTimeFromISO(iso: string) {
  const d = new Date(iso);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function formatDateTitle(date: Date) {
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

function calcHoursForDay(entries: ClockEntry[]) {
  let totalMs = 0;
  let lastIn: Date | null = null;

  for (const e of entries) {
    const t = new Date(e.timestamp);
    if (e.type === "in") {
      lastIn = t;
    } else if (lastIn) {
      totalMs += t.getTime() - lastIn.getTime();
      lastIn = null;
    }
  }

  return totalMs / 1000 / 60 / 60;
}

export default function History() {
  const { user } = useAuth();
  const [days, setDays] = useState<
    { date: Date; entries: ClockEntry[]; hasIncident: boolean }[]
  >([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      setLoadError(null);

      const from = new Date();
      from.setDate(from.getDate() - 14);

      const { data, error } = await supabase
        .from("clock_entries")
        .select("id, type, timestamp, location")
        .eq("user_id", user.id)
        .gte("timestamp", from.toISOString())
        .order("timestamp", { ascending: true });

      if (error) {
        console.error("History load error:", error);
        setLoadError(error.message);
        setDays([]);
        return;
      }

      if (!data || data.length === 0) {
        setDays([]);
        return;
      }

      const map = new Map<string, ClockEntry[]>();

      for (const e of data as ClockEntry[]) {
        const d = new Date(e.timestamp);
        const key = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(e);
      }

      const result = Array.from(map.entries()).map(([key, entries]) => {
        const [y, m, d] = key.split("-").map(Number);
        return {
          date: new Date(y, m - 1, d),
          entries,
          hasIncident: entries.length % 2 !== 0,
        };
      });

      setDays(result.reverse());
    };

    load();
  }, [user?.id]);

  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Historial</h1>
          <p className="text-muted-foreground text-sm">Registro de tus fichajes</p>
        </div>

        {loadError ? (
          <Card className="p-4 text-sm text-destructive">
            Error cargando historial: {loadError}
          </Card>
        ) : days.length === 0 ? (
          <Card className="p-4 text-sm text-muted-foreground">
            No hay fichajes registrados todavía.
          </Card>
        ) : (
          <div className="space-y-4">
            {days.map((day) => {
              const hours = calcHoursForDay(day.entries);

              return (
                <Card key={day.date.toISOString()} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">
                        {formatDateTitle(day.date)}
                      </span>
                      {day.hasIncident && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <StatusBadge
                      variant={day.hasIncident ? "pending" : "active"}
                    >
                      {hours.toFixed(1)}h
                    </StatusBadge>
                  </div>

                  <div className="space-y-2">
                    {day.entries.map((entry) => (
                      <div
                        key={entry.id}
                        className={cn(
                          "flex items-center gap-3 text-sm",
                          entry.type === "in"
                            ? "text-primary"
                            : "text-destructive"
                        )}
                      >
                        {entry.type === "in" ? (
                          <LogIn className="h-4 w-4" />
                        ) : (
                          <LogOut className="h-4 w-4" />
                        )}
                        <span>{formatTimeFromISO(entry.timestamp)}</span>
                        {entry.location && (
                          <span className="text-muted-foreground text-xs">
                            {entry.location}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
