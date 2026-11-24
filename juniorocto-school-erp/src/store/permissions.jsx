import { useState, useEffect, useMemo } from "react";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useAuth } from "@/store/auth";
import { userCan } from "@/lib/permissions";

// Lightweight permission hook: loads roles, matches the user's role by name,
// returns can(feature, level). Until loaded, allows everything (no flicker-lock).
export function usePermissions() {
  const { user } = useAuth();
  const [roles, setRoles] = useState(null);
  useEffect(() => { resourceService("roles").list({}).then((r) => setRoles(normList(r))).catch(() => setRoles([])); }, []);
  const role = useMemo(() => (roles || []).find((r) => (r.name || "").toLowerCase() === (user?.role || "").toLowerCase()) || null, [roles, user]);
  const ready = roles != null;
  const can = (feature, level = "view") => (!ready ? true : userCan(user, role, feature, level));
  return { can, ready, role, roles: roles || [] };
}
