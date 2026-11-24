import { USE_MOCK } from "@/config/app";
import { api } from "./api";

const HEADS = [
  { head: "Tuition Fee — Term 1", amount: 24000 },
  { head: "Transport Fee (Zone A)", amount: 6000 },
  { head: "Activity & Lab Fee", amount: 4500 },
];

export async function getDues(studentName) {
  if (USE_MOCK) {
    const subtotal = HEADS.reduce((a, h) => a + h.amount, 0);
    const discount = 3450;
    return { id: "demo", student: studentName, lineItems: HEADS, subtotal, discount, total: subtotal - discount, paid: 0, balance: subtotal - discount, status: "Due" };
  }
  const { data } = await api.get("/fees/dues", { params: { student: studentName } });
  return data?.data ?? data;
}

export async function payInvoice(invoiceId, payload) {
  if (USE_MOCK) { await new Promise((r) => setTimeout(r, 300)); return { receipt: { receiptNo: "RCPT-26-DEMO" }, invoice: { status: "Paid", balance: 0 } }; }
  const { data } = await api.post(`/fees/invoices/${invoiceId}/pay`, payload); return data?.data ?? data;
}
