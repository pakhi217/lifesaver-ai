import { useState } from "react";
import { TaskCard } from "../components/TaskCard.jsx";
import { AddTaskModal } from "../components/AddTaskModal.jsx";
import { useVoice } from "../hooks/useVoice.js";
import { urgencyScore, sortByUrgency, hoursUntil } from "../utils/helpers.js";
import { COLORS } from "../utils/constants.js";

const FILTERS = [
  { id: "all",      label: "All" },
  { id: "overdue",  label: "⚠️ Overdue" },
  { id: "critical", label: "🔴 Critical" },
  { id: "high",     label: "🟠 High" },
  { id: "medium",   label: "🟡 Medium" },
  { id: "low",      label: "🟢 Low" },
  { id: "done",     label: "✓ Done" },
];

function applyFilter(tasks, filter) {
  switch (filter) {
    case "done":     return tasks.filter((t) => t.done);
    case "overdue":  return tasks.filter((t) => !t.done && hoursUntil(t.deadline) < 0);
    case "critical":
    case "high":
    case "medium":
    case "low":
      return tasks.filter((t) => !t.done && t.priority === filter);
    default:         return tasks;
  }
}

export function Tasks({ tasks, onToggle, onDelete, onAdd, onRescue }) {
  const [filter,   setFilter]   = useState("all");
  const [showAdd,  setShowAdd]  = useState(false);
  const [prefill,  setPrefill]  = useState("");
  const [selected, setSelected] = useState(null);

  const voice = useVoice({
    onResult: (text) => {
      setPrefill(text);
      setShowAdd(true);
    },
  });

  const filtered = sortByUrgency(applyFilter(tasks, filter));

  function handleSelect(id) {
    setSelected((prev) => (prev === id ? null : id));
  }

  const selectedTask = tasks.find((t) => t.id === selected) ?? null;

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Left: list */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRight: selectedTask ? `1px solid ${COLORS.border}` : "none",
        }}
      >
        {/* Toolbar */}
        <div
          style={{
            padding: "12px 18px",
            borderBottom: `1px solid ${COLORS.border}`,
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Filter chips */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
            {FILTERS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                style={{
                  background: filter === id ? COLORS.indigo : "transparent",
                  border: `1px solid ${filter === id ? COLORS.indigo : COLORS.border}`,
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: 11.5,
                  color: filter === id ? "#fff" : COLORS.textDim,
                  cursor: "pointer",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: 600,
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            {voice.supported && (
              <button
                onClick={voice.toggle}
                title={voice.listening ? "Stop listening" : "Add task by voice"}
                style={{
                  background: voice.listening ? "#F43F5E15" : "transparent",
                  border: `1px solid ${voice.listening ? COLORS.red : COLORS.border}`,
                  borderRadius: 8,
                  padding: "7px 13px",
                  color: voice.listening ? COLORS.red : COLORS.textDim,
                  cursor: "pointer",
                  fontSize: 14,
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: 600,
                  transition: "all 0.15s",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                🎙{voice.listening ? " Listening…" : " Voice"}
              </button>
            )}
            <button
              onClick={() => { setPrefill(""); setShowAdd(true); }}
              style={{
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                border: "none",
                borderRadius: 8,
                padding: "7px 16px",
                color: "#fff",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 700,
                boxShadow: "0 3px 12px #6366F135",
                transition: "opacity 0.15s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = "0.88")}
              onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
            >
              + Add Task
            </button>
          </div>
        </div>

        {voice.error && (
          <div
            style={{
              padding: "8px 18px",
              background: "#F97316" + "18",
              borderBottom: `1px solid ${COLORS.border}`,
              fontSize: 12,
              color: COLORS.orange,
              fontFamily: "Inter, sans-serif",
            }}
          >
            🎙 {voice.error}
          </div>
        )}

        {/* Task list */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {filtered.length === 0 && (
            <div
              style={{
                textAlign: "center",
                color: COLORS.textGhost,
                fontFamily: "Inter, sans-serif",
                fontSize: 14,
                marginTop: 60,
              }}
            >
              {filter === "done" ? "No completed tasks yet." : "No tasks here — add one! 🎉"}
            </div>
          )}
          {filtered.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              selected={t.id === selected}
              onClick={() => handleSelect(t.id)}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>

      {/* Right: detail panel */}
      {selectedTask && (
        <div
          style={{
            width: 280,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            padding: 20,
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: COLORS.textDim,
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            TASK DETAIL
          </div>

          <div>
            <div
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 15,
                fontWeight: 700,
                color: COLORS.text,
                marginBottom: 8,
                lineHeight: 1.3,
              }}
            >
              {selectedTask.title}
            </div>

            {[
              ["Category",   selectedTask.category],
              ["Priority",   selectedTask.priority.charAt(0).toUpperCase() + selectedTask.priority.slice(1)],
              ["Deadline",   new Date(selectedTask.deadline).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })],
              ["Time left",  selectedTask.done ? "Completed" : (() => { const h = hoursUntil(selectedTask.deadline); return h < 0 ? `${Math.abs(Math.round(h))}h overdue` : `${Math.round(h)}h`; })()],
              ["Status",     selectedTask.done ? "✓ Done" : "Pending"],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "7px 0",
                  borderBottom: `1px solid ${COLORS.border}`,
                }}
              >
                <span style={{ fontSize: 12, color: COLORS.textDim, fontFamily: "Inter, sans-serif" }}>{k}</span>
                <span style={{ fontSize: 12, color: COLORS.textMid, fontFamily: "Inter, sans-serif", fontWeight: 500, textAlign: "right", maxWidth: 150 }}>{v}</span>
              </div>
            ))}

            {selectedTask.notes && (
              <div
                style={{
                  marginTop: 12,
                  background: COLORS.surface2,
                  borderRadius: 8,
                  padding: "10px 12px",
                  fontSize: 12.5,
                  color: COLORS.textMid,
                  fontFamily: "Inter, sans-serif",
                  lineHeight: 1.55,
                }}
              >
                📝 {selectedTask.notes}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {!selectedTask.done && (
              <button
                onClick={() => onRescue(selectedTask)}
                style={{
                  background: "linear-gradient(135deg, #F43F5E, #F97316)",
                  border: "none",
                  borderRadius: 9,
                  padding: "10px",
                  color: "#fff",
                  cursor: "pointer",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  boxShadow: "0 3px 14px #F43F5E35",
                }}
              >
                ⚡ Rescue Mode
              </button>
            )}
            <button
              onClick={() => { onToggle(selectedTask.id); setSelected(null); }}
              style={{
                background: selectedTask.done ? COLORS.surface2 : `${COLORS.green}18`,
                border: `1px solid ${selectedTask.done ? COLORS.border : COLORS.green + "50"}`,
                borderRadius: 9,
                padding: "10px",
                color: selectedTask.done ? COLORS.textDim : COLORS.green,
                cursor: "pointer",
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {selectedTask.done ? "↩ Mark Incomplete" : "✓ Mark Done"}
            </button>
            <button
              onClick={() => { onDelete(selectedTask.id); setSelected(null); }}
              style={{
                background: "transparent",
                border: `1px solid ${COLORS.border}`,
                borderRadius: 9,
                padding: "10px",
                color: COLORS.red,
                cursor: "pointer",
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 13,
                fontWeight: 600,
                transition: "background 0.15s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#F43F5E10")}
              onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
            >
              🗑 Delete Task
            </button>
          </div>
        </div>
      )}

      {showAdd && (
        <AddTaskModal
          prefillTitle={prefill}
          onAdd={(fields) => { onAdd(fields); setShowAdd(false); }}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
