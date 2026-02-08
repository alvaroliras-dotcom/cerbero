import { LogIn, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClockEntry {
  id: string;
  type: "in" | "out";
  time: string;
  location?: string;
}

interface TodayEntriesProps {
  entries: ClockEntry[];
}

export function TodayEntries({ entries }: TodayEntriesProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p className="text-sm">Sin fichajes hoy</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground px-1">
        Fichajes de hoy
      </h3>
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl bg-muted/50",
              "animate-fade-in"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center",
                entry.type === "in"
                  ? "bg-success/15 text-success"
                  : "bg-destructive/15 text-destructive"
              )}
            >
              {entry.type === "in" ? (
                <LogIn className="w-4 h-4" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">
                {entry.type === "in" ? "Entrada" : "Salida"}
              </p>
              {entry.location && (
                <p className="text-xs text-muted-foreground">{entry.location}</p>
              )}
            </div>
            <span className="time-display text-lg font-semibold">
              {entry.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
