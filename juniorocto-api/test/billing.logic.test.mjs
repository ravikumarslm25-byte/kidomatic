import { commissionFor, mrr, summarizeRevenue, buildPayout, inPeriod, currentPeriod } from "../src/modules/billing/billing.logic.js";
let pass = 0, fail = 0;
const check = (n, c, e = "") => { c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, e)); };

check("commission 25% of 5999 = 1500", commissionFor(5999, 25) === 1500);
check("commission 0 pct = 0", commissionFor(5999, 0) === 0);

const subs = [{ amount: 9999, status: "active" }, { amount: 5999, status: "trialing" }, { amount: 2999, status: "cancelled" }];
check("MRR sums active+trialing only = 15998", mrr(subs) === 15998, String(mrr(subs)));

const txns = [
  { amount: 9999, commission: 2500, status: "success", date: "2026-07-03" },
  { amount: 5999, commission: 1500, status: "success", date: "2026-07-20" },
  { amount: 2999, commission: 750, status: "failed", date: "2026-07-10" },
  { amount: 9999, commission: 2500, status: "success", date: "2026-06-05" },
];
const rev = summarizeRevenue(txns);
check("revenue: 3 success txns", rev.count === 3);
check("revenue gross = 25997", rev.gross === 25997, String(rev.gross));
check("revenue commission = 6500", rev.commission === 6500, String(rev.commission));

check("inPeriod true", inPeriod("2026-07-20", "2026-07") === true);
check("inPeriod false", inPeriod("2026-06-05", "2026-07") === false);

const p = buildPayout(txns, "2026-07", 25);
check("payout Jul: 2 txns", p.count === 2);
check("payout Jul gross = 15998", p.gross === 15998, String(p.gross));
check("payout Jul amount = 4000 (2500+1500)", p.amount === 4000, String(p.amount));

console.log(`\n  ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
