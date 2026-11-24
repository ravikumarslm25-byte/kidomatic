import { Outlet } from "react-router-dom";
export default function AuthLayout() {
  return <div className="jo-canvas min-h-screen grid lg:grid-cols-2"><Outlet /></div>;
}
