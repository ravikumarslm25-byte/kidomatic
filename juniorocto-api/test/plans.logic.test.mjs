import { PLANS, isPlan, hasFeature, maxBranches, planList } from "../src/config/plans.js";
let pass = 0, fail = 0;
const check = (n, c) => { c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n)); };

check("3 plans", planList().length === 3);
check("isPlan(growth)", isPlan("growth") === true);
check("isPlan(bogus) false", isPlan("bogus") === false);
check("starter: no AI", hasFeature("starter", "ai_basic") === false);
check("growth: ai_basic yes", hasFeature("growth", "ai_basic") === true);
check("growth: ai_pro no", hasFeature("growth", "ai_pro") === false);
check("pro: ai_pro + worlds + multi_branch", hasFeature("pro", "ai_pro") && hasFeature("pro", "worlds") && hasFeature("pro", "multi_branch"));
check("starter maxBranches 1", maxBranches("starter") === 1);
check("pro maxBranches 20", maxBranches("pro") === 20);
check("unknown plan maxBranches default 1", maxBranches("nope") === 1);

console.log(`\n  ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
