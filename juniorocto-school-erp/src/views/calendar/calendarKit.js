export const EVENT_CATEGORIES = ["Event", "Holiday", "Exam", "PTM", "Activity", "Sports", "Meeting", "Deadline"];
export const CAT_COLOR = { Holiday: "#16a34a", Exam: "#dc2626", Event: "#7c3aed", PTM: "#1651A3", Activity: "#0891b2", Sports: "#ea580c", Meeting: "#64748b", Deadline: "#d97706", Announcement: "#1651A3", Circular: "#475569", General: "#64748b", Fees: "#dc2626", Emergency: "#dc2626", Transport: "#ea580c", Admission: "#0891b2", Academic: "#7c3aed" };
export const colorOf = (item) => item.color || CAT_COLOR[item.category] || "#64748b";
export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const pad2 = (n) => String(n).padStart(2, "0");
export const toKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
export const todayKey = () => toKey(new Date());

export function monthGrid(year, month) {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  return Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
}
export const commDate = (c) => (c.publishAt || c.publishedAt || c.createdAt || "").slice(0, 10);

// unify events + communications + holidays into calendar items
export function mergeItems(events, comms, holidays) {
  const out = [];
  (events || []).forEach((e) => out.push({ id: "ev-" + e.id, kind: "event", title: e.title, category: e.category || "Event", date: (e.start || "").slice(0, 10), endDate: (e.end || e.start || "").slice(0, 10), time: e.allDay === true || e.allDay === "true" ? "" : [e.startTime, e.endTime].filter(Boolean).join("–"), location: e.location, audienceType: e.audienceType, audienceClasses: e.audienceClasses, audienceRoles: e.audienceRoles, description: e.description, raw: e }));
  (comms || []).filter((c) => c.status === "Published" || c.status === "Scheduled").forEach((c) => { const d = commDate(c); if (!d) return; out.push({ id: "cm-" + c.id, kind: (c.type || "Announcement").toLowerCase(), title: c.title, category: c.category || (c.type === "Circular" ? "Circular" : "Announcement"), date: d, endDate: d, time: c.publishAt ? new Date(c.publishAt).toTimeString().slice(0, 5) : "", audienceType: c.audienceType, audienceClasses: c.audienceClasses, audienceRoles: c.audienceRoles, description: c.body, status: c.status, raw: c }); });
  (holidays || []).forEach((h) => out.push({ id: "hd-" + h.id, kind: "holiday", title: h.name, category: "Holiday", date: (h.date || "").slice(0, 10), endDate: (h.date || "").slice(0, 10), description: h.description, audienceType: "Everyone", raw: h }));
  return out.filter((i) => i.date);
}

// item occupies a day if dayKey within [date, endDate]
export const onDay = (item, key) => key >= item.date && key <= (item.endDate || item.date);

// role / audience filter
export function matchesAudience(item, filter) {
  if (!filter || filter === "all") return true;
  const t = item.audienceType || "Everyone";
  if (t === "Everyone") return true;
  if (filter === "students") return ["All Students", "All Parents", "Specific Classes", "Specific Sections"].includes(t);
  if (filter === "staff") return ["All Staff", "Specific Roles"].includes(t);
  // specific role name
  if (t === "All Staff") return true;
  if (t === "Specific Roles") return (item.audienceRoles || []).includes(filter);
  return false;
}
