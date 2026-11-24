import { USE_MOCK } from "@/config/app";
import { api } from "@/lib/http";
import { maxBranches } from "@/config/plans";
import { uid } from "@/lib/id";

const M = {
  schools: [
    { id: "s1", name: "Sunrise Public School", board: "CBSE", session: "2026–27", planKey: "pro", status: "active", students: 640, referred: true, branding: { name: "Sunrise", colors: { blue: "#1651A3", coral: "#E85410" } } },
    { id: "s2", name: "Little Steps Preschool", board: "State", session: "2026–27", planKey: "growth", status: "active", students: 180, referred: true, branding: { name: "Little Steps", colors: { blue: "#2E7D5B", coral: "#F2A007" } } },
    { id: "s3", name: "Green Valley Academy", board: "ICSE", session: "2026–27", planKey: "starter", status: "suspended", students: 95, referred: false, branding: { name: "Green Valley", colors: { blue: "#6B3FA0", coral: "#E0533F" } } },
  ],
  branches: { s1: [{ id: "b1", name: "Main Campus", address: "Salem", status: "active" }, { id: "b2", name: "North Wing", address: "Salem", status: "active" }] },
  subscriptions: [
    { id: "sub1", schoolName: "Sunrise Public School", planKey: "pro", amount: 9999, status: "active", nextBillingAt: "2026-08-03", referred: true },
    { id: "sub2", schoolName: "Little Steps Preschool", planKey: "growth", amount: 5999, status: "active", nextBillingAt: "2026-08-03", referred: true },
    { id: "sub3", schoolName: "Green Valley Academy", planKey: "starter", amount: 2999, status: "past_due", nextBillingAt: "2026-07-20", referred: false },
  ],
  transactions: [
    { id: "t1", schoolName: "Sunrise Public School", txnRef: "TXN9F2A1", amount: 9999, commission: 2500, status: "success", date: "2026-07-03" },
    { id: "t2", schoolName: "Little Steps Preschool", txnRef: "TXN7B3C4", amount: 5999, commission: 1500, status: "success", date: "2026-07-03" },
    { id: "t3", schoolName: "Green Valley Academy", txnRef: "TXN2D9E1", amount: 2999, commission: 750, status: "failed", date: "2026-07-03" },
    { id: "t4", schoolName: "Sunrise Public School", txnRef: "TXN5A8B2", amount: 9999, commission: 2500, status: "success", date: "2026-06-03" },
    { id: "t5", schoolName: "Little Steps Preschool", txnRef: "TXN1C4D7", amount: 5999, commission: 1500, status: "success", date: "2026-06-03" },
  ],
  payouts: [
    { id: "p1", period: "2026-07", gross: 15998, amount: 4000, status: "pending" },
    { id: "p2", period: "2026-06", gross: 15998, amount: 4000, status: "paid", paidAt: "2026-07-05" },
    { id: "p3", period: "2026-05", gross: 15998, amount: 4000, status: "paid", paidAt: "2026-06-05" },
  ],
  offers: [{ id: "o1", title: "New Year Onboarding", code: "NEWYEAR25", discountType: "percent", value: 25, status: "active", uses: 12, maxUses: 50 }],
};
const wait = (ms = 240) => new Promise((r) => setTimeout(r, ms));
const unwrap = (r) => r.data?.data ?? r.data;
const withId = (a) => a.map((x) => ({ ...x, id: x.id || x._id }));

export const resellerService = {
  async summary() { if (USE_MOCK) { await wait(); return { schools: M.schools.length, activeSchools: M.schools.filter((s) => s.status === "active").length, students: M.schools.reduce((a, s) => a + s.students, 0) }; } return unwrap(await api.get("/reseller/summary")); },
  async schools() { if (USE_MOCK) { await wait(); return M.schools; } return withId(unwrap(await api.get("/reseller/schools"))); },
  async createSchool(p) { if (USE_MOCK) { await wait(); const s = { id: uid("s"), status: "active", students: 0, branding: {}, ...p }; M.schools.unshift(s); return s; } return unwrap(await api.post("/reseller/schools", p)); },
  async updateSchool(id, patch) { if (USE_MOCK) { await wait(); const s = M.schools.find((x) => x.id === id); Object.assign(s, patch); return s; } return unwrap(await api.patch(`/reseller/schools/${id}`, patch)); },
  async branches(schoolId) { if (USE_MOCK) { await wait(); return M.branches[schoolId] || []; } return withId(unwrap(await api.get(`/reseller/schools/${schoolId}/branches`))); },
  async createBranch(schoolId, school, p) { if (USE_MOCK) { await wait(); const list = (M.branches[schoolId] ||= []); if (list.length >= maxBranches(school.planKey)) throw new Error(`The ${school.planKey} plan allows ${maxBranches(school.planKey)} branch(es). Upgrade for more.`); const b = { id: uid("b"), status: "active", ...p }; list.push(b); return b; } return unwrap(await api.post(`/reseller/schools/${schoolId}/branches`, p)); },
  async invite(schoolId, p) { if (USE_MOCK) { await wait(); return { user: { name: p.name, email: p.email, role: p.role }, tempPassword: Math.random().toString(36).slice(2, 10) }; } return unwrap(await api.post(`/reseller/schools/${schoolId}/invite`, p)); },

  async revenue() { if (USE_MOCK) { await wait(); return { mrr: 18997, commissionPct: 25, activeSubscriptions: 2, lifetimeEarnings: 20000, thisMonthEarnings: 4000, pendingPayout: 4000 }; } return unwrap(await api.get("/reseller/revenue")); },
  async subscriptions() { if (USE_MOCK) { await wait(); return M.subscriptions; } return withId(unwrap(await api.get("/reseller/subscriptions"))); },
  async transactions() { if (USE_MOCK) { await wait(); return M.transactions; } return withId(unwrap(await api.get("/reseller/transactions"))); },
  async payouts() { if (USE_MOCK) { await wait(); return M.payouts; } return withId(unwrap(await api.get("/reseller/payouts"))); },
  async referral() { if (USE_MOCK) { await wait(); return { code: "acme-edtech", link: "https://app.juniorocto.com/signup?ref=acme-edtech", referredCount: M.schools.filter((s) => s.referred).length }; } return unwrap(await api.get("/reseller/referral")); },
  async offers() { if (USE_MOCK) { await wait(); return M.offers; } return withId(unwrap(await api.get("/reseller/offers"))); },
  async createOffer(p) { if (USE_MOCK) { await wait(); const o = { id: uid("o"), status: "active", uses: 0, ...p, code: (p.code || "").toUpperCase() }; M.offers.unshift(o); return o; } return unwrap(await api.post("/reseller/offers", p)); },
};
