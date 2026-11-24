import { canManageSetup } from "./roles";

// Does a role permit a feature at a level? Safe defaults avoid lockout:
//  - unknown role (not in table)        -> allow (nothing configured for them)
//  - system Administrator / Principal   -> allow all
//  - role with an empty permission map  -> allow (not configured yet)
//  - configured role                    -> honour the map (missing = deny)
export function rolePermits(role, feature, level = "view") {
  if (!role) return true;
  if (role.isSystem === true && /admin|principal/i.test(role.name || "")) return true;
  const perms = role.permissions || {};
  if (!perms || Object.keys(perms).length === 0) return true;
  const p = perms[feature];
  if (!p) return false;
  return level === "manage" ? !!p.manage : (!!p.view || !!p.manage);
}

// Resolve permission for the logged-in user (admins always pass).
export function userCan(user, role, feature, level = "view") {
  if (canManageSetup(user)) return true;
  return rolePermits(role, feature, level);
}
