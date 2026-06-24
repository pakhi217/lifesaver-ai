import { useState, useEffect } from "react";

// Utils
import { initStorage, loadApiKey } from "./utils/storage.js";
import { setGeminiKey } from "./utils/gemini.js";
import { urgencyScore, scoreColor, pendingTasks, overdueTasks, sortByUrgency } from "./utils/helpers.js";
import { COLORS } from "./utils/constants.js";

// Hooks
import { useTasks }           from "./hooks/useTasks.js";
import { useHabits }          from "./hooks/useHabits.js";
import { useProactiveAlerts } from "./hooks/useProactiveAlerts.js";
import { useTicker }          from "./hooks/useTicker.js";

// Components
import { RescueMode }  from "./components/RescueMode.jsx";

// Pages
import { Dashboard }  from "./pages/Dashboard.jsx";
import { Tasks }      from "./pages/Tasks.jsx";
import { Calendar }   from "./pages/Calendar.jsx";
import { Habits }     from "./pages/Habits.jsx";
import { AICoach }    from "./pages/AICoach.jsx";
import { ActionPlan } from "./pages/ActionPlan.jsx";

// ─── Init ─────────────────────────────────────────────────────────────────────
initStorage();
const savedKey = loadApiKey();
if (savedKey) setGeminiKey(savedKey);

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "tasks",     label: "Tasks",     icon: "📋" },
  { id: "calendar",  label: "Calendar",  icon: "📅" },
  { id: "habits",    label: "Habits",    icon: "🔥" },
  { id: "coach",     label: "AI Coach",  icon: "🤖" },
  { id: "plan",      label: "Plan",      icon: "✨" },
];

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,        setTab]        = useState("dashboard");
  const [rescueTask, setRescueTask] = useState(null);

  // Live ticker so deadline countdowns refresh every minute
  useTicker(60_000);

  // Task & habit state
  const {
    tasks,
    addTask, toggleTask, deleteTask,
    assignCalSlot, clearCalSlot,
  } = useTasks();

  const {
    habits,
    addHabit, checkIn, deleteHabit,
  } = useHabits();

  // Proactive Gemini alerts
  const { alerts, dismissAlert } = useProactiveAlerts(tasks, 5);

  // Derived
  const pending  = pendingTasks(tasks);
  const overdue  = overdueTasks(tasks);
  const topScore = pending.length
    ? Math.max(...pending.map(urgencyScore))
    : 0;

  // Handle API key being set from Dashboard banner
  function handleKeySet(key) {
    setGeminiKey(key);
  }

  return (
    <div
      style={{
        height: "100vh",
        background: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, sans-serif",
        overflow: "hidden",
      }}
    >
      <GlobalStyles />

      {/* Rescue Mode overlay */}
      {rescueTask && (
        <RescueMode
          task={rescueTask}
          onExit={() => setRescueTask(null)}
          onMarkDone={(id) => { toggleTask(id); setRescueTask(null); }}
        />
      )}

      {/* ── Header ── */}
      <header
        style={{
          background: COLORS.surface,
          borderBottom: `1px solid ${COLORS.border}`,
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          height: 56,
          flexShrink: 0,
          gap: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginRight: 28,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              borderRadius: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              boxShadow: "0 3px 10px #6366F145",
              flexShrink: 0,
            }}
          >
            ⚡
          </div>
          <div>
            <div
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 800,
                fontSize: 15,
                color: COLORS.text,
                lineHeight: 1,
              }}
            >
              LifeSaver AI
            </div>
            <div
              style={{
                fontSize: 9.5,
                color: COLORS.textGhost,
                fontFamily: "Inter, sans-serif",
                marginTop: 1,
                letterSpacing: "0.02em",
              }}
            >
              Google Gemini · Google AI Studio
            </div>
          </div>
        </div>

        {/* Nav tabs */}
        <nav
          style={{
            display: "flex",
            height: "100%",
            overflowX: "auto",
            flex: 1,
          }}
        >
          {TABS.map((t) => {
            const active    = tab === t.id;
            const taskCount = t.id === "tasks" ? pending.length : 0;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: `2px solid ${active ? COLORS.indigo : "transparent"}`,
                  padding: "0 14px",
                  height: "100%",
                  color: active ? COLORS.indigoLt : COLORS.textFaint,
                  cursor: "pointer",
                  fontSize: 12.5,
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "color 0.15s, border-color 0.15s",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
                onMouseOver={(e) => {
                  if (!active) e.currentTarget.style.color = COLORS.textMid;
                }}
                onMouseOut={(e) => {
                  if (!active) e.currentTarget.style.color = COLORS.textFaint;
                }}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
                {taskCount > 0 && (
                  <span
                    style={{
                      background: COLORS.indigo,
                      borderRadius: 10,
                      padding: "1px 6px",
                      fontSize: 10,
                      color: "#fff",
                      fontWeight: 700,
                      lineHeight: "16px",
                    }}
                  >
                    {taskCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Status indicators */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexShrink: 0,
            marginLeft: 12,
          }}
        >
          {overdue.length > 0 && (
            <div
              style={{
                background: "#F43F5E15",
                border: "1px solid #F43F5E45",
                borderRadius: 20,
                padding: "4px 11px",
                fontSize: 11,
                color: COLORS.red,
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 700,
                animation: "pulse 2s ease infinite",
                whiteSpace: "nowrap",
              }}
            >
              ⚠️ {overdue.length} overdue
            </div>
          )}

          {pending.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: scoreColor(topScore),
                  boxShadow: `0 0 6px ${scoreColor(topScore)}`,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  color: COLORS.textDim,
                  fontFamily: "Inter, sans-serif",
                  whiteSpace: "nowrap",
                }}
              >
                Urgency:{" "}
                <span
                  style={{
                    color: scoreColor(topScore),
                    fontWeight: 700,
                  }}
                >
                  {Math.round(topScore)}
                </span>
              </span>
            </div>
          )}
        </div>
      </header>

      {/* ── Page content ── */}
      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {tab === "dashboard" && (
          <Dashboard
            tasks={tasks}
            habits={habits}
            alerts={alerts}
            onDismissAlert={dismissAlert}
            onRescue={setRescueTask}
            onKeySet={handleKeySet}
          />
        )}
        {tab === "tasks" && (
          <Tasks
            tasks={tasks}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onAdd={addTask}
            onRescue={setRescueTask}
          />
        )}
        {tab === "calendar" && (
          <Calendar
            tasks={tasks}
            onAssignSlot={assignCalSlot}
            onClearSlot={clearCalSlot}
          />
        )}
        {tab === "habits" && (
          <Habits
            habits={habits}
            onCheckIn={checkIn}
            onAdd={addHabit}
            onDelete={deleteHabit}
          />
        )}
        {tab === "coach" && (
          <AICoach tasks={tasks} habits={habits} />
        )}
        {tab === "plan" && (
          <ActionPlan tasks={tasks} habits={habits} />
        )}
      </main>
    </div>
  );
}

// ─── Global styles injected once ─────────────────────────────────────────────
function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      body { background: #0A0E1A; color: #F1F5F9; }

      ::-webkit-scrollbar        { width: 4px; height: 4px; }
      ::-webkit-scrollbar-track  { background: transparent; }
      ::-webkit-scrollbar-thumb  { background: #1E2235; border-radius: 2px; }
      ::-webkit-scrollbar-thumb:hover { background: #2A3050; }

      @keyframes bounce {
        0%, 80%, 100% { transform: translateY(0); }
        40%            { transform: translateY(-6px); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.45; }
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes slideIn {
        from { transform: translateY(-10px); opacity: 0; }
        to   { transform: translateY(0);     opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(12px); opacity: 0; }
        to   { transform: translateY(0);    opacity: 1; }
      }

      input[type="datetime-local"]::-webkit-calendar-picker-indicator {
        filter: invert(0.6);
        cursor: pointer;
      }
      select option { background: #0F1322; }
    `}</style>
  );
}
