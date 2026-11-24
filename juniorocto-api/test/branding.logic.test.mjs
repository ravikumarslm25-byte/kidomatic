import { resolveBranding } from "../src/modules/branding/branding.logic.js";
import { PLATFORM_BRANDING as P } from "../src/config/branding.js";
let pass = 0, fail = 0;
const check = (n, c, e = "") => { c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, e)); };

// No overrides → platform default
let b = resolveBranding({ name: "A School" }, {});
check("falls back to school name", b.name === "A School");
check("keeps platform colours", b.colors.blue === P.colors.blue);
check("source = platform", b.source === "platform");

// Reseller defaults cascade
b = resolveBranding({ name: "B School" }, { branding: { name: "Acme Academy", colors: { blue: "#2E7D5B" } } });
check("reseller blue applies", b.colors.blue === "#2E7D5B");
check("reseller coral falls back to platform", b.colors.coral === P.colors.coral);
check("source = reseller", b.source === "reseller");

// School overrides win over reseller
b = resolveBranding({ name: "C School", branding: { name: "Sunrise", colors: { blue: "#1651A3", coral: "#F2A007" } } }, { branding: { colors: { blue: "#2E7D5B" } } });
check("school blue beats reseller blue", b.colors.blue === "#1651A3");
check("school coral applies", b.colors.coral === "#F2A007");
check("school name wins", b.name === "Sunrise");
check("source = school", b.source === "school");
check("logo empty when none set", b.logoUrl === "");

console.log(`\n  ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
