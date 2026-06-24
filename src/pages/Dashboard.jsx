import { COLORS } from "../utils/constants.js";
import { urgencyScore, scoreColor, fmtDeadline, hoursUntil, pendingTasks, overdueTasks, sortByUrgency, todayStr } from "../utils/helpers.js";
import { UrgencyRing } from "../components/UrgencyRing.jsx";
import { ProactiveAlert } from "../components/ProactiveAlert.jsx";
import { ApiKeyBanner } from "../components/ApiKeyBanner.jsx";
import { hasKey } from "../utils/gemini.js";

function StatCard({ icon, value, label, color }) {
  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: "16px 14px",
        textAlign: "center",
        flex: 1,
        minWidth: 80,
      }}
    >
      <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
      <div
        style={{
          fontFamily: "Space Grotesk, sans-serif",
          fontWeight: 800,
          fontSize: 24,
          color,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 10.5,
          color: COLORS.textDim,
          fontFamily: "Inter, sans-serif",
          marginTop: 4,
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function Dashboard({
  tasks,
  habits,
  alerts,
  onDismissAlert,
  onRescue,
  onKeySet,
}) {
  const pending     = pendingTasks(tasks);
  const overdue     = overdueTasks(tasks);
  const done        = tasks.filter((t) => t.done);
  const critical    = pending.filter((t) => urgencyScore(t) >= 75);
  const topTask     = sortByUrgency(pending)[0] ?? null;
  const todayHabits = habits.filter((h) => h.log[todayStr()]).length;
  const pct         = tasks.length > 0 ? Math.round((done.length / tasks.length) * 100) : 0;

  const upcoming = [...pending]
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  return (
    <div
      style={{
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        overflowY: "auto",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* API key banner */}
      {!hasKey() && <ApiKeyBanner onKeySet={onKeySet} />}

      {/* Proactive alerts */}
      {alerts.map((a) => (
        <ProactiveAlert
          key={a.id}
          alert={a}
          onDismiss={() => onDismissAlert(a.id)}
        />
      ))}

      {/* Stats row */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatCard icon="📋" value={pending.length} label="Pending"   color={COLORS.indigo} />
        <StatCard icon="⚠️" value={overdue.length} label="Overdue"   color={COLORS.red}    />
        <StatCard icon="🔴" value={critical.length} label="Critical" color={COLORS.orange}  />
        <StatCard icon="✅" value={done.length}     label="Done"      color={COLORS.green}   />
        <StatCard
          icon="🔥"
          value={`${todayHabits}/${habits.length}`}
          label="Habits Today"
          color={COLORS.violet}
        />
      </div>

      {/* Top priority + upcoming */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)",
          gap: 20,
        }}
      >
        {/* Top priority */}
        <div
          style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 14,
            padding: 20,
            display: "flex",
            flexDirection: "column",
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
            TOP PRIORITY RIGHT NOW
          </div>

          {topTask ? (
            <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
              <UrgencyRing score={urgencyScore(topTask)} size={92} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    margin: "0 0 6px",
                    fontFamily: "Space Grotesk, sans-serif",
                    fontSize: 15,
                    fontWeight: 700,
                    color: COLORS.text,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={topTask.title}
                >
                  {topTask.title}
                </h3>
                <div
                  style={{
                    fontSize: 12,
                    color:
                      hoursUntil(topTask.deadline) < 0
                        ? COLORS.red
                        : COLORS.textMid,
                    fontFamily: "Inter, sans-serif",
                    marginBottom: 12,
                    fontWeight: hoursUntil(topTask.deadline) < 0 ? 700 : 400,
                  }}
                >
                  {fmtDeadline(topTask.deadline)}
                </div>
                <button
                  onClick={() => onRescue(topTask)}
                  style={{
                    background: "linear-gradient(135deg, #F43F5E, #F97316)",
                    border: "none",
                    borderRadius: 8,
                    padding: "7px 16px",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 12,
                    fontFamily: "Space Grotesk, sans-serif",
                    fontWeight: 700,
                    boxShadow: "0 3px 12px #F43F5E40",
                    transition: "opacity 0.15s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  ⚡ Rescue Mode
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                color: COLORS.textDim,
                fontFamily: "Inter, sans-serif",
                fontSize: 14,
                padding: "20px 0",
              }}
            >
              🎉 No pending tasks!
            </div>
          )}
        </div>

        {/* Upcoming deadlines */}
        <div
          style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 14,
            padding: 20,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: COLORS.textDim,
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              letterSpacing: "0.08em",
              marginBottom: 16,
            }}
          >
            UPCOMING DEADLINES
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {upcoming.length === 0 && (
              <p
                style={{
                  color: COLORS.textGhost,
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13,
                  margin: 0,
                }}
              >
                All clear!
              </p>
            )}
            {upcoming.map((t) => {
              const h = hoursUntil(t.deadline);
              return (
                <div
                  key={t.id}
                  style={{ display: "flex", gap: 10, alignItems: "center" }}
                >
                  <div
                    style={{
                      width: 3,
                      height: 34,
                      background: scoreColor(urgencyScore(t)),
                      borderRadius: 2,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: COLORS.textMid,
                        fontFamily: "Space Grotesk, sans-serif",
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
                        fontSize: 11,
                        color: h < 3 ? COLORS.red : COLORS.textDim,
                        fontFamily: "Inter, sans-serif",
                        fontWeight: h < 3 ? 700 : 400,
                      }}
                    >
                      {fmtDeadline(t.deadline)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div
          style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 14,
            padding: "18px 22px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: COLORS.textMid,
              }}
            >
              Overall Progress
            </span>
            <span
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 13,
                fontWeight: 700,
                color: COLORS.green,
              }}
            >
              {pct}%
            </span>
          </div>
          <div
            style={{
              background: COLORS.border,
              borderRadius: 999,
              height: 8,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                background: "linear-gradient(90deg, #6366F1, #10B981)",
                borderRadius: 999,
                transition: "width 0.7s ease",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 6,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: COLORS.textGhost,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {done.length} completed
            </span>
            <span
              style={{
                fontSize: 11,
                color: COLORS.textGhost,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {pending.length} remaining
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
