import mongoose from "mongoose";
import { connectDb } from "../config/db.js";
import { Lead } from "../models/lead.model.js";
import { Quotation } from "../models/quotation.model.js";
import { SupportTicket } from "../models/support-ticket.model.js";
import { Transaction } from "../models/transaction.model.js";
import { User } from "../models/user.model.js";

// Additive seed for the SaaS Admin CRM/ops modules (no database drop).
// Inserts each dataset only when empty, so re-running never duplicates.
// Run:  npm run seed:platform

const ORGS = ["Sunrise Public School","Little Steps Preschool","Nova Central School","Green Valley Academy","Cambridge Kids","Vidya Mandir","Bright Future School","Silver Oaks","Podar Junior","St. Xavier's","DAV Public","Rainbow Montessori"];
const CITIES = ["Chennai","Salem","Coimbatore","Madurai","Bengaluru","Hyderabad","Kochi","Pune"];
const OWNERS = ["Priya","Arjun","Sneha","Vikram"];
const SOURCES = ["Website","Referral","Google Ads","Cold Call","Event","Partner"];
const NAMES = ["Ravi Kumar","Meena Rao","Karthik Nair","Anita Iyer","Suresh Shah","Divya Menon"];
const pick = (a,i)=>a[i%a.length];
const money = (i)=>[2999,5999,9999,14999,24999][i%5];
const day = (i)=>`2026-0${(i%6)+2}-${String((i%27)+1).padStart(2,"0")}`;

(async () => {
  await connectDb();
  console.log("• connected — additive platform seed\n");

  if (await Lead.countDocuments() === 0) {
    const leads = Array.from({ length: 14 }, (_, i) => ({
      name: pick(NAMES, i), org: pick(ORGS, i), email: `contact${i}@school.edu`,
      phone: `9${(840000000 + i * 137).toString().slice(0, 9)}`, city: pick(CITIES, i),
      source: pick(SOURCES, i), owner: pick(OWNERS, i),
      stage: pick(["New","Contacted","Qualified","Proposal","Won","Lost"], i),
      value: money(i), createdAt: day(i),
    }));
    await Lead.insertMany(leads); console.log(`  leads: +${leads.length}`);
  } else console.log("  leads: present — skipped");

  if (await Quotation.countDocuments() === 0) {
    const qs = Array.from({ length: 10 }, (_, i) => ({
      number: `QUO-26-${String(100 + i).padStart(4, "0")}`, customer: pick(ORGS, i),
      plan: pick(["Starter","Growth","Pro"], i), amount: money(i),
      status: pick(["Draft","Sent","Accepted","Rejected","Sent"], i), date: day(i),
    }));
    await Quotation.insertMany(qs); console.log(`  quotations: +${qs.length}`);
  } else console.log("  quotations: present — skipped");

  if (await SupportTicket.countDocuments() === 0) {
    const ts = Array.from({ length: 10 }, (_, i) => ({
      subject: pick(["Login issue","Invoice query","Feature request","Data import help","Payment failed","Branding not applied"], i),
      customer: pick(ORGS, i), priority: pick(["Low","Medium","High","Medium"], i),
      status: pick(["Open","Pending","Resolved","Closed","Open"], i), assignee: pick(OWNERS, i),
      messages: [], updatedAt: day(i),
    }));
    await SupportTicket.insertMany(ts); console.log(`  tickets: +${ts.length}`);
  } else console.log("  tickets: present — skipped");

  // Platform-direct transactions (resellerId null) — only if none exist yet
  if (await Transaction.countDocuments({ resellerId: null }) === 0) {
    const tx = Array.from({ length: 12 }, (_, i) => ({
      resellerId: null, schoolName: pick(ORGS, i), amount: money(i),
      method: pick(["UPI","Card","Net Banking","NEFT"], i),
      type: pick(["subscription","setup","subscription"], i),
      status: pick(["success","success","success","failed","pending"], i),
      txnRef: "TXN" + (100000 + i * 7).toString(36).toUpperCase(), date: new Date(day(i)),
    }));
    await Transaction.insertMany(tx); console.log(`  transactions (direct): +${tx.length}`);
  } else console.log("  direct transactions: present — skipped");

  // Platform team users (audience platform), added if missing
  const team = [
    { name: "Divya Finance", email: "finance@juniorocto.com", role: "Finance", status: "active" },
    { name: "Arjun Support", email: "support@juniorocto.com", role: "Platform Support", status: "active" },
    { name: "Meena Sales", email: "sales@juniorocto.com", role: "Sales", status: "invited" },
    { name: "Karthik Ops", email: "ops@juniorocto.com", role: "Platform Support", status: "disabled" },
  ];
  let added = 0;
  for (const u of team) {
    const exists = await User.findOne({ email: u.email, audience: "platform" });
    if (exists) continue;
    await User.create({ ...u, audience: "platform", passwordHash: await User.hash("demo1234") });
    added++;
  }
  console.log(`  platform team users: +${added}`);

  console.log("\n\u2713 Platform CRM seed complete.");
  await mongoose.disconnect();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
