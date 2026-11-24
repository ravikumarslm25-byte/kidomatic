// Central error type + async wrapper so controllers stay clean.
export class AppError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: err.message || "Server error" });
}
