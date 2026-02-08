import * as React from "react";
import { cn } from "@/lib/utils";

interface SolventoLogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: "color" | "white" | "dark";
  showText?: boolean;
}

export function SolventoLogo({
  className,
  variant = "color",
  showText = true,
  ...props
}: SolventoLogoProps) {
  // Solvento corporate colors
  const primaryColor = variant === "white" ? "#FFFFFF" : variant === "dark" ? "#00575C" : "#00747A";
  const textColor = variant === "white" ? "#FFFFFF" : variant === "dark" ? "#00575C" : "#00747A";

  return (
    <svg
      viewBox="0 0 200 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-8 w-auto", className)}
      {...props}
    >
      {/* Solvento Logo Mark - Abstract S shape */}
      <g>
        {/* Top arc */}
        <path
          d="M10 15 C10 8, 18 5, 25 5 C32 5, 38 8, 38 15 C38 20, 34 23, 28 25"
          stroke={primaryColor}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Bottom arc */}
        <path
          d="M28 25 C22 27, 18 30, 18 35 C18 42, 24 45, 31 45 C38 45, 44 42, 44 35"
          stroke={primaryColor}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Center dot */}
        <circle cx="28" cy="25" r="3" fill={primaryColor} />
      </g>

      {/* Text: SOLVENTO */}
      {showText && (
        <text
          x="55"
          y="32"
          fontFamily="Space Grotesk, Inter, system-ui, sans-serif"
          fontSize="20"
          fontWeight="600"
          fill={textColor}
          letterSpacing="1"
        >
          SOLVENTO
        </text>
      )}
    </svg>
  );
}

// Compact version for headers
export function SolventoLogoCompact({
  className,
  variant = "color",
  ...props
}: Omit<SolventoLogoProps, "showText">) {
  const primaryColor = variant === "white" ? "#FFFFFF" : variant === "dark" ? "#00575C" : "#00747A";

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-8 w-8", className)}
      {...props}
    >
      {/* Solvento Logo Mark - Abstract S shape */}
      <g transform="translate(4, 4)">
        {/* Top arc */}
        <path
          d="M8 14 C8 6, 18 2, 26 2 C34 2, 40 8, 40 14 C40 20, 34 24, 26 26"
          stroke={primaryColor}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Bottom arc */}
        <path
          d="M26 26 C18 28, 12 32, 12 38 C12 46, 20 50, 30 50 C38 50, 44 44, 44 38"
          stroke={primaryColor}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Center dot */}
        <circle cx="26" cy="26" r="4" fill={primaryColor} />
      </g>
    </svg>
  );
}
