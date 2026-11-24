import mark from "@/assets/logo-mark.png";
// The real KidoMatic octopus mark. Same API as before (size/className),
// so every existing usage (sidebar, login, empty states, ID cards, 404) updates.
export default function OctoMark({ size = 34, className = "" }) {
  return <img src={mark} alt="KidoMatic" width={size} height={size} className={className} style={{ objectFit: "contain" }} draggable={false} />;
}
