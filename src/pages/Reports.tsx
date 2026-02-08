import React, { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type ClockType = "in" | "out";

interface ClockEntry {
  id: string;
  type: ClockType;
  occurredAt: string; // ISO
  location?: string;
}

interface ReportOption {
  id: string;
  title: string;
  description: string;
  period: string;
  icon: React.ReactNode;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function dayKeyFromDate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatDateES(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function formatTimeES(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

function downloadTextFile(filename: string, content: string, mime = "text/csv;charset=utf-8;") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toCSV(rows: Record<string, string | number | null | undefined>[]) {
  if (rows.length === 0) return "date,time,type,location\n";

  const headers = Object.keys(rows[0]);
  const escape = (v: any) => {
    const s = String(v ?? "");
    // CSV safe
    if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const lines = [headers.join(","), ...rows.map((r) => headers.map((h) => escape((r as any)[h])).join(","))];

  return lines.join("\n") + "\n";
}

function readEntriesForRange(userKey: string, from: Date, to: Date) {
  // incluye from y to
  const entries: { day: string; entry: ClockEntry }[] = [];

  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);

  const end = new Date(to);
  end.setHours(0, 0, 0, 0);

  while (cursor.getTime() <= end.getTime()) {
    const key = dayKeyFromDate(cursor);
    const storageKey = `cerbero_clock_entries:${userKey}:${key}`;

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as ClockEntry[];
        if (Array.isArray(parsed)) {
          for (const e of parsed) {
            entries.push({ day: key, entry: e });
          }
        }
      }
    } catch {
      // ignore
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  // orden por fecha
  entries.sort((a, b) => new Date(a.entry.occurredAt).getTime() - new Date(b.entry.occurredAt).getTime());
  return entries;
}

const reportOptions: ReportOption[] = [
  {
    id: "weekly",
    title: "Informe Semanal",
    description: "CSV con fichajes de los últimos 7 días",
    period: "Últimos 7 días",
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    id: "monthly",
    title: "Informe Mensual",
    description: "CSV con fichajes del mes actual",
    period: "Mes actual",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: "yearly",
    title: "Informe Anual",
    description: "CSV con fichajes del año actual",
    period: "Año actual",
    icon: <FileText className="w-5 h-5" />,
  },
];

export default function Informes() {
  const { user } = useAuth();
  const userKey = user?.id || user?.email || "anon";

  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");

  const userName = (user?.user_metadata?.full_name as string | undefined) || user?.email || "Usuario";

  const today = useMemo(() => new Date(), []);
  const monthLabel = useMemo(() => today.toLocaleDateString("es-ES", { month: "long", year: "numeric" }), [today]);

  const doDownloadCSV = (rangeId: "weekly" | "monthly" | "yearly" | "custom") => {
    let from: Date;
    let to: Date;

    const now = new Date();

    if (rangeId === "weekly") {
      to = new Date(now);
      from = new Date(now);
      from.setDate(from.getDate() - 6);
    } else if (rangeId === "monthly") {
      to = new Date(now);
      from = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (rangeId === "yearly") {
      to = new Date(now);
      from = new Date(now.getFullYear(), 0, 1);
    } else {
      if (!customFrom || !customTo) {
        toast.error("Selecciona fechas (desde / hasta)");
        return;
      }
      from = new Date(customFrom + "T00:00:00");
      to = new Date(customTo + "T00:00:00");
      if (from.getTime() > to.getTime()) {
        toast.error("La fecha 'desde' no puede ser mayor que 'hasta'");
        return;
      }
    }

    const all = readEntriesForRange(userKey, from, to);

    const rows = all.map(({ entry }) => ({
      date: formatDateES(entry.occurredAt),
      time: formatTimeES(entry.occurredAt),
      type: entry.type === "in" ? "Entrada" : "Salida",
      location: entry.location ?? "",
    }));

    const csv = toCSV(rows);
    const fileName = `cerbero_${rangeId}_${dayKeyFromDate(from)}_a_${dayKeyFromDate(to)}.csv`;

    downloadTextFile(fileName, csv);
    toast.success("CSV descargado");
  };

  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-display font-bold">Informes</h1>
          <p className="text-muted-foreground text-sm">
            Descarga tus registros (demo en CSV) — <span className="capitalize">{monthLabel}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">Usuario: {userName}</p>
        </div>

        {/* Info Banner */}
        <Card className="p-4 bg-accent/50 border-accent animate-slide-up" style={{ animationDelay: "100ms" }}>
          <p className="text-sm text-accent-foreground">
            Estos informes se generan desde los fichajes guardados en el navegador (modo demo). Más adelante se
            conectará a base de datos.
          </p>
        </Card>

        {/* Report Options */}
        <div className="space-y-3">
          {reportOptions.map((report, index) => (
            <Card
              key={report.id}
              className="p-4 card-interactive animate-slide-up"
              style={{ animationDelay: `${150 + index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  {report.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{report.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{report.description}</p>
                  <p className="text-xs text-primary font-medium mt-1">{report.period}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="default" size="sm" className="flex-1" onClick={() => doDownloadCSV(report.id as any)}>
                  <Download className="w-4 h-4 mr-2" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" className="flex-1" disabled title="Pendiente">
                  <Download className="w-4 h-4 mr-2" />
                  PDF (próximamente)
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Custom Period */}
        <Card className="p-4 animate-slide-up" style={{ animationDelay: "350ms" }}>
          <div className="flex items-center justify-between w-full mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Período personalizado</h3>
                <p className="text-sm text-muted-foreground">Selecciona fechas específicas</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Desde</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Hasta</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm"
              />
            </div>
          </div>

          <div className="pt-3">
            <Button className="w-full" onClick={() => doDownloadCSV("custom")}>
              <Download className="w-4 h-4 mr-2" />
              Descargar CSV personalizado
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
