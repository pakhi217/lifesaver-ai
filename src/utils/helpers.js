import { P_COLOR } from "./constants.js";

export function hoursUntil(deadline) {
  return (new Date(deadline) - Date.now()) / 36e5;
}

export function urgencyScore(task) {
  if (task.done) return 0;
  const h = hoursUntil(task.deadline);
  if (h < 0) return 100;
  const base = Math.max(0, 100 - h * 1.8);
  const pb = { critical: 30, high: 18, medium: 8, low: 0 }[task.priority] ?? 0;
  return Math.min(100, base + pb);
}

export function scoreColor(s) {
  if (s >= 80) return "#F43F5E";
  if (s >= 55) return "#F97316";
  if (s >= 30) return "#FBBF24";
  return "#10B981";
}

export function fmtDeadline(deadline) {
  const h = hoursUntil(deadline);
  if (h < 0) return `${Math.abs(Math.round(h))}h overdue`;
  if (h < 1) return `${Math.round(h * 60)}min left`;
  if (h < 24) return `${Math.round(h)}h left`;
  const d = Math.floor(h / 24);
  const rem = Math.round(h % 24);
  return rem > 0 ? `${d}d ${rem}h left` : `${d}d left`;
}

export function fmtTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function fmtDate(isoString) {
  return new Date(isoString).toLocaleDateString([], { month: "short", day: "numeric" });
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function getWeekDates() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    return x;
  });
}

export function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return d.toISOString().slice(0, 10);
  });
}

export function calcStreak(log) {
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (!log[key]) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function sortByUrgency(tasks) {
  return [...tasks].sort((a, b) => urgencyScore(b) - urgencyScore(a));
}

export function pendingTasks(tasks) {
  return tasks.filter((t) => !t.done);
}

export function overdueTasks(tasks) {
  return tasks.filter((t) => !t.done && hoursUntil(t.deadline) < 0);
}

export function taskSummaryText(tasks) {
  return sortByUrgency(pendingTasks(tasks))
    .map(
      (t) =>
        `• "${t.title}" [${t.priority}] — ${fmtDeadline(t.deadline)}, urgency ${Math.round(urgencyScore(t))}/100${t.notes ? ` | ${t.notes}` : ""}`
    )
    .join("\n");
}

export function habitSummaryText(habits) {
  return habits
    .map(
      (h) =>
        `${h.emoji} ${h.name}: ${h.streak}🔥 streak, today: ${h.log[todayStr()] ? "done ✓" : "not done"}`
    )
    .join("\n");
}

export function renderMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#A5B4FC">$1</strong>')
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^#{1,3}\s(.+)$/gm, '<div style="font-weight:700;color:#F1F5F9;margin:8px 0 4px;font-family:Space Grotesk">$1</div>')
    .replace(/\n- /g, "<br/>• ")
    .replace(/\n• /g, "<br/>• ")
    .replace(/\n\d+\.\s/g, (m) => `<br/>${m.trim()} `)
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

export function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

export function uid() {
  return Date.now() + Math.floor(Math.random() * 10000);
}

export function priorityBorderColor(priority, done) {
  return done ? "#1E2235" : P_COLOR[priority] ?? "#1E2235";
}
