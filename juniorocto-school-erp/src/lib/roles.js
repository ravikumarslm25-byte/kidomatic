// Who may manage master data / setup. Admins, principals, owners, platform users.
export function canManageSetup(user) {
  if (!user) return false;
  if (user.audience === "platform") return true;
  const r = (user.role || "").toLowerCase();
  return /admin|principal|super|owner|director|head of|vice.?principal/.test(r);
}
