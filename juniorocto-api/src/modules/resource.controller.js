import { modelFor, searchKeys } from "./resource.model.js";
import { asyncHandler, AppError } from "../core/errors.js";
import { provisionLogin } from "./provisioning.js";
import { portalGuard } from "./portal-access.js";

const esc = (v) => String(v).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// All queries below are auto-scoped to the caller's school by the tenancy plugin.
export const list = asyncHandler(async (req, res) => {
  const Model = modelFor(req.params.resource);
  const q = req.query.q;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 100));
  const extra = await portalGuard(req, "read");
  const base = q
    ? { $or: searchKeys(req.params.resource).map((k) => ({ [k]: new RegExp(esc(q), "i") })) }
    : {};
  const filter = (Object.keys(base).length && Object.keys(extra).length) ? { $and: [base, extra] } : { ...base, ...extra };
  const [rows, total] = await Promise.all([
    Model.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Model.countDocuments(filter),
  ]);
  const data = rows.map(({ __v, _id, ...r }) => ({ id: _id, ...r }));
  res.json({ data, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
});

export const create = asyncHandler(async (req, res) => {
  await portalGuard(req, "write");
  const Model = modelFor(req.params.resource);
  const row = await Model.create(req.body || {});
  const provisioned = await provisionLogin(req.params.resource, row, req.body).catch(() => ({}));
  res.status(201).json({ data: row, provisioned });
});

export const update = asyncHandler(async (req, res) => {
  await portalGuard(req, "write");
  const Model = modelFor(req.params.resource);
  const row = await Model.findOneAndUpdate({ _id: req.params.id }, req.body || {}, { new: true, runValidators: true });
  if (!row) throw new AppError("Record not found", 404);
  const provisioned = await provisionLogin(req.params.resource, row, req.body).catch(() => ({}));
  res.json({ data: row, provisioned });
});

export const remove = asyncHandler(async (req, res) => {
  await portalGuard(req, "write");
  const Model = modelFor(req.params.resource);
  const row = await Model.findOneAndDelete({ _id: req.params.id });
  if (!row) throw new AppError("Record not found", 404);
  res.json({ data: { id: req.params.id } });
});
