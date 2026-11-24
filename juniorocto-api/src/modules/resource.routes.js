import { Router } from "express";
import { list, create, update, remove } from "./resource.controller.js";
import { isResource } from "../config/resources.js";
import { requirePermission } from "../core/rbac/rbac.middleware.js";
import { AppError } from "../core/errors.js";

const r = Router();

// Guard: only known resources are routable.
r.param("resource", (req, res, next, value) => {
  if (!isResource(value)) return next(new AppError(`Unknown resource: ${value}`, 404));
  next();
});

r.get("/:resource", list);
r.post("/:resource", requirePermission("write"), create);
r.patch("/:resource/:id", requirePermission("write"), update);
r.delete("/:resource/:id", requirePermission("delete"), remove);

export default r;
