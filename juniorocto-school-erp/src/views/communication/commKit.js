export const CATEGORIES = ["General", "Academic", "Event", "Holiday", "Fees", "Exam", "PTM", "Emergency", "Sports", "Transport", "Admission"];
export const PRIORITIES = ["Normal", "Important", "Urgent"];
export const AUDIENCE_TYPES = ["Everyone", "All Students", "All Parents", "All Staff", "Specific Classes", "Specific Sections", "Specific Roles"];
export const CHANNELS = ["In-app", "Email", "SMS", "WhatsApp"];
export const priorityMeta = (p) => p === "Urgent" ? { color: "#dc2626", bg: "#fef2f2" } : p === "Important" ? { color: "#d97706", bg: "#fffbeb" } : { color: "#1651A3", bg: "#eff5ff" };
export const truthy = (v) => v === true || v === "true" || v === 1;
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) : "—");

// derive class / section / role option lists
export const classOptions = (students) => [...new Set(students.map((s) => s.klass).filter(Boolean))].sort();
export const sectionOptions = (students) => [...new Set(students.map((s) => (s.klass && s.section ? `${s.klass} - ${s.section}` : null)).filter(Boolean))].sort();
export const roleOptions = (staff) => [...new Set(staff.map((s) => s.designation || s.role).filter(Boolean))].sort();

// resolve the recipient list for a communication's audience
export function resolveRecipients(comm, students, staff) {
  const t = comm.audienceType;
  const asStudent = (s) => ({ type: "Parent", id: s.id, name: s.name, klass: s.klass || "", section: s.section || "" });
  const asStaff = (s) => ({ type: "Staff", id: s.id, name: s.name, klass: s.designation || s.role || "", section: "" });
  if (t === "Everyone") return [...students.map(asStudent), ...staff.map(asStaff)];
  if (t === "All Students" || t === "All Parents") return students.map(asStudent);
  if (t === "All Staff") return staff.map(asStaff);
  if (t === "Specific Classes") { const set = new Set(comm.audienceClasses || []); return students.filter((s) => set.has(s.klass)).map(asStudent); }
  if (t === "Specific Sections") { const set = new Set(comm.audienceSections || []); return students.filter((s) => set.has(`${s.klass} - ${s.section}`)).map(asStudent); }
  if (t === "Specific Roles") { const set = new Set(comm.audienceRoles || []); return staff.filter((s) => set.has(s.designation || s.role)).map(asStaff); }
  return [];
}
export function audienceLabel(comm) {
  const t = comm.audienceType || "Everyone";
  if (t === "Specific Classes") return `Classes: ${(comm.audienceClasses || []).join(", ") || "—"}`;
  if (t === "Specific Sections") return `Sections: ${(comm.audienceSections || []).join(", ") || "—"}`;
  if (t === "Specific Roles") return `Roles: ${(comm.audienceRoles || []).join(", ") || "—"}`;
  return t;
}
