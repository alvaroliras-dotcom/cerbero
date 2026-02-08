import * as React from "react";
import { cn } from "@/lib/utils";

interface HoursProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  current: number;
  target: number;
  label?: string;
}

const HoursProgress = React.forwardRef<HTMLDivElement, HoursProgressProps>(
  ({ className, current, target, label, ...props }, ref) => {
    const percentage = Math.min((current / target) * 100, 100);
    const remaining = Math.max(target - current, 0);

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{label || "Progreso"}</span>
          <span className="font-medium">
            <span className="text-foreground">{current.toFixed(1)}h</span>
            <span className="text-muted-foreground"> / {target}h</span>
          </span>
        </div>
        <div className="progress-hours">
          <div
            className="progress-hours-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {percentage >= 100 ? "✓ Completado" : `Faltan ${remaining.toFixed(1)}h`}
          </span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
      </div>
    );
  }
);

HoursProgress.displayName = "HoursProgress";

export { HoursProgress };
