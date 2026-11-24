import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "@/store/toast";
import { AuthProvider } from "@/store/auth";
import AppRoutes from "@/routes";
export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider><AuthProvider><AppRoutes /></AuthProvider></ToastProvider>
    </BrowserRouter>
  );
}
