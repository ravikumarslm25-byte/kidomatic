// Flat inline-SVG illustrations for the homepage hero (no external image requests).
// Flat fills only — no gradient ids — so the same art can render many times on a page.

export function FarmArt({ className = "" }) {
  return (
    <svg viewBox="0 0 160 110" className={className} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="160" height="110" fill="#CDEBFF" />
      <circle cx="136" cy="18" r="9" fill="#FFD84D" />
      <ellipse cx="38" cy="18" rx="15" ry="5" fill="#fff" opacity=".95" />
      <ellipse cx="88" cy="12" rx="10" ry="3.5" fill="#fff" opacity=".8" />
      <path d="M0 66 Q40 50 82 62 T160 56 V110 H0Z" fill="#9AD873" />
      <path d="M0 84 Q52 70 104 80 T160 76 V110 H0Z" fill="#6CBF4A" />
      {/* barn */}
      <g transform="translate(106 34)">
        <path d="M0 20 L22 3 L44 20 V50 H0Z" fill="#E2483D" />
        <path d="M-3 21 L22 1 L47 21" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round" />
        <rect x="18" y="12" width="8" height="8" rx="1" fill="#fff" />
        <rect x="13" y="29" width="18" height="21" fill="#B83228" />
        <path d="M13 29 L31 50 M31 29 L13 50" stroke="#fff" strokeWidth="2" />
        <rect x="13" y="29" width="18" height="21" fill="none" stroke="#fff" strokeWidth="2.2" />
      </g>
      {/* fence */}
      <g stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
        <path d="M70 86 V72 M80 86 V72 M90 86 V72 M100 86 V72" />
        <path d="M66 76 H104 M66 82 H104" />
      </g>
      {/* cow */}
      <g transform="translate(12 46)" stroke="#2E2E3A" strokeWidth="1.4" strokeLinejoin="round">
        <rect x="20" y="36" width="7" height="16" rx="3" fill="#fff" />
        <rect x="46" y="36" width="7" height="16" rx="3" fill="#fff" />
        <path d="M60 22 q8 2 6 14" fill="none" strokeLinecap="round" />
        <rect x="14" y="12" width="48" height="30" rx="15" fill="#fff" />
        <path d="M32 13 q9 -1 10 7 q-1 9 -10 7 q-5 -7 0 -14z" fill="#2F2F38" stroke="none" />
        <ellipse cx="54" cy="31" rx="5" ry="4.5" fill="#2F2F38" stroke="none" />
        <rect x="27" y="38" width="7" height="16" rx="3" fill="#fff" />
        <rect x="52" y="38" width="7" height="16" rx="3" fill="#fff" />
        {/* head (its own group so the hero card can make it nod) */}
        <g className="jo-cow-head">
          <path d="M2 6 q-6 -6 -4 -10 q5 2 7 7z" fill="#F5D7A1" />
          <path d="M24 6 q6 -6 4 -10 q-5 2 -7 7z" fill="#F5D7A1" />
          <ellipse cx="-1" cy="11" rx="6" ry="3.4" fill="#fff" transform="rotate(-25 -1 11)" />
          <ellipse cx="27" cy="11" rx="6" ry="3.4" fill="#fff" transform="rotate(25 27 11)" />
          <ellipse cx="13" cy="17" rx="13" ry="14" fill="#fff" />
          <path d="M6 7 q4 -3 9 0 q-2 6 -9 0z" fill="#2F2F38" stroke="none" />
          <ellipse cx="13" cy="28" rx="11" ry="7.5" fill="#FFB3BC" />
          <ellipse cx="9" cy="28" rx="1.6" ry="2" fill="#C85B6A" stroke="none" />
          <ellipse cx="17" cy="28" rx="1.6" ry="2" fill="#C85B6A" stroke="none" />
          <g stroke="none">
            <circle cx="8" cy="16" r="2.6" fill="#1F1F28" />
            <circle cx="18" cy="16" r="2.6" fill="#1F1F28" />
            <circle cx="8.9" cy="15.1" r=".9" fill="#fff" />
            <circle cx="18.9" cy="15.1" r=".9" fill="#fff" />
          </g>
        </g>
      </g>
    </svg>
  );
}

