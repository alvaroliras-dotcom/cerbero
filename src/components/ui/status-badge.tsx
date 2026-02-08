import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        active: "bg-solvento-soft text-primary border border-primary/20",
        pending: "bg-warning/15 text-warning border border-warning/20",
        inactive: "bg-solvento-bg text-primary border border-primary/10",
        working: "bg-solvento-soft text-primary border border-primary/20",
        role: "bg-solvento-bg text-primary border border-primary/15",
      },
    },
    defaultVariants: {
      variant: "inactive",
    },
  }
);

interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  showDot?: boolean;
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ className, variant, showDot = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(statusBadgeVariants({ variant }), className)}
        {...props}
      >
        {showDot && (
          <span
            className={cn(
              "status-dot",
              variant === "active" && "status-dot-active",
              variant === "pending" && "status-dot-pending",
              variant === "working" && "bg-primary",
              variant === "inactive" && "bg-muted-foreground"
            )}
          />
        )}
        {children}
      </div>
    );
  }
);

StatusBadge.displayName = "StatusBadge";

export { StatusBadge, statusBadgeVariants };
