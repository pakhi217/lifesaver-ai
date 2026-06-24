import { useState, useCallback } from "react";
import { loadHabits, saveHabits } from "../utils/storage.js";
import { todayStr, calcStreak, uid } from "../utils/helpers.js";

export function useHabits() {
  const [habits, setHabitsRaw] = useState(() => loadHabits());

  const setHabits = useCallback((updater) => {
    setHabitsRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveHabits(next);
      return next;
    });
  }, []);

  const addHabit = useCallback((name, emoji) => {
    const habit = {
      id: uid(),
      name: name.trim(),
      emoji: emoji || "⭐",
      streak: 0,
      log: {},
      createdAt: new Date().toISOString(),
    };
    setHabits((prev) => [...prev, habit]);
    return habit;
  }, [setHabits]);

  const checkIn = useCallback((id) => {
    const td = todayStr();
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const alreadyDone = !!h.log[td];
        const newLog = { ...h.log, [td]: !alreadyDone };
        return {
          ...h,
          log: newLog,
          streak: calcStreak(newLog),
        };
      })
    );
  }, [setHabits]);

  const deleteHabit = useCallback((id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, [setHabits]);

  const updateHabit = useCallback((id, patch) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...patch } : h))
    );
  }, [setHabits]);

  return { habits, addHabit, checkIn, deleteHabit, updateHabit };
}
