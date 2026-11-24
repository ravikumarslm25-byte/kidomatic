// ─── Pure fee math (no DB) — shared by the controller, the dev stand-in, tests ───

// Which fee heads apply to a student's class for a term.
export function feeHeadsForClass(feeStructure, klass, term) {
  return feeStructure.filter((h) =>
    (!term || h.term === term || h.term === "Annual") && applies(h.klass, klass)
  );
}
function applies(headClass, klass) {
  if (!headClass || headClass === "All") return true;
  if (headClass === klass) return true;
  if (/grade\s*1.*5/i.test(headClass)) return ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"].includes(klass);
  if (/nursery.*ukg/i.test(headClass)) return ["Nursery", "LKG", "UKG"].includes(klass);
  return false;
}

// Build an invoice's money from applicable heads + discounts.
export function computeInvoice(feeHeads, discounts = []) {
  const lineItems = feeHeads.map((h) => ({ head: h.name, amount: Number(h.amount) || 0 }));
  const subtotal = lineItems.reduce((a, li) => a + li.amount, 0);
  let discount = 0;
  for (const d of discounts) {
    if (d.type === "Percent") discount += Math.round((subtotal * (Number(d.value) || 0)) / 100);
    else discount += Number(d.value) || 0;
  }
  discount = Math.min(discount, subtotal);
  return { lineItems, subtotal, discount, total: subtotal - discount };
}

export function paymentStatus(total, paid) {
  if (paid <= 0) return "Due";
  if (paid >= total) return "Paid";
  return "Partial";
}

// Apply a payment to an invoice snapshot → new money state.
export function applyPayment(invoice, amount) {
  const amt = Math.max(0, Number(amount) || 0);
  const prevPaid = Number(invoice.paid) || 0;
  const paid = Math.min(Number(invoice.total) || 0, prevPaid + amt);
  const balance = Math.max(0, (Number(invoice.total) || 0) - paid);
  return { applied: paid - prevPaid, paid, balance, status: paymentStatus(invoice.total, paid) };
}

export const invoiceNo = (seq, yy = String(new Date().getFullYear()).slice(2)) => `INV-${yy}-${String(seq).padStart(4, "0")}`;
export const receiptNo = (seq, yy = String(new Date().getFullYear()).slice(2)) => `RCPT-${yy}-${String(seq).padStart(4, "0")}`;
