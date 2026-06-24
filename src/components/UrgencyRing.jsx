import { scoreColor } from "../utils/helpers.js";

export function UrgencyRing({ score, size = 80, showLabel = true }) {
  const r    = size * 0.43;
  const c    = size / 2;
  const sw   = size * 0.085;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(100, Math.max(0, score)) / 100) * circ;
  const col  = scoreColor(score);
  const glow = score >= 75;

  return (
    <div
      role="img"
      aria-label={`Urgency score: ${Math.round(score)} out of 100`}
      style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={c} cy={c} r={r}
          fill="none"
          stroke="#1E2235"
          strokeWidth={sw}
        />
        {/* Glow layer (blurred duplicate) */}
        {glow && (
          <circle
            cx={c} cy={c} r={r}
            fill="none"
            stroke={col}
            strokeWidth={sw + 2}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            opacity={0.25}
            style={{ filter: `blur(${sw}px)` }}
          />
        )}
        {/* Main arc */}
        <circle
          cx={c} cy={c} r={r}
          fill="none"
          stroke={col}
          strokeWidth={sw}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{
            transition: "stroke-dasharray 0.7s ease, stroke 0.4s ease",
            filter: glow ? `drop-shadow(0 0 ${sw * 0.7}px ${col})` : "none",
          }}
        />
      </svg>

      {showLabel && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontSize: size * 0.22,
              fontWeight: 800,
              color: col,
              lineHeight: 1,
              fontFamily: "Space Grotesk, sans-serif",
              transition: "color 0.4s",
            }}
          >
            {Math.round(score)}
          </span>
          <span
            style={{
              fontSize: size * 0.11,
              color: "#64748B",
              letterSpacing: "0.05em",
              fontFamily: "Inter, sans-serif",
              marginTop: 1,
            }}
          >
            URGENCY
          </span>
        </div>
      )}
    </div>
  );
}
