import { SEED_TASKS, SEED_HABITS } from "./constants.js";

const SCHEMA_VERSION = 2;
const KEYS = {
  version: "ls_schema_version",
  tasks:   "ls_tasks",
  habits:  "ls_habits",
  apiKey:  "ls_gemini_key",
  alerts:  "ls_dismissed_alerts",
  prefs:   "ls_prefs",
};

// ─── Low-level helpers ────────────────────────────────────────────────────────
function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn("[LifeSaver] localStorage write failed:", e);
    return false;
  }
}

function remove(key) {
  try { localStorage.removeItem(key); } catch {}
}

// ─── Migration ────────────────────────────────────────────────────────────────
function migrate() {
  const version = read(KEYS.version, 0);
  if (version >= SCHEMA_VERSION) return;

  if (version < 1) {
    // v0 → v1: ensure calSlot and createdAt on tasks
    const tasks = read(KEYS.tasks, null);
    if (Array.isArray(tasks)) {
      const migrated = tasks.map((t) => ({
        calSlot: null,
        createdAt: new Date().toISOString(),
        ...t,
      }));
      write(KEYS.tasks, migrated);
    }
  }

  if (version < 2) {
    // v1 → v2: ensure streak recalc field on habits
    const habits = read(KEYS.habits, null);
    if (Array.isArray(habits)) {
      const migrated = habits.map((h) => ({
        log: {},
        streak: 0,
        ...h,
      }));
      write(KEYS.habits, migrated);
    }
  }

  write(KEYS.version, SCHEMA_VERSION);
}

// ─── Public API ───────────────────────────────────────────────────────────────
export function initStorage() {
  migrate();
}

export function loadTasks() {
  return read(KEYS.tasks, SEED_TASKS);
}

export function saveTasks(tasks) {
  write(KEYS.tasks, tasks);
}

export function loadHabits() {
  return read(KEYS.habits, SEED_HABITS);
}

export function saveHabits(habits) {
  write(KEYS.habits, habits);
}

export function loadApiKey() {
  return read(KEYS.apiKey, "");
}

export function saveApiKey(key) {
  write(KEYS.apiKey, key);
}

export function loadPrefs() {
  return read(KEYS.prefs, {
    theme: "dark",
    proactiveAlerts: true,
    alertIntervalMin: 5,
    soundEnabled: false,
  });
}

export function savePrefs(prefs) {
  write(KEYS.prefs, prefs);
}

export function clearAll() {
  Object.values(KEYS).forEach(remove);
}
