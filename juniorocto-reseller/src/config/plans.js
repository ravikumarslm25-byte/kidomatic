// Display + mock limits (mirrors the API's src/config/plans.js).
export const PLANS = {
  starter: { key: "starter", name: "Starter", priceMonthly: 2999, maxBranches: 1, blurb: "Core ERP, fees, attendance, parent app" },
  growth:  { key: "growth", name: "Growth", priceMonthly: 5999, maxBranches: 2, blurb: "+ LMS, development tracking, teacher app, basic AI" },
  pro:     { key: "pro", name: "Pro", priceMonthly: 9999, maxBranches: 20, blurb: "+ full AI suite, Worlds, multi-branch" },
};
export const planList = () => Object.values(PLANS);
export const maxBranches = (k) => PLANS[k]?.maxBranches ?? 1;
