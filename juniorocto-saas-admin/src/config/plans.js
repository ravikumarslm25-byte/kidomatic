export const PLANS = {
  starter: { key: "starter", name: "Starter", priceMonthly: 2999, maxBranches: 1, blurb: "Core ERP, fees, attendance, parent app" },
  growth:  { key: "growth", name: "Growth", priceMonthly: 5999, maxBranches: 2, blurb: "+ LMS, development, teacher app, basic AI" },
  pro:     { key: "pro", name: "Pro", priceMonthly: 9999, maxBranches: 20, blurb: "+ full AI suite, Worlds, multi-branch" },
};
export const planList = () => Object.values(PLANS);
