// ─── The four go-to-market / billing models ────────────────────────────────
// Each decides who the invoice bills, how payment arrives, and how the license
// activates. Shared by backend logic and the admin UI.
export const BILLING_MODELS = {
  direct_web: {
    key: "direct_web", label: "Direct — Website", billTo: "customer",
    payment: "Payment Gateway", activation: "Auto on payment", commission: false,
    note: "School buys the plan online; the licence activates automatically on gateway confirmation.",
  },
  wholesale_reseller: {
    key: "wholesale_reseller", label: "Wholesale — Reseller", billTo: "reseller",
    payment: "Bank Transfer", activation: "On reseller payment", commission: false,
    note: "Reseller pays the platform (bank); the school's licence activates once the reseller's payment is received.",
  },
  referral: {
    key: "referral", label: "Referral — Partner", billTo: "customer",
    payment: "Gateway / Bank", activation: "Admin approval", commission: true,
    note: "Customer pays us directly but joined via a partner; the partner earns commission; admin activates the licence.",
  },
  direct_sales: {
    key: "direct_sales", label: "Direct Sales", billTo: "customer",
    payment: "Offline / Bank", activation: "Admin approval", commission: false,
    note: "Our team collects payment directly (no gateway); we raise the invoice and admin activates the licence.",
  },
};
export const isBillingModel = (k) => Object.prototype.hasOwnProperty.call(BILLING_MODELS, k);
export const modelList = () => Object.values(BILLING_MODELS);

// Licensing is seat-based.
export const RATE_PER_SEAT = 50;   // ₹ per user per month
export const GST_PCT = 18;
