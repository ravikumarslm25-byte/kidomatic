import { hasFeature } from "../../config/plans.js";
import { AppError } from "../errors.js";
// Gate a route by the caller's plan (planKey rides in the JWT).
export const requireFeature = (feature) => (req, res, next) => {
  if (!hasFeature(req.user?.planKey, feature))
    return next(new AppError(`Your plan doesn't include "${feature}". Upgrade to unlock it.`, 402));
  next();
};
