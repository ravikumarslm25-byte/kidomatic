import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout";
import AppLayout from "@/layouts/AppLayout";
import ProtectedRoute from "./ProtectedRoute";
import Login from "@/views/auth/Login";
import Dashboard from "@/views/Dashboard";
import Schools from "@/views/Schools";
import SchoolDetail from "@/views/SchoolDetail";
import Referrals from "@/views/Referrals";
import Billing from "@/views/Billing";
import Offers from "@/views/Offers";
import Reports from "@/views/Reports";
import Settings from "@/views/Settings";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}><Route path="/login" element={<Login />} /></Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/schools" element={<Schools />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/schools/:id" element={<SchoolDetail />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
