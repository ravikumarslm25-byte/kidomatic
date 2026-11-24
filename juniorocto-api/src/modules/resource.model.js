import mongoose from "mongoose";
import { RESOURCES } from "../config/resources.js";
import { tenancyPlugin } from "../core/tenancy/plugin.js";

import mongooseLib from "mongoose";
const TYPE = { string: String, number: Number, date: Date, json: mongooseLib.Schema.Types.Mixed };
const cache = {};

// Build (once) a tenant-scoped Mongoose model from a resource definition.
export function modelFor(resource) {
  if (cache[resource]) return cache[resource];
  const def = RESOURCES[resource];
  if (!def) throw new Error(`Unknown resource: ${resource}`);
  const shape = {};
  for (const [field, type] of Object.entries(def.fields)) shape[field] = { type: TYPE[type] || String };
  const schema = new mongoose.Schema(shape, { timestamps: true, minimize: false });
  schema.plugin(tenancyPlugin);
  const name = resource[0].toUpperCase() + resource.slice(1);
  cache[resource] = mongoose.models[name] || mongoose.model(name, schema);
  return cache[resource];
}

// String fields to search when ?q= is passed.
export const searchKeys = (resource) => {
  const def = RESOURCES[resource];
  return def.search || Object.entries(def.fields).filter(([, t]) => t === "string").map(([k]) => k);
};
