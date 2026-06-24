import { useState } from "react";
import { generateActionPlan } from "../utils/gemini.js";
import { hasKey } from "../utils/gemini.js";
import { taskSummaryText, habitSummaryText } from "../utils/helpers.js";
import { LoadingDots, GeminiLogo, EmptyState } from "../components/Spinner.jsx";
import { COLORS } from "../utils/constants.js";

function Section({ label, color = COLORS.indigo, children }) {
  return (
    <div
      style={{
        background: `${color}0D`,
        border: `1px solid ${color}30`,
        borderRadius: 13,
        padding: "15px 18px",
      }}
    >
      <div
        style={{
          fontSize: 10.5,
          color,
          fontFamily: "Space Grotesk, sans-serif",
          fontWeight: 700,
          letterSpacing: "0.08em",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

export function ActionPlan({ tasks, habits }) {
  const [plan,    setPlan]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  async function generate() {
    if (!hasKey()) {
      setError("Connect your Gemini API key on the Dashboard first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await generateActionPlan(
        taskSummaryText(tasks),
        habitSummaryText(habits)
      );
      setPlan(result);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  return (
    <div
      style={{
        padding: 24,
        overflowY: "auto",
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <GeminiLogo size={36} />
          <div>
            <h2
              style={{
                margin: 0,
                fontFamily: "Space Grotesk, sans-serif",
                color: COLORS.text,
                fontSize: 18,
                fontWeight: 800,
              }}
            >
              AI Action Plan
            </h2>
            <p
              style={{
                margin: "3px 0 0",
                color: COLORS.textDim,
                fontSize: 12,
                fontFamily: "Inter, sans-serif",
              }}
            >
              Powered by Google Gemini · Google AI Studio
            </p>
          </div>
        </div>

        <button
          onClick={generate}
          disabled={loading}
          style={{
            background: loading
              ? COLORS.border
              : "linear-gradient(135deg, #4285F4, #34A853)",
            border: "none",
            borderRadius: 11,
            padding: "11px 22px",
            color: loading ? COLORS.textDim : "#fff",
            cursor: loading ? "default" : "pointer",
            fontSize: 13.5,
            fontWeight: 700,
            fontFamily: "Space Grotesk, sans-serif",
            boxShadow: loading ? "none" : "0 4px 16px #4285F445",
            display: "flex",
            alignItems: "center",
            gap: 8,
            transition: "opacity 0.15s",
          }}
          onMouseOver={(e) => { if (!loading) e.currentTarget.style.opacity = "0.88"; }}
          onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
        >
          {loading ? (
            <>
              <LoadingDots color="#fff" size={6} />
              <span>Generating…</span>
            </>
          ) : (
            "✨ Generate with Gemini"
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background: "#F43F5E10",
            border: `1px solid ${COLORS.red}35`,
            borderRadius: 10,
            padding: "12px 16px",
            fontSize: 13,
            color: "#FCA5A5",
            fontFamily: "Inter, sans-serif",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Empty state */}
      {!plan && !loading && !error && (
        <EmptyState
          icon="🧠"
          title="No plan generated yet"
          subtitle="Click 'Generate with Gemini' to get a personalised schedule built from your real tasks and deadlines."
        />
      )}

      {/* Plan content */}
      {plan && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Headline */}
          <Section label="📌 TODAY'S FOCUS" color="#4285F4">
            <p
              style={{
                margin: 0,
                color: COLORS.text,
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 15,
                fontWeight: 600,
                lineHeight: 1.4,
              }}
            >
              {plan.headline}
            </p>
          </Section>

          {/* Risk + Rescue side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Section label="⚠️ RISK ALERT" color={COLORS.red}>
              <p
                style={{
                  margin: 0,
                  color: "#FDA4AF",
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13,
                  lineHeight: 1.55,
                }}
              >
                {plan.riskAlert}
              </p>
            </Section>

            <Section label="🎯 RESCUE TASK" color={COLORS.green}>
              <p
                style={{
                  margin: 0,
                  color: "#6EE7B7",
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  lineHeight: 1.4,
                }}
              >
                {plan.rescueTask}
              </p>
            </Section>
          </div>

          {/* Time blocks */}
          {Array.isArray(plan.timeBlocks) && plan.timeBlocks.length > 0 && (
            <div
              style={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 13,
                padding: "18px 20px",
              }}
            >
              <div
                style={{
                  fontSize: 10.5,
                  color: COLORS.textDim,
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  marginBottom: 18,
                }}
              >
                📅 GEMINI SCHEDULE
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {plan.timeBlocks.map((block, i) => (
                  <div
                    key={i}
                    style={{ display: "flex", gap: 16, alignItems: "flex-start" }}
                  >
                    {/* Time column */}
                    <div style={{ minWidth: 72, textAlign: "right", flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: "#4285F4",
                          fontFamily: "Space Grotesk, sans-serif",
                          lineHeight: 1.2,
                        }}
                      >
                        {block.time}
                      </div>
                      <div
                        style={{
                          fontSize: 10.5,
                          color: COLORS.textDim,
                          fontFamily: "Inter, sans-serif",
                          marginTop: 2,
                        }}
                      >
                        {block.duration}
                      </div>
                    </div>

                    {/* Connector line */}
                    <div
                      style={{
                        width: 2,
                        alignSelf: "stretch",
                        background:
                          i === 0 ? "#4285F4" : COLORS.border,
                        borderRadius: 2,
                        flexShrink: 0,
                        marginTop: 4,
                        minHeight: 36,
                        transition: "background 0.3s",
                      }}
                    />

                    {/* Task + action */}
                    <div style={{ flex: 1, paddingBottom: 4 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: COLORS.text,
                          fontFamily: "Space Grotesk, sans-serif",
                          marginBottom: 4,
                        }}
                      >
                        {block.task}
                      </div>
                      <div
                        style={{
                          fontSize: 12.5,
                          color: COLORS.textDim,
                          fontFamily: "Inter, sans-serif",
                          lineHeight: 1.45,
                        }}
                      >
                        → {block.action}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Habit note */}
          {plan.habitNote && (
            <Section label="🔥 HABIT MOMENTUM" color={COLORS.violet}>
              <p
                style={{
                  margin: 0,
                  color: "#C4B5FD",
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                {plan.habitNote}
              </p>
            </Section>
          )}

          {/* Battle cry */}
          {plan.battleCry && (
            <div
              style={{
                background: `linear-gradient(135deg, ${COLORS.indigo}15, #4285F415)`,
                border: `1px solid ${COLORS.indigo}20`,
                borderRadius: 13,
                padding: "18px 22px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: COLORS.indigoLt,
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: 16,
                  fontWeight: 700,
                  fontStyle: "italic",
                  lineHeight: 1.4,
                }}
              >
                "{plan.battleCry}"
              </p>
            </div>
          )}

          {/* Regenerate */}
          <button
            onClick={generate}
            style={{
              background: "transparent",
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              padding: "10px",
              color: COLORS.textDim,
              cursor: "pointer",
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: 13,
              transition: "all 0.15s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "#4285F4";
              e.currentTarget.style.color = "#4285F4";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = COLORS.border;
              e.currentTarget.style.color = COLORS.textDim;
            }}
          >
            ↻ Regenerate Plan
          </button>
        </div>
      )}
    </div>
  );
}
