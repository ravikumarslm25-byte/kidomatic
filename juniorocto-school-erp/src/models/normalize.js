// Model layer: normalise records coming from either backend into a stable shape.
// Real Express/Mongo returns `_id`; mock returns `id`. Views only ever see `id`.
export const norm = (r = {}) => ({ id: r.id || r._id, ...r });
export const normList = (rows = []) => rows.map(norm);
