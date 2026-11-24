import { Link } from "react-router-dom";
import OctoMark from "@/components/brand/OctoMark";
import Button from "@/components/ui/Button";
export default function NotFound() {
  return (
    <div className="grid place-items-center py-24 text-center">
      <div className="animate-floaty opacity-50"><OctoMark size={72} /></div>
      <h1 className="font-display text-3xl text-navy mt-4">Lost at sea</h1>
      <p className="text-navy/50 mt-1">This page drifted away. Let's get you back.</p>
      <Link to="/app"><Button className="mt-5">Back to dashboard</Button></Link>
    </div>
  );
}
