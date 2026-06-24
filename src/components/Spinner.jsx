import { COLORS } from "../utils/constants.js";

export function LoadingDots({ color = COLORS.indigo, size = 7 }) {
  return (
    <div style={{ display: "flex", gap: size * 0.7, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: color,
            animation: `bounce 1.2s ease infinite ${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

export function Spinner({ size = 20, color = COLORS.indigo }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      style={{
        width: size,
        height: size,
        border: `2px solid ${color}30`,
        borderTop: `2px solid ${color}`,
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
        flexShrink: 0,
      }}
    />
  );
}

export function GeminiLogo({ size = 26 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        background: "linear-gradient(135deg, #4285F4, #34A853, #FBBC04, #EA4335)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.54,
        fontWeight: 900,
        color: "#fff",
        flexShrink: 0,
        fontFamily: "Space Grotesk, sans-serif",
      }}
    >
      G
    </div>
  );
}

export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: 40,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 44, lineHeight: 1 }}>{icon}</div>
      <div
        style={{
          fontFamily: "Space Grotesk, sans-serif",
          fontWeight: 700,
          fontSize: 16,
          color: COLORS.textFaint,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            color: COLORS.textGhost,
            margin: 0,
            maxWidth: 280,
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </p>
      )}
      {action}
    </div>
  );
}
