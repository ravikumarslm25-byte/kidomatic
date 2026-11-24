// ─── PLANS & FEATURE GATING (pure) ─────────────────────────────────────────
// Plans map to feature flags + limits. Stored in the JWT at login so gating is
// a hash lookup (no DB hit) — scales cleanly.
export const PLANS = {
  starter: { key: "starter", name: "Starter", priceMonthly: 2999, maxBranches: 1,
    features: ["erp", "fees", "attendance", "parent_app"] },
  growth:  { key: "growth", name: "Growth", priceMonthly: 5999, maxBranches: 2,
    features: ["erp", "fees", "attendance", "parent_app", "lms", "development", "teacher_app", "ai_basic"] },
  pro:     { key: "pro", name: "Pro", priceMonthly: 9999, maxBranches: 20,
    features: ["erp", "fees", "attendance", "parent_app", "lms", "development", "teacher_app", "ai_basic", "ai_pro", "multi_branch", "worlds"] },
};

export const isPlan = (key) => Object.prototype.hasOwnProperty.call(PLANS, key);
export const planFeatures = (key) => PLANS[key]?.features || [];
export const hasFeature = (key, feature) => planFeatures(key).includes(feature);
export const maxBranches = (key) => PLANS[key]?.maxBranches ?? 1;
export const planList = () => Object.values(PLANS);
