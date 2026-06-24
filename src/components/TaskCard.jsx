import { urgencyScore, scoreColor, fmtDeadline, hoursUntil } from "../utils/helpers.js";
import { P_COLOR, P_LABEL, COLORS } from "../utils/constants.js";

export function TaskCard({
  task,
  selected = false,
  onClick,
  onToggle,
  onDelete,
  compact = false,
}) {
  const score   = urgencyScore(task);
  const overdue = !task.done && hoursUntil(task.deadline) < 0;
  const urgent  = !task.done && hoursUntil(task.deadline) < 3 && !overdue;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      aria-selected={selected}
      style={{
        background: selected ? COLORS.surface2 : COLORS.surface,
        border: `1px solid ${
          selected
            ? COLORS.indigo
            : overdue
            ? "#F43F5E33"
            : COLORS.border
        }`,
        borderLeft: `3px solid ${task.done ? COLORS.border : P_COLOR[task.priority]}`,
        borderRadius: 10,
        padding: compact ? "10px 12px" : "12px 16px",
        cursor: onClick ? "pointer" : "default",
        opacity: task.done ? 0.45 : 1,
        boxShadow: selected ? `0 0 0 1px ${COLORS.indigo}20` : "none",
        transition: "background 0.15s, border-color 0.15s, box-shadow 0.15s",
        outline: "none",
        userSelect: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={task.done}
          onChange={(e) => {
            e.stopPropagation();
            onToggle?.(task.id);
          }}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Mark "${task.title}" as ${task.done ? "incomplete" : "complete"}`}
          style={{
            marginTop: 3,
            width: 16,
            height: 16,
            accentColor: COLORS.indigo,
            flexShrink: 0,
            cursor: "pointer",
          }}
        />

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: compact ? 13 : 13.5,
              color: task.done ? COLORS.textFaint : COLORS.text,
              fontFamily: "Space Grotesk, sans-serif",
              textDecoration: task.done ? "line-through" : "none",
              marginBottom: 4,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={task.title}
          >
            {task.title}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: 10.5,
                color: COLORS.textDim,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {task.category}
            </span>

            <span
              style={{
                fontSize: 10.5,
                color: P_COLOR[task.priority],
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 600,
              }}
            >
              {P_LABEL[task.priority]}
            </span>

            <span
              style={{
                fontSize: 10.5,
                fontFamily: "Inter, sans-serif",
                fontWeight: overdue ? 700 : 400,
                color: overdue
                  ? COLORS.red
                  : urgent
                  ? COLORS.orange
                  : COLORS.textDim,
              }}
            >
              {fmtDeadline(task.deadline)}
            </span>

            {task.notes && !compact && (
              <span
                style={{
                  fontSize: 10.5,
                  color: COLORS.textGhost,
                  fontFamily: "Inter, sans-serif",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 140,
                }}
                title={task.notes}
              >
                📝 {task.notes}
              </span>
            )}
          </div>
        </div>

        {/* Score badge */}
        {!task.done && (
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: scoreColor(score),
              background: `${scoreColor(score)}18`,
              borderRadius: 6,
              padding: "2px 8px",
              fontFamily: "Space Grotesk, sans-serif",
              flexShrink: 0,
              alignSelf: "flex-start",
              marginTop: 1,
            }}
          >
            {Math.round(score)}
          </div>
        )}

        {/* Delete */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            aria-label={`Delete "${task.title}"`}
            style={{
              background: "transparent",
              border: "none",
              color: COLORS.textGhost,
              cursor: "pointer",
              fontSize: 17,
              lineHeight: 1,
              padding: "0 2px",
              flexShrink: 0,
              alignSelf: "flex-start",
              transition: "color 0.15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = COLORS.red)}
            onMouseOut={(e) => (e.currentTarget.style.color = COLORS.textGhost)}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
