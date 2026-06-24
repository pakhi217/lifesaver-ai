import { useState, useRef, useCallback, useEffect } from "react";
import { generateProactiveAlert } from "../utils/gemini.js";
import { hasKey } from "../utils/gemini.js";
import { urgencyScore, fmtDeadline, sortByUrgency, pendingTasks } from "../utils/helpers.js";

const MIN_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const MIN_URGENCY_TO_ALERT = 60;
const MAX_ALERTS = 4;

export function useProactiveAlerts(tasks, intervalMinutes = 5) {
  const [alerts, setAlerts]     = useState([]);
  const lastRunRef              = useRef(0);
  const timerRef                = useRef(null);
  const intervalMs              = Math.max(intervalMinutes * 60 * 1000, MIN_INTERVAL_MS);

  const runAlert = useCallback(async () => {
    if (!hasKey()) return;
    const now = Date.now();
    if (now - lastRunRef.current < MIN_INTERVAL_MS) return;

    const topTask = sortByUrgency(pendingTasks(tasks))[0];
    if (!topTask) return;
    const score = urgencyScore(topTask);
    if (score < MIN_URGENCY_TO_ALERT) return;

    lastRunRef.current = now;

    try {
      const text = await generateProactiveAlert(topTask, fmtDeadline, urgencyScore);
      if (!text?.trim()) return;
      setAlerts((prev) => {
        // Deduplicate by rough content match
        const isDupe = prev.some(
          (a) => a.text.slice(0, 40) === text.slice(0, 40)
        );
        if (isDupe) return prev;
        const next = [{ id: Date.now(), text, taskTitle: topTask.title, score }, ...prev];
        return next.slice(0, MAX_ALERTS);
      });
    } catch {
      // Silently swallow — proactive alerts are best-effort
    }
  }, [tasks]);

  const dismissAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const dismissAll = useCallback(() => setAlerts([]), []);

  useEffect(() => {
    // Run once on mount (slightly delayed so UI settles first)
    const boot = setTimeout(runAlert, 3000);
    timerRef.current = setInterval(runAlert, intervalMs);
    return () => {
      clearTimeout(boot);
      clearInterval(timerRef.current);
    };
  }, [runAlert, intervalMs]);

  return { alerts, dismissAlert, dismissAll };
}
