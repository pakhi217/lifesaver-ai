import { useState } from "react";
import { DAYS, HOURS, COLORS, P_COLOR } from "../utils/constants.js";
import { getWeekDates, fmtDeadline, urgencyScore } from "../utils/helpers.js";
import { suggestScheduleSlot } from "../utils/gemini.js";
import { hasKey } from "../utils/gemini.js";
import { LoadingDots } from "../components/Spinner.jsx";

function SlotCell({ task, onClear }) {
  if (!task) return null;
  return (
    <div
      style={{
        background: `${P_COLOR[task.priority]}18`,
        border: `1px solid ${P_COLOR[task.priority]}50`,
        borderRadius: 6,
        padding: "4px 7px",
        fontSize: 11,
        color: P_COLOR[task.priority],
        fontFamily: "Space Grotesk, sans-serif",
        fontWeight: 600,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 4,
        overflow: "hidden",
      }}
    >
      <span
        style={{
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        title={task.title}
      >
        {task.title}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); onClear(task.id); }}
        aria-label={`Remove ${task.title} from slot`}
        style={{
          background: "transparent",
          border: "none",
          color: COLORS.textGhost,
          cursor: "pointer",
          fontSize: 14,
          lineHeight: 1,
          padding: 0,
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}

export function Calendar({ tasks, onAssignSlot, onClearSlot }) {
  const week      = getWeekDates();
  const todayIdx  = new Date().getDay();
  const [dragging, setDragging] = useState(null);
  const [suggesting, setSuggesting] = useState(null); // task id being suggested
  const [suggestion, setSuggestion] = useState(null); // {day, hour, reason}
  const [sugError, setSugError]     = useState(null);

  const unscheduled = tasks.filter((t) => !t.done && !t.calSlot);

  function getSlotTask(dayIdx, hour) {
    return tasks.find(
      (t) => t.calSlot?.day === dayIdx && t.calSlot?.hour === hour
    ) ?? null;
  }

  async function handleSuggest(task) {
    if (!hasKey()) {
      setSugError("Connect your Gemini API key first.");
      return;
    }
    setSuggesting(task.id);
    setSuggestion(null);
    setSugError(null);
    try {
      const existingSlots = tasks
        .filter((t) => t.calSlot && t.id !== task.id)
        .map((t) => t.calSlot);
      const result = await suggestScheduleSlot(task, existingSlots);
      setSuggestion({ ...result, taskId: task.id });
    } catch (e) {
      setSugError(e.message);
    }
    setSuggesting(null);
  }

  function acceptSuggestion() {
    if (!suggestion) return;
    onAssignSlot(suggestion.taskId, suggestion.day, suggestion.hour);
    setSuggestion(null);
  }

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Unscheduled sidebar */}
      <div
        style={{
          width: 200,
          borderRight: `1px solid ${COLORS.border}`,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "12px 14px",
            borderBottom: `1px solid ${COLORS.border}`,
            fontSize: 11,
            color: COLORS.textDim,
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 700,
            letterSpacing: "0.08em",
          }}
        >
          UNSCHEDULED ({unscheduled.length})
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 10,
            display: "flex",
            flexDirection: "column",
            gap: 7,
          }}
        >
          {unscheduled.length === 0 && (
            <p
              style={{
                fontSize: 12,
                color: COLORS.textGhost,
                fontFamily: "Inter, sans-serif",
                margin: 0,
                padding: "8px 4px",
              }}
            >
              All tasks scheduled!
            </p>
          )}
          {unscheduled.map((t) => (
            <div key={t.id}>
              <div
                draggable
                onDragStart={() => setDragging(t)}
                onDragEnd={() => setDragging(null)}
                style={{
                  background: COLORS.surface,
                  border: `1px solid ${P_COLOR[t.priority]}30`,
                  borderLeft: `3px solid ${P_COLOR[t.priority]}`,
                  borderRadius: 8,
                  padding: "8px 10px",
                  cursor: "grab",
                  opacity: dragging?.id === t.id ? 0.5 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: COLORS.textMid,
                    fontFamily: "Space Grotesk, sans-serif",
                    marginBottom: 3,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={t.title}
                >
                  {t.title}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: COLORS.textDim,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {fmtDeadline(t.deadline)}
                </div>
              </div>

              {/* Gemini suggest button */}
              <button
                onClick={() => handleSuggest(t)}
                disabled={suggesting === t.id}
                style={{
                  width: "100%",
                  marginTop: 4,
                  background: "transparent",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 6,
                  padding: "4px 0",
                  fontSize: 10.5,
                  color: COLORS.textDim,
                  cursor: suggesting === t.id ? "default" : "pointer",
                  fontFamily: "Space Grotesk, sans-serif",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  transition: "border-color 0.15s, color 0.15s",
                }}
                onMouseOver={(e) => {
                  if (suggesting !== t.id) {
                    e.currentTarget.style.borderColor = "#4285F4";
                    e.currentTarget.style.color = "#4285F4";
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = COLORS.border;
                  e.currentTarget.style.color = COLORS.textDim;
                }}
              >
                {suggesting === t.id ? (
                  <LoadingDots color="#4285F4" size={5} />
                ) : (
                  "✨ AI Suggest Slot"
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Suggestion result */}
        {suggestion && (
          <div
            style={{
              padding: "12px 12px",
              borderTop: `1px solid ${COLORS.border}`,
              background: "#4285F410",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#4285F4",
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 700,
                marginBottom: 5,
              }}
            >
              ✨ GEMINI SUGGESTS
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: COLORS.textMid,
                fontFamily: "Inter, sans-serif",
                marginBottom: 8,
                lineHeight: 1.4,
              }}
            >
              {DAYS[suggestion.day]} at {suggestion.hour % 12 || 12}
              {suggestion.hour < 12 ? "am" : "pm"} — {suggestion.reason}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={acceptSuggestion}
                style={{
                  flex: 1,
                  background: "#4285F4",
                  border: "none",
                  borderRadius: 6,
                  padding: "5px",
                  color: "#fff",
                  fontSize: 11,
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Accept
              </button>
              <button
                onClick={() => setSuggestion(null)}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 6,
                  padding: "5px",
                  color: COLORS.textDim,
                  fontSize: 11,
                  fontFamily: "Space Grotesk, sans-serif",
                  cursor: "pointer",
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {sugError && (
          <div
            style={{
              padding: "10px 12px",
              borderTop: `1px solid ${COLORS.border}`,
              fontSize: 11,
              color: COLORS.orange,
              fontFamily: "Inter, sans-serif",
            }}
          >
            ⚠️ {sugError}
          </div>
        )}
      </div>

      {/* Calendar grid */}
      <div style={{ flex: 1, overflowX: "auto", overflowY: "auto" }}>
        <div style={{ minWidth: 680 }}>
          {/* Day headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "52px repeat(7, 1fr)",
              borderBottom: `1px solid ${COLORS.border}`,
              position: "sticky",
              top: 0,
              background: COLORS.bg,
              zIndex: 2,
            }}
          >
            <div />
            {week.map((d, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 6px",
                  textAlign: "center",
                  background: i === todayIdx ? `${COLORS.indigo}12` : "transparent",
                  borderLeft: `1px solid ${COLORS.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: 10.5,
                    color: i === todayIdx ? COLORS.indigo : COLORS.textDim,
                    fontFamily: "Space Grotesk, sans-serif",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                  }}
                >
                  {DAYS[i]}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: i === todayIdx ? COLORS.indigo : COLORS.textMid,
                    fontFamily: "Space Grotesk, sans-serif",
                    lineHeight: 1.2,
                    marginTop: 2,
                  }}
                >
                  {d.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Hour rows */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              style={{
                display: "grid",
                gridTemplateColumns: "52px repeat(7, 1fr)",
                borderBottom: `1px solid ${COLORS.surface}`,
              }}
            >
              <div
                style={{
                  padding: "6px 8px 6px 4px",
                  fontSize: 10,
                  color: COLORS.textGhost,
                  fontFamily: "Inter, sans-serif",
                  textAlign: "right",
                  paddingTop: 9,
                  flexShrink: 0,
                }}
              >
                {hour % 12 || 12}
                {hour < 12 ? "am" : "pm"}
              </div>

              {week.map((_, dayIdx) => {
                const slotTask = getSlotTask(dayIdx, hour);
                return (
                  <div
                    key={dayIdx}
                    style={{
                      minHeight: 48,
                      borderLeft: `1px solid ${COLORS.border}`,
                      background: dayIdx === todayIdx ? `${COLORS.indigo}05` : "transparent",
                      padding: 3,
                      transition: "background 0.12s",
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (!slotTask)
                        e.currentTarget.style.background = `${COLORS.indigo}18`;
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.style.background =
                        dayIdx === todayIdx ? `${COLORS.indigo}05` : "transparent";
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.background =
                        dayIdx === todayIdx ? `${COLORS.indigo}05` : "transparent";
                      if (dragging && !slotTask) {
                        onAssignSlot(dragging.id, dayIdx, hour);
                        setDragging(null);
                      }
                    }}
                  >
                    <SlotCell task={slotTask} onClear={onClearSlot} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
