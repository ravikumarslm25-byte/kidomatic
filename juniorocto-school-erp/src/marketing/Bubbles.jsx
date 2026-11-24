export default function Bubbles({ count = 8 }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => {
        const size = 8 + (i % 4) * 7;
        return <span key={i} className="bubble" style={{ left: `${(i * 13) % 100}%`, bottom: "-20px", width: `${size}px`, height: `${size}px`, animationDuration: `${5 + (i % 5)}s`, animationDelay: `${i * 0.7}s` }} />;
      })}
    </div>
  );
}
