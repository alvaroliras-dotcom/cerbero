import * as React from "react";
import { cn } from "@/lib/utils";

interface TimeDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  time: string;
  label?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const TimeDisplay = React.forwardRef<HTMLDivElement, TimeDisplayProps>(
  ({ className, time, label, size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "text-lg",
      md: "text-2xl",
      lg: "text-time-lg",
      xl: "text-time-xl",
    };

    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center", className)}
        {...props}
      >
        <span
          className={cn(
            "time-display font-display font-bold tracking-tight",
            sizeClasses[size]
          )}
        >
          {time}
        </span>
        {label && (
          <span className="text-sm text-muted-foreground mt-1">{label}</span>
        )}
      </div>
    );
  }
);

TimeDisplay.displayName = "TimeDisplay";

export { TimeDisplay };
