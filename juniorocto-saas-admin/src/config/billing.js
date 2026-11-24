export const RATE_PER_SEAT = 50;   // ₹/user/month
export const GST_PCT = 18;
export const ISSUER = {
  name: "HackGeniX Tech Private Limited", product: "KidoMatic",
  cin: "U62013TZ2025PTC035022", gstin: "33AAICH0065K1ZO",
  address: "Salem · Chennai · Tamil Nadu, India", email: "ravi@hackgenix.com",
  bank: { bankName: "HDFC Bank", account: "50200012345678", ifsc: "HDFC0001234", holder: "HackGeniX Tech Pvt Ltd" },
};
export const BILLING_MODELS = {
  direct_web: { key: "direct_web", label: "Direct — Website", billTo: "customer", payment: "Payment Gateway", activation: "Auto on payment", commission: false, note: "School buys online; licence activates automatically on gateway confirmation." },
  wholesale_reseller: { key: "wholesale_reseller", label: "Wholesale — Reseller", billTo: "reseller", payment: "Bank Transfer", activation: "On reseller payment", commission: false, note: "Reseller pays the platform; school activates once the reseller's payment is received." },
  referral: { key: "referral", label: "Referral — Partner", billTo: "customer", payment: "Gateway / Bank", activation: "Admin approval", commission: true, note: "Customer pays us; partner earns commission; admin activates." },
  direct_sales: { key: "direct_sales", label: "Direct Sales", billTo: "customer", payment: "Offline / Bank", activation: "Admin approval", commission: false, note: "Sales team collects payment directly; admin activates the licence." },
};
export const modelList = () => Object.values(BILLING_MODELS);
