// In-memory mock database seeded from the module registry.
// Persists for the browser session so CRUD feels real without a backend.
import { MODULES } from "@/config/modules";
import { uid } from "@/lib/id";

const store = {};
const clone = (o) => JSON.parse(JSON.stringify(o));

function ensure(resource) {
  if (!store[resource]) {
    const seed = MODULES[resource]?.seed || [];
    store[resource] = seed.map((r) => ({ id: uid(resource), ...r }));
  }
  return store[resource];
}

const wait = (ms = 220) => new Promise((res) => setTimeout(res, ms));

export const mockDb = {
  async list(resource, { q } = {}) {
    await wait();
    let rows = clone(ensure(resource));
    if (q) {
      const keys = MODULES[resource]?.searchKeys || Object.keys(rows[0] || {});
      const needle = q.toLowerCase();
      rows = rows.filter((r) => keys.some((k) => String(r[k] ?? "").toLowerCase().includes(needle)));
    }
    return rows;
  },
  async create(resource, payload) {
    await wait();
    const row = { id: uid(resource), ...payload };
    ensure(resource).unshift(row);
    return clone(row);
  },
  async update(resource, id, payload) {
    await wait();
    const rows = ensure(resource);
    const i = rows.findIndex((r) => r.id === id);
    if (i === -1) throw new Error("Record not found");
    rows[i] = { ...rows[i], ...payload };
    return clone(rows[i]);
  },
  async remove(resource, id) {
    await wait();
    const rows = ensure(resource);
    const i = rows.findIndex((r) => r.id === id);
    if (i !== -1) rows.splice(i, 1);
    return { id };
  },
  all(resource) { return clone(ensure(resource)); },
};
