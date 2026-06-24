import { useState, useEffect } from "react";
import { UrgencyRing } from "./UrgencyRing.jsx";
import { urgencyScore, fmtDeadline } from "../utils/helpers.js";
import { generateTaskBreakdown } from "../utils/gemini.js";
import { hasKey } from "../utils/gemini.js";
import { COLORS, P_COLOR, P_LABEL } from "../utils/constants.js";

function BreakdownPanel({ task }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  useEffect(() => {
    if (!hasKey()) return;
    setLoading(true);
    setError(null);
    generateTaskBreakdown(task)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [task.id]);

  if (!hasKey()) return null;

  return (
    <div
      style={{
        background: "#0F132280",
        border: "1px solid #1E2235",
        borderRadius: 14,
        padding: "18px 22px",
        width: "100%",
        maxWidth: 500,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: COLORS.indigo,
          fontFamily: "Space Grotesk, sans-serif",
          fontWeight: 700,
          letterSpacing: "0.08em",
          marginBottom: 14,
        }}
      >
        ✨ GEMINI BREAKDOWN
      </div>

      {loading && (
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: COLORS.indigo,
                animation: `bounce 1.2s ease infinite ${i * 0.2}s`,
              }}
            />
          ))}
          <span style={{ color: COLORS.textDim, fontSize: 13, fontFamily: "Inter, sans-serif", marginLeft: 6 }}>
            Analyzing with Gemini…
          </span>
        </div>
      )}

      {error && (
        <p style={{ color: "#FCA5A5", fontSize: 13, fontFamily: "Inter, sans-serif", margin: 0 }}>
          ⚠️ {error}
        </p>
      )}

      {data && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: COLORS.textDim, fontFamily: "Inter, sans-serif" }}>
              Estimated time:
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: COLORS.yellow,
                fontFamily: "Space Grotesk, sans-serif",
              }}
            >
              {data.estimate}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.steps?.map((step) => (
              <div key={step.order} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: `${COLORS.indigo}30`,
                    border: `1px solid ${COLORS.indigo}60`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: COLORS.indigoLt,
                    flexShrink: 0,
                    fontFamily: "Space Grotesk, sans-serif",
                    marginTop: 1,
                  }}
                >
                  {step.order}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, color: COLORS.text, fontFamily: "Inter, sans-serif" }}>
                    {step.action}
                  </span>
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 11,
                      color: COLORS.textDim,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    · {step.duration}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {data.tip && (
            <div
              style={{
                background: `${COLORS.green}10`,
                border: `1px solid ${COLORS.green}30`,
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 12.5,
                color: "#6EE7B7",
                fontFamily: "Inter, sans-serif",
                lineHeight: 1.5,
              }}
            >
              💡 {data.tip}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function RescueMode({ task, onExit, onMarkDone }) {
  const score   = urgencyScore(task);
  const overdue = fmtDeadline(task.deadline).includes("overdue");

  // Trap focus inside overlay
  useEffect(() => {
    const prev = document.activeElement;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      prev?.focus();
    };
  }, []);

  // Escape key exits
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onExit(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onExit]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Rescue Mode"
      style={{
        position: "fixed",
        inset: 0,
        background: "#000000F2",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        backdropFilter: "blur(10px)",
        padding: 24,
        overflowY: "auto",
        animation: "fadeIn 0.3s ease",
      }}
    >
      {/* Badge */}
      <div
        style={{
          fontSize: 12,
          fontFamily: "Space Grotesk, sans-serif",
          fontWeight: 700,
          letterSpacing: "0.2em",
          color: COLORS.red,
          animation: "pulse 1.8s ease infinite",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span>⚡</span>
        <span>RESCUE MODE</span>
        <span>⚡</span>
      </div>

      {/* Ring */}
      <UrgencyRing score={score} size={150} />

      {/* Task info */}
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <h1
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: 28,
            fontWeight: 800,
            color: COLORS.text,
            margin: "0 0 8px",
            lineHeight: 1.15,
          }}
        >
          {task.title}
        </h1>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: 13,
              color: P_COLOR[task.priority],
              fontWeight: 700,
              fontFamily: "Space Grotesk, sans-serif",
            }}
          >
            {P_LABEL[task.priority]} Priority
          </span>
          <span
            style={{
              fontSize: 14,
              color: overdue ? COLORS.red : COLORS.orange,
              fontWeight: 700,
              fontFamily: "Inter, sans-serif",
              animation: overdue ? "pulse 1.5s ease infinite" : "none",
            }}
          >
            {fmtDeadline(task.deadline)}
          </span>
          <span style={{ fontSize: 13, color: COLORS.textDim, fontFamily: "Inter, sans-serif" }}>
            {task.category}
          </span>
        </div>

        {task.notes && (
          <p
            style={{
              margin: "12px auto 0",
              maxWidth: 380,
              fontSize: 13.5,
              color: COLORS.textMid,
              fontFamily: "Inter, sans-serif",
              lineHeight: 1.55,
              background: "#161B2E80",
              borderRadius: 10,
              padding: "10px 16px",
            }}
          >
            {task.notes}
          </p>
        )}
      </div>

      {/* Gemini breakdown */}
      <BreakdownPanel task={task} />

      {/* Actions */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={onExit}
          style={{
            background: "transparent",
            border: `1px solid ${COLORS.border2}`,
            borderRadius: 10,
            padding: "11px 22px",
            color: COLORS.textDim,
            cursor: "pointer",
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: 13,
            fontWeight: 600,
            transition: "border-color 0.15s, color 0.15s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = COLORS.textFaint;
            e.currentTarget.style.color = COLORS.textMid;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = COLORS.border2;
            e.currentTarget.style.color = COLORS.textDim;
          }}
        >
          ← Exit Focus
        </button>

        <button
          onClick={() => { onMarkDone?.(task.id); onExit(); }}
          style={{
            background: `${COLORS.green}20`,
            border: `1px solid ${COLORS.green}50`,
            borderRadius: 10,
            padding: "11px 22px",
            color: COLORS.green,
            cursor: "pointer",
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: 13,
            fontWeight: 700,
            transition: "background 0.15s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = `${COLORS.green}30`)}
          onMouseOut={(e) => (e.currentTarget.style.background = `${COLORS.green}20`)}
        >
          ✓ Mark Done
        </button>

        <button
          style={{
            background: "linear-gradient(135deg, #F43F5E, #F97316)",
            border: "none",
            borderRadius: 10,
            padding: "11px 28px",
            color: "#fff",
            cursor: "pointer",
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: 13,
            fontWeight: 700,
            boxShadow: "0 4px 20px #F43F5E50",
            transition: "opacity 0.15s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = "0.88")}
          onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
        >
          🎯 Start Working Now
        </button>
      </div>

      {/* Hint */}
      <p style={{ fontSize: 11, color: COLORS.textGhost, fontFamily: "Inter, sans-serif", margin: 0 }}>
        Press <kbd style={{ background: "#1E2235", borderRadius: 4, padding: "1px 5px", fontSize: 10 }}>Esc</kbd> to exit
      </p>
    </div>
  );
}
