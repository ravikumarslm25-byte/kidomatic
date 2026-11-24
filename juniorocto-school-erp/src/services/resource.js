// One CRUD service, two backends. Views/controllers never care which is live.
// Mock  → in-memory DB (VITE_USE_MOCK=true, default)
// Real  → GET/POST/PATCH/DELETE /api/:resource on your Express server
import { USE_MOCK } from "@/config/app";
import { api } from "./api";
import { mockDb } from "./mockDb";

export function resourceService(resource) {
  if (USE_MOCK) {
    return {
      list: (params) => mockDb.list(resource, params || {}),
      create: (payload) => mockDb.create(resource, payload),
      update: (id, payload) => mockDb.update(resource, id, payload),
      remove: (id) => mockDb.remove(resource, id),
    };
  }
  return {
    list: (params) => api.get(`/${resource}`, { params }).then((r) => r.data?.data ?? r.data),
    create: (payload) => api.post(`/${resource}`, payload).then((r) => { const b = r.data; const row = b?.data ?? b; if (b?.provisioned) row.__provisioned = b.provisioned; return row; }),
    update: (id, payload) => api.patch(`/${resource}/${id}`, payload).then((r) => r.data?.data ?? r.data),
    remove: (id) => api.delete(`/${resource}/${id}`).then((r) => r.data),
  };
}
