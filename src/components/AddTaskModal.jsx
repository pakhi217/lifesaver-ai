import { useState, useEffect, useRef } from "react";
import { useVoice } from "../hooks/useVoice.js";
import { CATS, COLORS, P_COLOR, P_LABEL } from "../utils/constants.js";

const EMPTY = {
  title:    "",
  category: "Work",
  priority: "medium",
  deadline: "",
  notes:    "",
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 15 }}>
      <label
        style={{
          display: "block",
          fontSize: 11,
          color: COLORS.textDim,
          fontFamily: "Space Grotesk, sans-serif",
          fontWeight: 700,
          letterSpacing: "0.06em",
          marginBottom: 5,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  background: COLORS.bg,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  padding: "9px 12px",
  color: COLORS.text,
  fontSize: 13.5,
  fontFamily: "Inter, sans-serif",
  outline: "none",
  boxSizing: "border-box",
  colorScheme: "dark",
  transition: "border-color 0.15s",
};

export function AddTaskModal({ onAdd, onClose, prefillTitle = "" }) {
  const [form, setForm]     = useState({ ...EMPTY, title: prefillTitle });
  const [errors, setErrors] = useState({});
  const titleRef            = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const voice = useVoice({
    onResult: (text) => setForm((f) => ({ ...f, title: text })),
  });

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: null }));
  }

  function validate() {
    const e = {};
    if (!form.title.trim())    e.title    = "Title is required";
    if (!form.deadline)        e.deadline = "Deadline is required";
    else if (new Date(form.deadline) < new Date()) e.deadline = "Deadline must be in the future";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit() {
    if (!validate()) return;
    onAdd(form);
  }

  const minDt = new Date(Date.now() + 60000).toISOString().slice(0, 16);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Add new task"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "#00000085",
        zIndex: 900,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(5px)",
        padding: 16,
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 16,
          padding: 28,
          width: 440,
          maxWidth: "100%",
          boxShadow: "0 24px 80px #00000090",
          animation: "slideUp 0.25s ease",
        }}
      >
        <div
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: 17,
            fontWeight: 800,
            color: COLORS.text,
            marginBottom: 22,
          }}
        >
          Add New Task
        </div>

        {/* Title + voice */}
        <Field label="Task Title *">
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <input
                ref={titleRef}
                type="text"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="What needs to be done?"
                style={{
                  ...inputStyle,
                  borderColor: errors.title ? COLORS.red : COLORS.border,
                }}
                onFocus={(e) => (e.target.style.borderColor = COLORS.indigo)}
                onBlur={(e) =>
                  (e.target.style.borderColor = errors.title
                    ? COLORS.red
                    : COLORS.border)
                }
              />
              {errors.title && (
                <div style={{ fontSize: 11, color: COLORS.red, marginTop: 3, fontFamily: "Inter, sans-serif" }}>
                  {errors.title}
                </div>
              )}
            </div>
            <button
              onClick={voice.toggle}
              title={
                !voice.supported
                  ? "Voice not supported in this browser"
                  : voice.listening
                  ? "Stop listening"
                  : "Voice input"
              }
              disabled={!voice.supported}
              style={{
                background: voice.listening ? "#F43F5E20" : "transparent",
                border: `1px solid ${voice.listening ? COLORS.red : COLORS.border}`,
                borderRadius: 8,
                padding: "0 13px",
                color: voice.listening ? COLORS.red : COLORS.textDim,
                cursor: voice.supported ? "pointer" : "not-allowed",
                fontSize: 17,
                flexShrink: 0,
                transition: "all 0.15s",
                opacity: voice.supported ? 1 : 0.4,
              }}
            >
              🎙
            </button>
          </div>
          {voice.listening && (
            <div
              style={{
                fontSize: 11.5,
                color: COLORS.red,
                fontFamily: "Inter, sans-serif",
                marginTop: 4,
                animation: "pulse 1.5s ease infinite",
              }}
            >
              Listening… speak your task
            </div>
          )}
          {voice.error && (
            <div style={{ fontSize: 11, color: COLORS.orange, fontFamily: "Inter, sans-serif", marginTop: 3 }}>
              {voice.error}
            </div>
          )}
        </Field>

        {/* Deadline */}
        <Field label="Deadline *">
          <input
            type="datetime-local"
            value={form.deadline}
            min={minDt}
            onChange={(e) => set("deadline", e.target.value)}
            style={{
              ...inputStyle,
              borderColor: errors.deadline ? COLORS.red : COLORS.border,
            }}
            onFocus={(e) => (e.target.style.borderColor = COLORS.indigo)}
            onBlur={(e) =>
              (e.target.style.borderColor = errors.deadline
                ? COLORS.red
                : COLORS.border)
            }
          />
          {errors.deadline && (
            <div style={{ fontSize: 11, color: COLORS.red, marginTop: 3, fontFamily: "Inter, sans-serif" }}>
              {errors.deadline}
            </div>
          )}
        </Field>

        {/* Category + Priority row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 15 }}>
          <Field label="Category">
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              style={{ ...inputStyle }}
              onFocus={(e) => (e.target.style.borderColor = COLORS.indigo)}
              onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
            >
              {CATS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Priority">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
              {Object.keys(P_COLOR).map((p) => (
                <button
                  key={p}
                  onClick={() => set("priority", p)}
                  style={{
                    background: form.priority === p ? `${P_COLOR[p]}22` : "transparent",
                    border: `1px solid ${form.priority === p ? P_COLOR[p] : COLORS.border}`,
                    borderRadius: 7,
                    padding: "6px 4px",
                    color: form.priority === p ? P_COLOR[p] : COLORS.textDim,
                    cursor: "pointer",
                    fontSize: 11.5,
                    fontFamily: "Space Grotesk, sans-serif",
                    fontWeight: 600,
                    transition: "all 0.12s",
                  }}
                >
                  {P_LABEL[p]}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {/* Notes */}
        <Field label="Notes">
          <input
            type="text"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Any additional context…"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = COLORS.indigo)}
            onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
          />
        </Field>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: "transparent",
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              padding: 11,
              color: COLORS.textDim,
              cursor: "pointer",
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: 14,
              fontWeight: 600,
              transition: "border-color 0.15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = COLORS.border2)}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = COLORS.border)}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            style={{
              flex: 2,
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              border: "none",
              borderRadius: 10,
              padding: 11,
              color: "#fff",
              cursor: "pointer",
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: 14,
              fontWeight: 700,
              boxShadow: "0 4px 14px #6366F140",
              transition: "opacity 0.15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
}
