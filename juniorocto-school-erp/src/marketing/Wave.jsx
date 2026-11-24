export default function Wave({ fill = "#fff", flip = false }) {
  return (
    <svg className="wave" viewBox="0 0 1440 90" preserveAspectRatio="none" style={{ transform: flip ? "scaleY(-1)" : "none" }} aria-hidden="true">
      <path d="M0 60 Q360 0 720 40 T1440 30 V90 H0Z" fill={fill} />
    </svg>
  );
}
