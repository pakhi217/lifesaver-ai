import { useState, useCallback, useEffect } from "react";
import { loadTasks, saveTasks } from "../utils/storage.js";
import { uid } from "../utils/helpers.js";

export function useTasks() {
  const [tasks, setTasksRaw] = useState(() => loadTasks());

  const setTasks = useCallback((updater) => {
    setTasksRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveTasks(next);
      return next;
    });
  }, []);

  const addTask = useCallback((fields) => {
    const task = {
      id: uid(),
      title: fields.title.trim(),
      category: fields.category || "Work",
      priority: fields.priority || "medium",
      deadline: new Date(fields.deadline).toISOString(),
      notes: (fields.notes || "").trim(),
      done: false,
      calSlot: null,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [task, ...prev]);
    return task;
  }, [setTasks]);

  const updateTask = useCallback((id, patch) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
    );
  }, [setTasks]);

  const toggleTask = useCallback((id) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, done: !t.done, doneAt: !t.done ? new Date().toISOString() : undefined }
          : t
      )
    );
  }, [setTasks]);

  const deleteTask = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, [setTasks]);

  const assignCalSlot = useCallback((taskId, dayIdx, hour) => {
    setTasks((prev) =>
      prev.map((t) => {
        // Clear previous owner of that slot
        if (t.calSlot?.day === dayIdx && t.calSlot?.hour === hour && t.id !== taskId) {
          return { ...t, calSlot: null };
        }
        if (t.id === taskId) {
          return { ...t, calSlot: { day: dayIdx, hour } };
        }
        return t;
      })
    );
  }, [setTasks]);

  const clearCalSlot = useCallback((taskId) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, calSlot: null } : t))
    );
  }, [setTasks]);

  return {
    tasks,
    setTasks,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    assignCalSlot,
    clearCalSlot,
  };
}
