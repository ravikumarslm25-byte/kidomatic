export const APP = { name: "KidoMatic", portal: "Master Admin", poweredBy: "HackGeniX" };
export const USE_MOCK = (import.meta.env?.VITE_USE_MOCK ?? "true") !== "false";
export const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:4000/api";
