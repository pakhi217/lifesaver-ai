import { COLORS } from "../utils/constants.js";

export function ProactiveAlert({ alert, onDismiss }) {
  return (
    <div
      role="alert"
      style={{
        background: "linear-gradient(135deg, #F43F5E12, #F9731612)",
        border: "1px solid #F43F5E45",
        borderLeft: "3px solid #F43F5E",
        borderRadius: 12,
        padding: "13px 16px",
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        animation: "slideIn 0.35s ease",
      }}
    >
      <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1.2 }}>🚨</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 10.5,
            color: COLORS.red,
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 700,
            letterSpacing: "0.08em",
            marginBottom: 4,
          }}
        >
          PROACTIVE ALERT
          {alert.taskTitle && (
            <span
              style={{
                marginLeft: 8,
                color: COLORS.textDim,
                fontWeight: 400,
                textTransform: "none",
                letterSpacing: 0,
                fontSize: 10.5,
              }}
            >
              · {alert.taskTitle}
            </span>
          )}
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: "#FCA5A5",
            fontFamily: "Inter, sans-serif",
            lineHeight: 1.55,
          }}
        >
          {alert.text}
        </p>
      </div>

      <button
        onClick={onDismiss}
        aria-label="Dismiss alert"
        style={{
          background: "transparent",
          border: "none",
          color: COLORS.textFaint,
          cursor: "pointer",
          fontSize: 20,
          lineHeight: 1,
          padding: "0 2px",
          flexShrink: 0,
          transition: "color 0.15s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.color = COLORS.red)}
        onMouseOut={(e) => (e.currentTarget.style.color = COLORS.textFaint)}
      >
        ×
      </button>
    </div>
  );
}