function Block({ x, y, s, face, side, top, n }) {
  const d = s * 0.18;
  return (
    <g>
      <path d={`M${x} ${y} l${d} ${-d} h${s} l${-d} ${d}z`} fill={top} />
      <path d={`M${x + s} ${y} l${d} ${-d} v${s} l${-d} ${d}z`} fill={side} />
      <rect x={x} y={y} width={s} height={s} rx="3" fill={face} />
      <text x={x + s / 2} y={y + s * 0.74} textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize={s * 0.72} fill="#fff" stroke="rgba(0,0,0,.12)" strokeWidth=".6">{n}</text>
    </g>
  );
}

export function NumberArt({ className = "" }) {
  return (
    <svg viewBox="0 0 160 110" className={className} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="160" height="110" fill="#CFE7FF" />
      <ellipse cx="128" cy="20" rx="16" ry="5" fill="#fff" opacity=".9" />
      <ellipse cx="30" cy="14" rx="11" ry="4" fill="#fff" opacity=".8" />
      <path d="M0 80 Q50 66 100 76 T160 72 V110 H0Z" fill="#7CCB59" />
      <g className="jo-block jo-block-1"><Block x={18} y={56} s={34} face="#2F7BF0" side="#1C5DC4" top="#6FA6F7" n="1" /></g>
      <g className="jo-block jo-block-3"><Block x={60} y={58} s={32} face="#FF9F1C" side="#D97A06" top="#FFC36B" n="3" /></g>
      <g className="jo-block jo-block-2"><Block x={38} y={18} s={34} face="#EF4444" side="#C22B2B" top="#F78585" n="2" /></g>
      {/* chick */}
      <g className="jo-chick"><g transform="translate(116 62)">
        <path d="M-6 30 h5 M8 30 h5" stroke="#F08A1C" strokeWidth="2.6" strokeLinecap="round" />
        <ellipse cx="4" cy="16" rx="17" ry="15" fill="#FFD43B" />
        <circle cx="4" cy="-4" r="12" fill="#FFD43B" />
        <path d="M1 -16 q2 -6 5 -1 q2 -5 4 0" fill="none" stroke="#F2B705" strokeWidth="2" strokeLinecap="round" />
        <path d="M-10 14 q-6 4 -2 10 q6 -2 6 -8z" fill="#F7C21B" />
        <circle cx="0" cy="-5" r="2.4" fill="#1F1F28" />
        <circle cx="9" cy="-5" r="2.4" fill="#1F1F28" />
        <circle cx=".8" cy="-5.8" r=".8" fill="#fff" />
        <circle cx="9.8" cy="-5.8" r=".8" fill="#fff" />
        <path d="M2 0 l3 4 l3 -4z" fill="#F08A1C" />
        <circle cx="-4" cy="1" r="2.2" fill="#FFA8A8" opacity=".8" />
        <circle cx="13" cy="1" r="2.2" fill="#FFA8A8" opacity=".8" />
      </g></g>
    </svg>
  );
}

export function ShapeArt({ className = "" }) {
  const scallops = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return [80 + Math.cos(a) * 24, 50 + Math.sin(a) * 24];
  });
  return (
    <svg viewBox="0 0 160 110" className={className} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="160" height="110" fill="#E6DBFF" />
      <ellipse cx="128" cy="16" rx="14" ry="4.5" fill="#fff" opacity=".85" />
      <path d="M0 82 Q48 70 96 80 T160 76 V110 H0Z" fill="#8FD16A" />
      <path className="jo-shape-tri" d="M8 92 L30 54 L52 92Z" fill="#22B573" stroke="#15925A" strokeWidth="1.5" strokeLinejoin="round" />
      {/* lion */}
      <g className="jo-lion">
      {scallops.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="9.5" fill={i % 2 ? "#E8791A" : "#F29A2E"} />)}
      <circle cx="80" cy="50" r="22" fill="#F29A2E" />
      <circle cx="66" cy="34" r="5" fill="#FFC86E" stroke="#E8791A" strokeWidth="1.5" />
      <circle cx="94" cy="34" r="5" fill="#FFC86E" stroke="#E8791A" strokeWidth="1.5" />
      <circle cx="80" cy="51" r="16.5" fill="#FFC86E" />
      <ellipse cx="80" cy="58" rx="9" ry="6.5" fill="#FFE6B8" />
      <circle cx="73.5" cy="47" r="2.6" fill="#1F1F28" />
      <circle cx="86.5" cy="47" r="2.6" fill="#1F1F28" />
      <circle cx="74.3" cy="46.2" r=".85" fill="#fff" />
      <circle cx="87.3" cy="46.2" r=".85" fill="#fff" />
      <path d="M77 54 h6 l-3 3.5z" fill="#6B3A1E" />
      <path d="M80 57.5 q-3 3.5 -5.5 1.5 M80 57.5 q3 3.5 5.5 1.5" fill="none" stroke="#6B3A1E" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="70" cy="55" r="2.4" fill="#FF9F8A" opacity=".7" />
      <circle cx="90" cy="55" r="2.4" fill="#FF9F8A" opacity=".7" />
      </g>
      {/* cube + ball */}
      <g className="jo-shape-cube">
        <path d="M114 70 l7 -7 h26 l-7 7z" fill="#7AB2FF" />
        <path d="M140 70 l7 -7 v26 l-7 7z" fill="#1C5DC4" />
        <rect x="114" y="70" width="26" height="26" rx="2" fill="#2F7BF0" />
      </g>
      <g className="jo-shape-ball">
        <circle cx="104" cy="94" r="8" fill="#EF4444" />
        <circle cx="101.5" cy="91.5" r="2.2" fill="#fff" opacity=".55" />
      </g>
    </svg>
  );
}

