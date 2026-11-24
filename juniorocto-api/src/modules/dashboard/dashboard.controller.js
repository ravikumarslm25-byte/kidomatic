import { modelFor } from "../resource.model.js";
import { asyncHandler } from "../../core/errors.js";

const sum = (arr, k) => arr.reduce((a, x) => a + (Number(x[k]) || 0), 0);
const thisMonth = (d) => { const n = new Date(), t = new Date(d); return t.getMonth() === n.getMonth() && t.getFullYear() === n.getFullYear(); };

// GET /api/dashboard/summary — real, tenant-scoped aggregates (find + reduce,
// so the tenancy plugin's scoping applies; aggregate() would bypass it).
export const summary = asyncHandler(async (req, res) => {
  const [students, invoices, payments, enquiries] = await Promise.all([
    modelFor("students").find(),
    modelFor("invoices").find(),
    modelFor("payments").find(),
    modelFor("enquiries").find(),
  ]);

  const active = students.filter((s) => s.status === "Active");
  const collectedMTD = sum(payments.filter((p) => thisMonth(p.date)), "amount")
    // fall back to seeded "paid" when there are no payment records yet
    || sum(invoices, "paid");
  const outstanding = sum(invoices, "balance");

  const funnel = {};
  for (const e of enquiries) funnel[e.status] = (funnel[e.status] || 0) + 1;

  res.json({
    data: {
      totalStudents: students.length,
      activeStudents: active.length,
      feesCollectedMTD: collectedMTD,
      outstanding,
      newEnquiries: enquiries.length,
      admitted: funnel["Admitted"] || 0,
      enquiryFunnel: funnel,
    },
  });
});
