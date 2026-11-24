import { AsyncLocalStorage } from "node:async_hooks";
// Per-request store holding the authenticated user + tenant scope.
// Mongoose queries read this to auto-scope by school — no query can forget it.
export const als = new AsyncLocalStorage();
export const getStore = () => als.getStore();
export const getTenant = () => als.getStore()?.tenant;
export const runWithContext = (ctx, fn) => als.run(ctx, fn);
