import * as React from "react";
import { cn } from "@/lib/utils";
import { LogIn, LogOut } from "lucide-react";

interface ClockButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: "enter" | "exit";
  isActive?: boolean;
}

const ClockButton = React.forwardRef<HTMLButtonElement, ClockButtonProps>(
  ({ className, variant, isActive = false, children, ...props }, ref) => {
    const isEnter = variant === "enter";
    
    return (
      <button
        ref={ref}
        className={cn(
          "clock-button relative flex flex-col items-center justify-center gap-3",
          "w-44 h-44 rounded-full text-primary-foreground font-display font-semibold",
          "focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-background",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
          isEnter ? "clock-button-enter focus:ring-success/50" : "clock-button-exit focus:ring-destructive/50",
          isActive && isEnter && "pulse-active",
          className
        )}
        {...props}
      >
        {isEnter ? (
          <LogIn className="w-12 h-12" strokeWidth={2.5} />
        ) : (
          <LogOut className="w-12 h-12" strokeWidth={2.5} />
        )}
        <span className="text-2xl tracking-wide">
          {isEnter ? "ENTRAR" : "SALIR"}
        </span>
      </button>
    );
  }
);

ClockButton.displayName = "ClockButton";

export { ClockButton };
