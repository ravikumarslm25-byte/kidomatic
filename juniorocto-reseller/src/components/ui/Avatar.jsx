import { initials } from "@/lib/format";
const HUES = ["#1E56A8","#F26A35","#4FA8C4","#7C5CBF","#12A594","#E1571F"];
export default function Avatar({ name = "", size = 34 }) {
  const hue = HUES[(name.charCodeAt(0) || 0) % HUES.length];
  return (
    <div className="grid place-items-center rounded-full text-white font-semibold shrink-0"
      style={{ width: size, height: size, background: hue, fontSize: size * 0.38 }}>
      {initials(name)}
    </div>
  );
}
