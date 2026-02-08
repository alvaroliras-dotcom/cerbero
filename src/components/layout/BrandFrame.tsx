import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface BrandFrameProps {
  children: ReactNode;
  className?: string;
}

export function BrandFrame({ children, className }: BrandFrameProps) {
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto bg-primary",
        isMobile ? "p-3" : "p-4"
      )}
    >
      <div
        className={cn(
          "bg-white rounded-3xl shadow-sm min-h-full",
          isMobile 
            ? "pb-24" 
            : "max-w-[900px] w-full mx-auto p-6 pb-24",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
