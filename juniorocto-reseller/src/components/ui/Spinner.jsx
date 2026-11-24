export default function Spinner({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="animate-spin">
      <circle cx="12" cy="12" r="9" stroke="rgba(30,54,79,.15)" strokeWidth="3" fill="none" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="var(--jo-coral)" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}
