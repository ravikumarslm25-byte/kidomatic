// App-level configuration. Branding values here are the platform defaults;
// per-tenant white-label overrides replace them at runtime (see store/branding).
export const APP = {
  name: "KidoMatic",
  tagline: "AI-powered school, beautifully run",
  poweredBy: "HackGeniX",
  // The academic model drives which modules/behaviour a school sees.
  academicModel: "k12_preschool", // "early_years" | "k12" | "k12_preschool"
};

export const BRANDING_DEFAULT = {
  name: "KidoMatic",
  tagline: "AI-powered school, beautifully run",
  colors: { navy: "#14335E", blue: "#1651A3", coral: "#E85410", sea: "#446D98", cream: "#F2F6FC" },
  school: {
    name: "Blue Lagoon International School",
    branch: "Salem Campus",
    board: "CBSE",
    session: "2026–27",
  },
};

export const USE_MOCK = (import.meta.env?.VITE_USE_MOCK ?? "true") !== "false";
export const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:4000/api";
// KidoMatic Worlds (the kids' app). Empty → the homepage links to the /worlds page instead.
export const WORLDS_URL = (import.meta.env?.VITE_WORLDS_URL || "").replace(/\/+$/, "");
