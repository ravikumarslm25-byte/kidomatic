import { toPaise, hmac, verifyWebhookSignature, verifyCheckoutSignature, orderTotalPaise } from "../src/modules/payments/razorpay.logic.js";
let pass = 0, fail = 0;
const check = (n, c, e = "") => { c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, e)); };
const SECRET = "whsec_test_123";

check("toPaise 70.5 → 7050", toPaise(70.5) === 7050);
check("order total 120 users +18% GST = 708000 paise", orderTotalPaise(120, 50, 18) === 708000, String(orderTotalPaise(120, 50, 18)));

const body = JSON.stringify({ event: "payment.captured", payload: {} });
const goodSig = hmac(body, SECRET);
check("webhook: valid signature accepted", verifyWebhookSignature(body, goodSig, SECRET) === true);
check("webhook: tampered body rejected", verifyWebhookSignature(body + "x", goodSig, SECRET) === false);
check("webhook: wrong secret rejected", verifyWebhookSignature(body, goodSig, "nope") === false);
check("webhook: missing signature rejected", verifyWebhookSignature(body, "", SECRET) === false);

const cs = hmac("order_ABC|pay_XYZ", SECRET);
check("checkout: valid signature accepted", verifyCheckoutSignature({ orderId: "order_ABC", paymentId: "pay_XYZ", signature: cs }, SECRET) === true);
check("checkout: wrong payment id rejected", verifyCheckoutSignature({ orderId: "order_ABC", paymentId: "pay_OTHER", signature: cs }, SECRET) === false);

console.log(`\n  ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
