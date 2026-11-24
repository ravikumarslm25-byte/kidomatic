import { USE_MOCK } from "@/config/app";
import { api } from "@/lib/http";
import { uid } from "@/lib/id";
import { LEADS, INVOICES, QUOTATIONS, TRANSACTIONS, TICKETS, USERS } from "./mock";

const M = {
  resellers: [
    { id: "r1", name: "Acme EdTech", slug: "acme-edtech", contactEmail: "ops@acme.edu", status: "active", revenueSharePct: 20, commissionPct: 25 },
    { id: "r2", name: "Nova Schools Group", slug: "nova", contactEmail: "hello@nova.in", status: "active", revenueSharePct: 18, commissionPct: 22 },
    { id: "r3", name: "EduPartners South", slug: "edupartners", contactEmail: "team@edupartners.in", status: "suspended", revenueSharePct: 20, commissionPct: 25 },
  ],
  schools: [
    { id: "s1", name: "Sunrise Public School", board: "CBSE", planKey: "pro", status: "active", resellerId: "r1" },
    { id: "s2", name: "Little Steps Preschool", board: "State", planKey: "growth", status: "active", resellerId: "r1" },
    { id: "s3", name: "Nova Central School", board: "ICSE", planKey: "pro", status: "active", resellerId: "r2" },
    { id: "s4", name: "Blue Lagoon International", board: "CBSE", planKey: "pro", status: "active", resellerId: null },
    { id: "s5", name: "Green Valley Academy", board: "ICSE", planKey: "starter", status: "suspended", resellerId: "r1" },
  ],
};

// Billing-model demo data: one invoice + licence per model.
const seat = (n) => ({ subtotal: n * 50, taxPct: 18, tax: Math.round(n * 50 * 0.18), total: n * 50 + Math.round(n * 50 * 0.18) });
const mkInv = (id, number, model, billToType, billTo, school, seats, status, dates) => { const t = seat(seats); return { id, number, model, billToType, billTo, schoolName: school, status, issueDate: dates[0], dueDate: dates[1], lineItems: [{ desc: `KidoMatic licence — ${seats} users @ ₹50/user/mo`, qty: seats, rate: 50, amount: t.subtotal }], ...t }; };
const INV = [
  mkInv("i1", "JO-INV-26-0001", "direct_web", "customer", { name: "Sunrise Public School", address: "Salem, Tamil Nadu", email: "admin@sunrise.edu", gstin: "33AABCS1111A1Z5" }, "Sunrise Public School", 120, "paid", ["2026-07-02", "2026-07-09"]),
  mkInv("i2", "JO-INV-26-0002", "wholesale_reseller", "reseller", { name: "Acme EdTech", address: "Chennai, Tamil Nadu", email: "ops@acme.edu", gstin: "33AACCA2222B1Z6" }, "Bright Future School", 200, "sent", ["2026-07-15", "2026-07-22"]),
  mkInv("i3", "JO-INV-26-0003", "referral", "customer", { name: "Nova Central School", address: "Coimbatore, Tamil Nadu", email: "office@nova.edu", gstin: "33AADCN3333C1Z7" }, "Nova Central School", 80, "draft", ["2026-07-20", "2026-07-27"]),
  mkInv("i4", "JO-INV-26-0004", "direct_sales", "customer", { name: "Green Valley Academy", address: "Madurai, Tamil Nadu", email: "info@greenvalley.edu", gstin: "" }, "Green Valley Academy", 60, "overdue", ["2026-06-28", "2026-07-05"]),
];
const LIC = [
  { id: "l1", schoolName: "Sunrise Public School", model: "direct_web", seats: 120, ratePerSeat: 50, amount: 6000, status: "active", activationSource: "gateway", invoiceId: "i1" },
  { id: "l2", schoolName: "Bright Future School", model: "wholesale_reseller", resellerName: "Acme EdTech", seats: 200, ratePerSeat: 50, amount: 10000, status: "pending", invoiceId: "i2" },
  { id: "l3", schoolName: "Nova Central School", model: "referral", resellerName: "Nova", seats: 80, ratePerSeat: 50, amount: 4000, status: "pending", invoiceId: "i3" },
  { id: "l4", schoolName: "Green Valley Academy", model: "direct_sales", seats: 60, ratePerSeat: 50, amount: 3000, status: "pending", invoiceId: "i4" },
];
const wait = (ms = 240) => new Promise((r) => setTimeout(r, ms));
const unwrap = (r) => r.data?.data ?? r.data;
const withId = (a) => a.map((x) => ({ ...x, id: x.id || x._id }));

