import { USE_MOCK } from "@/config/app";
import { api } from "./api";

export const portalService = {
  async children() {
    if (USE_MOCK) return [
      { studentId: "s1", studentName: "Aarav Sharma", klass: "Grade 3", section: "B", relationship: "Father", canPay: true },
      { studentId: "s2", studentName: "Anaya Sharma", klass: "Grade 1", section: "A", relationship: "Father", canPay: true },
    ];
    const { data } = await api.get("/portal/children");
    return data?.data ?? data;
  },
  async pay({ invoiceId, amount, mode }) {
    if (USE_MOCK) { await new Promise((r) => setTimeout(r, 500)); return { receipt: { receiptNo: "RCPT-26-0001", amount, mode, date: new Date().toISOString() }, invoice: { status: "Paid", balance: 0 } }; }
    const { data } = await api.post("/portal/pay", { invoiceId, amount, mode });
    return data?.data ?? data;
  },
  async linkChild(payload) {
    if (USE_MOCK) { await new Promise((r) => setTimeout(r, 300)); return { studentId: "s3", studentName: "New Child", klass: "Grade 2" }; }
    const { data } = await api.post("/portal/link-child", payload); return data?.data ?? data;
  },
  async resetGuardianPassword(payload) {
    if (USE_MOCK) { await new Promise((r) => setTimeout(r, 300)); return { email: payload.email, tempPassword: "demo1234" }; }
    const { data } = await api.post("/portal/guardians/reset", payload); return data?.data ?? data;
  },
  async createTicket(payload) {
    if (USE_MOCK) { await new Promise((r) => setTimeout(r, 300)); return { id: "t" + Date.now(), ticketNo: "TKT-26-0001", ...payload, status: "Open", replies: [], createdAt: new Date().toISOString() }; }
    const { data } = await api.post("/portal/tickets", payload); return data?.data ?? data;
  },
  async replyTicket(id, message) {
    if (USE_MOCK) { await new Promise((r) => setTimeout(r, 200)); return { ok: true }; }
    const { data } = await api.post(`/portal/tickets/${id}/reply`, { message }); return data?.data ?? data;
  },
  async provisionGuardian(payload) {
    if (USE_MOCK) { await new Promise((r) => setTimeout(r, 300)); return { tempPassword: "demo1234", email: payload.email }; }
    const { data } = await api.post("/portal/guardians", payload);
    return data?.data ?? data;
  },
};
