// Scoped role → permission matrix. "*" = all. Read is open to any authed user
// of the tenant; writes/deletes are gated by role.
export const ROLE_PERMISSIONS = {
  "Super Admin": ["*"],
  "Platform Support": ["read"],
  "Reseller Admin": ["read"],
  "Reseller Support": ["read"],
  "Principal": ["*"],
  "School Admin": ["read", "write", "delete"],
  "Accountant": ["read", "write:fees", "write:invoices", "write:incomeExpense"],
  "Counsellor": ["read", "write:enquiries", "write:campusVisits"],
  "Class Teacher": ["read", "write:attendance", "write:homework", "write:milestones", "write:portfolio"],
};
export function can(role, action, resource) {
  const perms = ROLE_PERMISSIONS[role] || ["read"];
  if (perms.includes("*")) return true;
  if (action === "read") return perms.includes("read");
  return perms.includes(action) || perms.includes(`${action}:${resource}`);
}
