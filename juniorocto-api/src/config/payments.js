// Razorpay config. When keys are absent (e.g. sandbox), the gateway runs in
// "mock" mode: orders are simulated so the whole flow is testable without keys.
export const PAYMENTS = {
  keyId: process.env.RAZORPAY_KEY_ID || "",
  keySecret: process.env.RAZORPAY_KEY_SECRET || "",
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  currency: "INR",
};
export const paymentsMode = () => (PAYMENTS.keyId && PAYMENTS.keySecret ? "live" : "mock");
