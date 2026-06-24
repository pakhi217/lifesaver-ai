export const GEMINI_MODEL = "gemini-2.0-flash";
export const GEMINI_BASE  = "https://generativelanguage.googleapis.com/v1beta/models";

export const P_COLOR = {
  critical: "#F43F5E",
  high:     "#F97316",
  medium:   "#FBBF24",
  low:      "#10B981",
};

export const P_LABEL = {
  critical: "Critical",
  high:     "High",
  medium:   "Medium",
  low:      "Low",
};

export const CATS = ["Work", "Academic", "Personal", "Health", "Finance", "Other"];

export const DAYS  = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM – 8 PM

export const COLORS = {
  bg:       "#0A0E1A",
  surface:  "#0F1322",
  surface2: "#161B2E",
  border:   "#1E2235",
  border2:  "#2A3050",
  text:     "#F1F5F9",
  textMid:  "#94A3B8",
  textDim:  "#64748B",
  textFaint:"#475569",
  textGhost:"#334155",
  indigo:   "#6366F1",
  indigoLt: "#A5B4FC",
  violet:   "#8B5CF6",
  green:    "#10B981",
  orange:   "#F97316",
  red:      "#F43F5E",
  yellow:   "#FBBF24",
  blue:     "#4285F4",
  gBlue:    "#4285F4",
  gGreen:   "#34A853",
};

export const SEED_TASKS = [
  {
    id: 1,
    title: "Submit ML Assignment",
    category: "Academic",
    priority: "critical",
    deadline: new Date(Date.now() + 2.5 * 36e5).toISOString(),
    done: false,
    notes: "Chapter 4 — gradient descent implementation",
    calSlot: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Pay Electricity Bill",
    category: "Finance",
    priority: "high",
    deadline: new Date(Date.now() + 18 * 36e5).toISOString(),
    done: false,
    notes: "",
    calSlot: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Hackathon Submission",
    category: "Work",
    priority: "critical",
    deadline: new Date(Date.now() + 5 * 36e5).toISOString(),
    done: false,
    notes: "VIBe Coding — PS1 LifeSaver AI",
    calSlot: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    title: "Team Standup Prep",
    category: "Work",
    priority: "medium",
    deadline: new Date(Date.now() + 8 * 36e5).toISOString(),
    done: false,
    notes: "List 3 blockers",
    calSlot: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    title: "Read Research Paper",
    category: "Academic",
    priority: "low",
    deadline: new Date(Date.now() + 72 * 36e5).toISOString(),
    done: false,
    notes: "",
    calSlot: null,
    createdAt: new Date().toISOString(),
  },
];

export const SEED_HABITS = [
  { id: 1, name: "Morning Review",  emoji: "☀️", streak: 4, log: {} },
  { id: 2, name: "Deep Work Block", emoji: "🎯", streak: 2, log: {} },
  { id: 3, name: "Exercise",        emoji: "💪", streak: 7, log: {} },
];

export const HABIT_EMOJIS = ["⭐","💪","📚","🧘","💧","🎯","🌿","🏃","🧠","☀️","🎨","✍️","🎵","🍎","🧩"];
