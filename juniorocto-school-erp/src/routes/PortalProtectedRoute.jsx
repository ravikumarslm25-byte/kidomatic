import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/store/auth";

export default function PortalProtectedRoute() {
  const { isAuthed, user } = useAuth();
  if (!isAuthed) return <Navigate to="/portal/login" replace />;
  if (!["parent", "student"].includes(user?.audience)) return <Navigate to="/portal/login" replace />;
  return <Outlet />;
}
