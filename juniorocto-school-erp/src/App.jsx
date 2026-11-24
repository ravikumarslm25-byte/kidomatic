import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/store/auth";
import { BrandingProvider } from "@/store/branding";
import { ToastProvider } from "@/store/toast";
import AppRoutes from "@/routes";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <BrandingProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrandingProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
