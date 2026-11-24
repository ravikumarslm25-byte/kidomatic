import { can } from "./roles.js";
import { AppError } from "../errors.js";
// action: 'write' | 'delete'; resource from route param.
export const requirePermission = (action) => (req, res, next) => {
  const resource = req.params.resource;
  if (!can(req.user?.role, action, resource))
    return next(new AppError(`Your role (${req.user?.role}) can't ${action} ${resource}`, 403));
  next();
};
