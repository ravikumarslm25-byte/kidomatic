export default function slugify(s = "") {
  return String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40)
    + "-" + Math.random().toString(36).slice(2, 6);
}
