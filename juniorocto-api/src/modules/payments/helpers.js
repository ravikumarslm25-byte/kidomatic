import { verifyWebhookSignature as _vw, verifyCheckoutSignature as _vc } from "./razorpay.logic.js";
import { canActivate } from "../billing/license.logic.js";
export const verifyWebhookSignature = _vw;
export const verifyCheckoutSignature = _vc;
// Which models auto-activate purely from "payment received"?
export const canActivateFromPaid = (model) =>
  canActivate(model, { gatewayPaid: true, resellerPaid: true });   // direct_web + wholesale
