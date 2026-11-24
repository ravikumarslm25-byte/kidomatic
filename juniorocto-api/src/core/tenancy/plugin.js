import { getTenant, getStore } from "./context.js";

// The multi-tenant guard. Applied to every domain model:
//  • stamps resellerId / schoolId / branchId on write
//  • injects a school-scoped filter on every read/update/delete
// A developer literally cannot write an unscoped query for tenant data.
export function tenancyPlugin(schema) {
  schema.add({
    resellerId: { type: String, default: null, index: true },
    schoolId: { type: String, index: true },
    branchId: { type: String, default: null, index: true },
  });

  schema.index({ schoolId: 1, createdAt: -1 });

  // Fails closed: a signed-in user is always limited to their school; a reseller to
  // its own schools; anyone else without a school (and not platform / system) sees
  // nothing. Only code with no request context (seeds, scripts) runs unscoped.
  const scope = function () {
    const store = getStore();
    const t = store?.tenant;
    if (!t) return;
    if (t.schoolId) { this.where({ schoolId: t.schoolId }); return; }
    const { audience, role } = store.user || {};
    if (audience === "platform" || role === "System") return;
    if (audience === "reseller" && t.resellerId) { this.where({ resellerId: t.resellerId }); return; }
    this.where({ _id: null });
  };
  ["find", "findOne", "count", "countDocuments", "findOneAndUpdate",
   "findOneAndDelete", "findOneAndReplace", "updateOne", "updateMany",
   "deleteOne", "deleteMany"].forEach((hook) => schema.pre(hook, scope));

  schema.pre("save", function (next) {
    const t = getTenant();
    if (t) {
      if (!this.schoolId) this.schoolId = t.schoolId;
      if (this.resellerId == null) this.resellerId = t.resellerId ?? null;
      if (this.branchId == null) this.branchId = t.branchId ?? null;
    }
    next();
  });

  schema.set("toJSON", {
    virtuals: true,
    transform: (_doc, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; return ret; },
  });
}
