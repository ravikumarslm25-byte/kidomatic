import icon from "./assets/logo-icon.png";
// The real KidoMatic mascot mark.
export default function Octo({ size = 96, className = "" }) {
  return <img src={icon} alt="KidoMatic" width={size} height={size} className={className} style={{ objectFit: "contain", display: "block" }} />;
}
