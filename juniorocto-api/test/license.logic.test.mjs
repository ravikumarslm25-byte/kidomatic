import { licenseAmount, withGst, invoiceRecipient, earnsCommission, canActivate } from "../src/modules/billing/license.logic.js";
let pass = 0, fail = 0;
const check = (n, c, e = "") => { c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, e)); };

check("120 users × ₹50 = 6000/mo", licenseAmount(120) === 6000, String(licenseAmount(120)));
check("120 users × ₹50 × 12 = 72000/yr", licenseAmount(120, 50, 12) === 72000);
const g = withGst(6000);
check("GST 18% of 6000 = 1080, total 7080", g.tax === 1080 && g.total === 7080, JSON.stringify(g));

check("direct_web bills customer", invoiceRecipient("direct_web") === "customer");
check("wholesale bills reseller", invoiceRecipient("wholesale_reseller") === "reseller");
check("referral bills customer", invoiceRecipient("referral") === "customer");
check("direct_sales bills customer", invoiceRecipient("direct_sales") === "customer");
check("referral earns commission", earnsCommission("referral") === true);
check("wholesale no commission", earnsCommission("wholesale_reseller") === false);

check("direct_web activates on gatewayPaid", canActivate("direct_web", { gatewayPaid: true }) === true);
check("direct_web NOT active w/o payment", canActivate("direct_web", {}) === false);
check("wholesale activates on resellerPaid", canActivate("wholesale_reseller", { resellerPaid: true }) === true);
check("wholesale NOT active on gatewayPaid", canActivate("wholesale_reseller", { gatewayPaid: true }) === false);
check("referral needs adminApproved", canActivate("referral", { gatewayPaid: true }) === false && canActivate("referral", { adminApproved: true }) === true);
check("direct_sales needs adminApproved", canActivate("direct_sales", { adminApproved: true }) === true);

console.log(`\n  ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