export const platformService = {
  async summary() { if (USE_MOCK) { await wait(); return { resellers: M.resellers.length, schools: M.schools.length, activeSchools: M.schools.filter((s) => s.status === "active").length, students: 1855 }; } return unwrap(await api.get("/platform/summary")); },
  async resellers() { if (USE_MOCK) { await wait(); return M.resellers; } return withId(unwrap(await api.get("/platform/resellers"))); },
  async createReseller(p) { if (USE_MOCK) { await wait(); const r = { id: uid("r"), slug: (p.name || "").toLowerCase().replace(/\s+/g, "-"), status: "active", revenueSharePct: 20, commissionPct: 25, ...p }; M.resellers.unshift(r); return r; } return unwrap(await api.post("/platform/resellers", p)); },
  async updateReseller(id, patch) { if (USE_MOCK) { await wait(); const r = M.resellers.find((x) => x.id === id); Object.assign(r, patch); return r; } return unwrap(await api.patch(`/platform/resellers/${id}`, patch)); },
  async schools(resellerId) { if (USE_MOCK) { await wait(); return resellerId ? M.schools.filter((s) => s.resellerId === resellerId) : M.schools; } const q = resellerId ? `?resellerId=${resellerId}` : ""; return withId(unwrap(await api.get(`/platform/schools${q}`))); },
  async createSchool(p) { if (USE_MOCK) { await wait(); const s = { id: uid("s"), status: "active", ...p }; M.schools.unshift(s); return s; } return unwrap(await api.post("/platform/schools", p)); },
  async plans() { if (USE_MOCK) { await wait(); return Object.values((await import("@/config/plans")).PLANS); } return unwrap(await api.get("/platform/plans")); },

  // Business modules (mock-functional now; wire to /api/platform/* when built)
  async leads() { await wait(); return LEADS; },
  async invoices() { await wait(); return INVOICES; },
  async quotations() { await wait(); return QUOTATIONS; },
  async transactions() { await wait(); return TRANSACTIONS; },
  async tickets() { await wait(); return TICKETS; },
  async users() { await wait(); return USERS; },
  async reports() {
    await wait();
    const rev = [420, 510, 640, 720, 810, 986].map((v, i) => ({ m: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"][i], revenue: v * 1000 }));
    const byPlan = [{ plan: "Pro", mrr: 89991 }, { plan: "Growth", mrr: 41993 }, { plan: "Starter", mrr: 14995 }];
    const funnel = [{ stage: "New", n: 34 }, { stage: "Contacted", n: 22 }, { stage: "Qualified", n: 15 }, { stage: "Proposal", n: 9 }, { stage: "Won", n: 6 }];
    const growth = [12, 18, 27, 35, 44, 52].map((v, i) => ({ m: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"][i], schools: v }));
    const resellerMix = [{ name: "Direct", value: 40 }, { name: "Acme EdTech", value: 35 }, { name: "Nova", value: 15 }, { name: "EduPartners", value: 10 }];
    return { rev, byPlan, funnel, growth, resellerMix, kpis: { revenueYtd: 4086000, newLeads: 34, winRate: 26, arpa: 6410 } };
  },
  async invoices() { if (USE_MOCK) { await wait(); return INV; } return withId(unwrap(await api.get("/platform/invoices"))); },
  async invoice(id) { if (USE_MOCK) { await wait(); return INV.find((x) => x.id === id); } return unwrap(await api.get(`/platform/invoices/${id}`)); },
  async sendInvoice(id) { if (USE_MOCK) { await wait(); const i = INV.find((x) => x.id === id); i.status = "sent"; return i; } return unwrap(await api.post(`/platform/invoices/${id}/send`)); },
  async payInvoice(id) { if (USE_MOCK) { await wait(); const i = INV.find((x) => x.id === id); i.status = "paid"; const l = LIC.find((x) => x.invoiceId === id); if (l && (i.model === "direct_web" || i.model === "wholesale_reseller")) l.status = "active"; return i; } return unwrap(await api.post(`/platform/invoices/${id}/pay`)); },
  async licenses() { if (USE_MOCK) { await wait(); return LIC; } return withId(unwrap(await api.get("/platform/licenses"))); },
  async activateLicense(id) { if (USE_MOCK) { await wait(); const l = LIC.find((x) => x.id === id); l.status = "active"; l.activationSource = "admin"; return l; } return unwrap(await api.post(`/platform/licenses/${id}/activate`)); },
  async suspendLicense(id) { if (USE_MOCK) { await wait(); const l = LIC.find((x) => x.id === id); l.status = "suspended"; return l; } return unwrap(await api.post(`/platform/licenses/${id}/suspend`)); },

  // ---- CRM & ops modules (Leads, Quotations, Transactions, Users, Support) ----
  async leads() { if (USE_MOCK) { await wait(); return LEADS; } return withId(unwrap(await api.get("/platform/leads"))); },
  async createLead(p) { if (USE_MOCK) { await wait(); const r = { id: uid("L"), stage: "New", createdAt: new Date().toISOString().slice(0, 10), ...p }; LEADS.unshift(r); return r; } return unwrap(await api.post("/platform/leads", p)); },
  async updateLead(id, patch) { if (USE_MOCK) { await wait(); const r = LEADS.find((x) => x.id === id); Object.assign(r, patch); return r; } return unwrap(await api.patch(`/platform/leads/${id}`, patch)); },
  async quotations() { if (USE_MOCK) { await wait(); return QUOTATIONS; } return withId(unwrap(await api.get("/platform/quotations"))); },
  async createQuotation(p) { if (USE_MOCK) { await wait(); const r = { id: uid("Q"), status: "Draft", date: new Date().toISOString().slice(0, 10), ...p }; QUOTATIONS.unshift(r); return r; } return unwrap(await api.post("/platform/quotations", p)); },
  async updateQuotation(id, patch) { if (USE_MOCK) { await wait(); const r = QUOTATIONS.find((x) => x.id === id); Object.assign(r, patch); return r; } return unwrap(await api.patch(`/platform/quotations/${id}`, patch)); },
  async sendQuotation(id) { if (USE_MOCK) { await wait(); const r = QUOTATIONS.find((x) => x.id === id); r.status = "Sent"; return r; } return unwrap(await api.post(`/platform/quotations/${id}/send`)); },
  async convertQuotation(id) { if (USE_MOCK) { await wait(); const r = QUOTATIONS.find((x) => x.id === id); r.status = "Accepted"; return r; } return unwrap(await api.post(`/platform/quotations/${id}/convert`)); },
  async transactions() { if (USE_MOCK) { await wait(); return TRANSACTIONS; } return withId(unwrap(await api.get("/platform/transactions"))); },
  async users() { if (USE_MOCK) { await wait(); return USERS; } return withId(unwrap(await api.get("/platform/users"))); },
  async createUser(p) { if (USE_MOCK) { await wait(); const r = { id: uid("U"), status: "invited", lastActive: "\u2014", ...p }; USERS.unshift(r); return r; } return unwrap(await api.post("/platform/users", p)); },
  async updateUser(id, patch) { if (USE_MOCK) { await wait(); const r = USERS.find((x) => x.id === id); Object.assign(r, patch); return r; } return unwrap(await api.patch(`/platform/users/${id}`, patch)); },
  async tickets() { if (USE_MOCK) { await wait(); return TICKETS; } return withId(unwrap(await api.get("/platform/tickets"))); },
  async updateTicket(id, patch) { if (USE_MOCK) { await wait(); const r = TICKETS.find((x) => x.id === id); Object.assign(r, patch); return r; } return unwrap(await api.patch(`/platform/tickets/${id}`, patch)); },
  async replyTicket(id, message) { if (USE_MOCK) { await wait(); const r = TICKETS.find((x) => x.id === id); r.status = "Pending"; return r; } return unwrap(await api.post(`/platform/tickets/${id}/reply`, { message })); },
};
