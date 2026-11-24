// Demo datasets — sized so pagination/filters/search are meaningful.
const ORGS = ["Sunrise Public School", "Little Steps Preschool", "Nova Central School", "Green Valley Academy", "Blue Lagoon Intl", "Cambridge Kids", "Vidya Mandir", "Bright Future School", "Silver Oaks", "Podar Junior", "St. Xavier's", "DAV Public", "Rainbow Montessori", "Oakridge Intl", "Delhi World School"];
const CITIES = ["Chennai", "Salem", "Coimbatore", "Madurai", "Bengaluru", "Hyderabad", "Kochi", "Pune"];
const OWNERS = ["Priya", "Arjun", "Sneha", "Vikram"];
const SOURCES = ["Website", "Referral", "Google Ads", "Cold Call", "Event", "Partner"];
const pick = (a, i) => a[i % a.length];
const money = (i) => [2999, 5999, 9999, 14999, 24999][i % 5];
const day = (i) => `2026-0${(i % 6) + 2}-${String((i % 27) + 1).padStart(2, "0")}`;

export const LEADS = Array.from({ length: 34 }, (_, i) => ({
  id: "L" + (1000 + i), name: `${pick(["Ravi", "Meena", "Karthik", "Anita", "Suresh", "Divya"], i)} ${pick(["Kumar", "Rao", "Nair", "Iyer", "Shah"], i + 1)}`,
  org: pick(ORGS, i), email: `contact${i}@school.edu`, phone: `9${(840000000 + i * 137).toString().slice(0, 9)}`,
  city: pick(CITIES, i), source: pick(SOURCES, i), owner: pick(OWNERS, i),
  stage: pick(["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"], i), value: money(i), createdAt: day(i),
}));

export const INVOICES = Array.from({ length: 28 }, (_, i) => {
  const amount = money(i) * (1 + (i % 3));
  return { id: "INV" + (2600 + i), number: `INV-26-${String(400 + i).padStart(4, "0")}`, customer: pick(ORGS, i),
    amount, tax: 0, total: amount, status: pick(["Paid", "Paid", "Due", "Overdue", "Partial"], i), date: day(i), dueDate: day(i + 2) };
});

export const QUOTATIONS = Array.from({ length: 22 }, (_, i) => ({
  id: "Q" + (500 + i), number: `QUO-26-${String(100 + i).padStart(4, "0")}`, customer: pick(ORGS, i),
  plan: pick(["Starter", "Growth", "Pro"], i), amount: money(i), status: pick(["Draft", "Sent", "Accepted", "Rejected", "Sent"], i), date: day(i),
}));

export const TRANSACTIONS = Array.from({ length: 40 }, (_, i) => ({
  id: "T" + (9000 + i), ref: "TXN" + Math.random().toString(36).slice(2, 8).toUpperCase(), customer: pick(ORGS, i),
  amount: money(i), method: pick(["UPI", "Card", "Net Banking", "NEFT"], i), type: pick(["subscription", "setup", "subscription"], i),
  status: pick(["success", "success", "success", "failed", "pending"], i), date: day(i),
}));

export const TICKETS = Array.from({ length: 18 }, (_, i) => ({
  id: "TK" + (300 + i), subject: pick(["Login issue", "Invoice query", "Feature request", "Data import help", "Payment failed", "Branding not applied"], i),
  customer: pick(ORGS, i), priority: pick(["Low", "Medium", "High", "Medium"], i),
  status: pick(["Open", "Pending", "Resolved", "Closed", "Open"], i), assignee: pick(OWNERS, i), updatedAt: day(i),
}));

export const USERS = [
  { id: "U1", name: "HackGeniX Admin", email: "superadmin@juniorocto.com", role: "Super Admin", status: "active", lastActive: "2026-08-08" },
  { id: "U2", name: "Divya Finance", email: "finance@juniorocto.com", role: "Finance", status: "active", lastActive: "2026-08-07" },
  { id: "U3", name: "Arjun Support", email: "support@juniorocto.com", role: "Platform Support", status: "active", lastActive: "2026-08-08" },
  { id: "U4", name: "Meena Sales", email: "sales@juniorocto.com", role: "Sales", status: "invited", lastActive: "—" },
  { id: "U5", name: "Karthik Ops", email: "ops@juniorocto.com", role: "Platform Support", status: "disabled", lastActive: "2026-06-20" },
];
