import { useState } from "react";
import { HABIT_EMOJIS, COLORS } from "../utils/constants.js";
import { todayStr, getLast7Days } from "../utils/helpers.js";

const DAYS_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function HabitRow({ habit, onCheckIn, onDelete }) {
  const last7    = getLast7Days();
  const td       = todayStr();
  const doneToday = !!habit.log[td];

  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 13,
        padding: "15px 18px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        {/* Emoji + name */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 160, flex: 1 }}>
          <span style={{ fontSize: 26, lineHeight: 1 }}>{habit.emoji}</span>
          <div>
            <div
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: COLORS.text,
              }}
            >
              {habit.name}
            </div>
            <div
              style={{
                fontSize: 11,
                color: COLORS.textDim,
                fontFamily: "Inter, sans-serif",
              }}
            >
              Started tracking
            </div>
          </div>
        </div>

        {/* Streak */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: 60,
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: habit.streak > 0 ? COLORS.orange : COLORS.textGhost,
              fontFamily: "Space Grotesk, sans-serif",
              lineHeight: 1,
            }}
          >
            {habit.streak}
          </span>
          <span style={{ fontSize: 10.5, color: COLORS.textDim, fontFamily: "Inter, sans-serif" }}>
            🔥 streak
          </span>
        </div>

        {/* 7-day grid */}
        <div style={{ display: "flex", gap: 5, alignItems: "flex-end" }}>
          {last7.map((d, i) => {
            const done = !!habit.log[d];
            const isToday = d === td;
            return (
              <div key={d} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: done ? COLORS.green : COLORS.bg,
                    border: `1px solid ${done ? COLORS.green : isToday ? COLORS.indigo : COLORS.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    transition: "all 0.2s",
                    boxShadow: done ? `0 0 8px ${COLORS.green}40` : "none",
                  }}
                >
                  {done && "✓"}
                </div>
                <span
                  style={{
                    fontSize: 9,
                    color: isToday ? COLORS.indigo : COLORS.textGhost,
                    fontFamily: "Space Grotesk, sans-serif",
                    fontWeight: isToday ? 700 : 400,
                  }}
                >
                  {DAYS_SHORT[new Date(d + "T00:00:00").getDay()]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          <button
            onClick={() => onCheckIn(habit.id)}
            style={{
              background: doneToday ? `${COLORS.green}18` : COLORS.green,
              border: `1px solid ${doneToday ? `${COLORS.green}50` : COLORS.green}`,
              borderRadius: 8,
              padding: "8px 14px",
              color: doneToday ? COLORS.green : "#fff",
              cursor: "pointer",
              fontSize: 12.5,
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {doneToday ? "✓ Done Today" : "Check In"}
          </button>
          <button
            onClick={() => onDelete(habit.id)}
            aria-label={`Delete habit ${habit.name}`}
            style={{
              background: "transparent",
              border: `1px solid ${COLORS.border}`,
              borderRadius: 8,
              padding: "8px 10px",
              color: COLORS.textGhost,
              cursor: "pointer",
              fontSize: 15,
              transition: "all 0.15s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = COLORS.red;
              e.currentTarget.style.color = COLORS.red;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = COLORS.border;
              e.currentTarget.style.color = COLORS.textGhost;
            }}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

export function Habits({ habits, onCheckIn, onAdd, onDelete }) {
  const [name,   setName]   = useState("");
  const [emoji,  setEmoji]  = useState("⭐");
  const [error,  setError]  = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  function submit() {
    if (!name.trim()) { setError("Habit name is required."); return; }
    onAdd(name, emoji);
    setName(""); setEmoji("⭐"); setError(null);
  }

  const td = todayStr();
  const doneCount = habits.filter((h) => h.log[td]).length;
  const topStreak = habits.reduce((mx, h) => Math.max(mx, h.streak), 0);

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
      {/* Stats */}
      {habits.length > 0 && (
        <div style={{ display: "flex", gap: 12 }}>
          {[
            { label: "Habits Tracked", value: habits.length, color: COLORS.indigo, icon: "📋" },
            { label: "Done Today",     value: `${doneCount}/${habits.length}`, color: COLORS.green,  icon: "✅" },
            { label: "Top Streak",     value: `${topStreak}🔥`, color: COLORS.orange, icon: "🏆" },
          ].map(({ label, value, color, icon }) => (
            <div
              key={label}
              style={{
                flex: 1,
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 12,
                padding: "14px 16px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 5 }}>{icon}</div>
              <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: 20, color }}>{value}</div>
              <div style={{ fontSize: 11, color: COLORS.textDim, fontFamily: "Inter, sans-serif", marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add habit form */}
      <div
        style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 14,
          padding: "18px 20px",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: COLORS.textDim,
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 700,
            letterSpacing: "0.08em",
            marginBottom: 14,
          }}
        >
          ADD HABIT
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Emoji picker trigger */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowPicker((v) => !v)}
              title="Choose emoji"
              style={{
                background: COLORS.bg,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                padding: "9px 13px",
                fontSize: 20,
                cursor: "pointer",
                lineHeight: 1,
                transition: "border-color 0.15s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = COLORS.indigo)}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = COLORS.border)}
            >
              {emoji}
            </button>
            {showPicker && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  marginTop: 6,
                  background: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 10,
                  padding: 10,
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: 4,
                  zIndex: 50,
                  boxShadow: "0 8px 30px #00000060",
                }}
              >
                {HABIT_EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => { setEmoji(e); setShowPicker(false); }}
                    style={{
                      background: emoji === e ? `${COLORS.indigo}25` : "transparent",
                      border: `1px solid ${emoji === e ? COLORS.indigo : "transparent"}`,
                      borderRadius: 6,
                      padding: "5px",
                      fontSize: 18,
                      cursor: "pointer",
                      lineHeight: 1,
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>

          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(null); }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="e.g. Morning Review, Read 20 pages…"
            style={{
              flex: 1,
              minWidth: 180,
              background: COLORS.bg,
              border: `1px solid ${error ? COLORS.red : COLORS.border}`,
              borderRadius: 8,
              padding: "9px 12px",
              color: COLORS.text,
              fontSize: 13.5,
              fontFamily: "Inter, sans-serif",
              outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = COLORS.indigo)}
            onBlur={(e) => (e.target.style.borderColor = error ? COLORS.red : COLORS.border)}
          />

          <button
            onClick={submit}
            style={{
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              border: "none",
              borderRadius: 8,
              padding: "9px 20px",
              color: "#fff",
              cursor: "pointer",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              fontSize: 13,
              transition: "opacity 0.15s",
              flexShrink: 0,
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Add
          </button>
        </div>

        {error && (
          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              color: COLORS.red,
              fontFamily: "Inter, sans-serif",
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Habit list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {habits.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: COLORS.textGhost,
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
            }}
          >
            No habits yet. Add one above to start building streaks 🚀
          </div>
        )}
        {habits.map((h) => (
          <HabitRow
            key={h.id}
            habit={h}
            onCheckIn={onCheckIn}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
