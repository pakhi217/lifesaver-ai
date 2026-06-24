import { useState, useEffect } from "react";

/**
 * Forces a re-render every `intervalMs` milliseconds so that deadline
 * countdowns and urgency scores stay live without any manual refresh.
 */
export function useTicker(intervalMs = 60_000) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return tick;
}
