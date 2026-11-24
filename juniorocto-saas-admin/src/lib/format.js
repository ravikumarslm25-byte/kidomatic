// Display formatters — keep all human-facing formatting in one place.
export const inr = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
    .format(Number(n || 0));

export const num = (n) => new Intl.NumberFormat("en-IN").format(Number(n || 0));

export const dateFmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const initials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";

export const titleCase = (s = "") => s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