export function OceanArt({ className = "" }) {
  return (
    <svg viewBox="0 0 160 110" className={className} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="160" height="110" fill="#7FD3EC" />
      <path d="M0 30 Q20 24 40 30 T80 30 T120 30 T160 30 V110 H0Z" fill="#3FB6C9" />
      <path d="M0 92 Q40 82 80 92 T160 90 V110 H0Z" fill="#F4D58D" />
      <g transform="translate(58 52)">
        <path d="M34 0 l14 -10 v20z" fill="#FF8A3D" />
        <ellipse cx="18" cy="0" rx="20" ry="13" fill="#FF9F1C" />
        <path d="M12 -12 v24 M22 -12 v24" stroke="#fff" strokeWidth="4" />
        <circle cx="6" cy="-3" r="3" fill="#1F1F28" />
        <circle cx="7" cy="-4" r="1" fill="#fff" />
      </g>
      <circle cx="40" cy="48" r="4" fill="none" stroke="#fff" strokeWidth="1.5" opacity=".8" />
      <circle cx="46" cy="38" r="2.5" fill="none" stroke="#fff" strokeWidth="1.5" opacity=".8" />
      <path d="M20 92 q-4 -14 2 -24 M26 92 q6 -12 0 -22" stroke="#2E9E52" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function StarShape({ className = "", style }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
      <path d="M12 1.8l2.9 6.4 7 .7-5.3 4.7 1.6 6.9L12 16.9l-6.2 3.6 1.6-6.9L2.1 8.9l7-.7z" fill="#FFC83D" stroke="#F5A623" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M9.2 7.6 l1.3 -2.6" stroke="#FFF3C4" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IndiaFlag({ size = 22 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <clipPath id="jo-in-flag"><circle cx="12" cy="12" r="11" /></clipPath>
      <g clipPath="url(#jo-in-flag)">
        <rect width="24" height="8" fill="#FF9933" />
        <rect y="8" width="24" height="8" fill="#fff" />
        <rect y="16" width="24" height="8" fill="#138808" />
        <circle cx="12" cy="12" r="2.6" fill="none" stroke="#000080" strokeWidth=".9" />
        <circle cx="12" cy="12" r=".7" fill="#000080" />
      </g>
      <circle cx="12" cy="12" r="11" fill="none" stroke="rgba(20,51,94,.15)" />
    </svg>
  );
}

export function Plant({ className = "", flip = false }) {
  const leaves = [
    ["M60 160 C40 110 10 90 0 40 C40 60 60 100 60 160Z", "#5DBB63"],
    ["M70 160 C70 100 90 60 120 20 C130 70 100 110 70 160Z", "#3E9E50"],
    ["M64 160 C80 120 120 110 160 100 C140 140 100 150 64 160Z", "#7ED07B"],
    ["M58 160 C30 140 10 140 -10 120 C20 110 45 125 58 160Z", "#4CAF5A"],
    ["M66 160 C60 120 50 80 60 50 C80 80 78 120 66 160Z", "#8BD989"],
  ];
  return (
    <svg viewBox="-10 0 180 160" className={className} style={flip ? { transform: "scaleX(-1)" } : undefined} aria-hidden="true">
      {leaves.map(([d, c], i) => <path key={i} d={d} fill={c} opacity=".92" />)}
    </svg>
  );
}
