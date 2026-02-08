import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { HoursProgress } from "@/components/ui/hours-progress";
import { useAuth } from "@/hooks/useAuth";

type ClockType = "in" | "out";

interface ClockEntry {
  id: string;
  type: ClockType;
  occurredAt: string; // ISO
  location?: string;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function dayKeyFromDate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatDayLabel(d: Date) {
  return d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" });
}

function calcClosedHours(entries: ClockEntry[]) {
  let totalMs = 0;
  let lastIn: Date | null = null;

  for (const e of entries) {
    const t = new Date(e.occurredAt);
    if (e.type === "in") lastIn = t;
    else if (lastIn) {
      totalMs += t.getTime() - lastIn.getTime();
      lastIn = null;
    }
  }

  return totalMs / 1000 / 60 / 60;
}

export default function ResumenSemanal() {
  const { user } = useAuth();
  const userKey = user?.id || user?.email || "anon";

  const [weekRows, setWeekRows] = useState<{ date: Date; key: string; hours: number; hasOpenSession: boolean }[]>([]);

  useEffect(() => {
    const rows: { date: Date; key: string; hours: number; hasOpenSession: boolean }[] = [];

    // últimos 7 días (incluye hoy)
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);

      const key = dayKeyFromDate(d);
      const storageKey = `cerbero_clock_entries:${userKey}:${key}`;

      let entries: ClockEntry[] = [];
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw) as ClockEntry[];
          if (Array.isArray(parsed)) entries = parsed;
        }
      } catch {
        entries = [];
      }

      const hours = calcClosedHours(entries);
      const hasOpenSession = entries.length % 2 !== 0;

      rows.push({ date: d, key, hours, hasOpenSession });
    }

    setWeekRows(rows);
  }, [userKey]);

  const totalWeekHours = useMemo(() => {
    return weekRows.reduce((acc, r) => acc + r.hours, 0);
  }, [weekRows]);

  // objetivo demo
  const weeklyTarget = 40;

  const monthLabel = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  }, []);

  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-6">
        <div className="animate-fade-in">
          <h1 className="text-2xl font-display font-bold">Resumen semanal</h1>
          <p className="text-muted-foreground text-sm capitalize">{monthLabel}</p>
        </div>

        <Card className="p-4 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <h3 className="font-semibold mb-3">Horas esta semana</h3>
          <HoursProgress current={Number(totalWeekHours.toFixed(2))} target={weeklyTarget} label="Semana actual" />
          <div className="mt-3 text-sm text-muted-foreground">
            Total: <span className="font-semibold text-foreground">{totalWeekHours.toFixed(2)}h</span>
          </div>
        </Card>

        <Card className="p-4 animate-slide-up" style={{ animationDelay: "150ms" }}>
          <h3 className="font-semibold mb-3">Día a día</h3>

          <div className="space-y-3">
            {weekRows.map((r) => (
              <div key={r.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium capitalize">{formatDayLabel(r.date)}</span>
                  {r.hasOpenSession && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-warning/15 text-warning border border-warning/20">
                      sesión abierta
                    </span>
                  )}
                </div>
                <span className="text-sm font-semibold">{r.hours.toFixed(2)}h</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
