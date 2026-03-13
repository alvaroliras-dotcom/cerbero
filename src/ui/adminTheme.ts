import CerberoLogo from "../assets/LOGOTIPO-CERBERO.svg";
import SolventoLogo from "../assets/LOGOTIPO-SOLVENTO-COLOR.svg";

export const adminTheme = {
  brandName: "Solvento",

  logos: {
    main: SolventoLogo,
    secondary: CerberoLogo,
  },

  colors: {
    appBg: "#F5F7FA",

    panelBg: "#FFFFFF",
    panelSoft: "#F8FAFC",
    panelAlt: "#EEF2F6",

    text: "#1F2937",
    textSoft: "#6B7280",
    textMuted: "#94A3B8",
    textOnPrimary: "#FFFFFF",

    border: "#E5E7EB",
    borderStrong: "#D1D5DB",

    primary: "#4BADA9",
    primaryHover: "#3D9894",
    primarySoft: "#DDF4F3",

    secondaryBg: "#F3F4F6",
    secondaryHover: "#E5E7EB",

    success: "#16A34A",
    successSoft: "#DCFCE7",

    warning: "#D97706",
    warningSoft: "#FEF3C7",

    danger: "#B42318",
    dangerHover: "#991B1B",
    dangerSoft: "#FEE4E2",

    info: "#0EA5E9",
    overlay: "rgba(15, 23, 42, 0.42)",
  },

  radius: {
    sm: "10px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    pill: "999px",
  },

  shadow: {
    sm: "0 6px 14px rgba(15, 23, 42, 0.06)",
    md: "0 12px 28px rgba(15, 23, 42, 0.08)",
    lg: "0 18px 40px rgba(15, 23, 42, 0.12)",
  },

  layout: {
    pagePadding: "16px",
    sectionGap: "12px",
    cardPadding: "16px",
    sidebarWidth: "170px",
    maxWidth: "1600px",
    headerHeight: "64px",
    controlHeight: "40px",
  },
} as const;