import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout";
import AppLayout from "@/layouts/AppLayout";
import ProtectedRoute from "./ProtectedRoute";
import Login from "@/views/auth/Login";
import ForgotPassword from "@/views/auth/ForgotPassword";
import Dashboard from "@/views/Dashboard";
import Reports from "@/views/Reports";
import Leads from "@/views/Leads";
import Quotations from "@/views/Quotations";
import Invoices from "@/views/Invoices";
import InvoiceView from "@/views/InvoiceView";
import Licenses from "@/views/Licenses";
import Transactions from "@/views/Transactions";
import Resellers from "@/views/Resellers";
import Customers from "@/views/Customers";
import Support from "@/views/Support";
import Users from "@/views/Users";
import Plans from "@/views/Plans";
import Settings from "@/views/Settings";
import Profile from "@/views/Profile";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/quotations" element={<Quotations />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/:id" element={<InvoiceView />} />
          <Route path="/licenses" element={<Licenses />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/resellers" element={<Resellers />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/support" element={<Support />} />
          <Route path="/users" element={<Users />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
