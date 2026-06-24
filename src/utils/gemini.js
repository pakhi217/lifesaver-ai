import { GEMINI_MODEL, GEMINI_BASE } from "./constants.js";

// ─── Key management ───────────────────────────────────────────────────────────
let _apiKey = "";

export function setGeminiKey(key) {
  _apiKey = key.trim();
}

export function getGeminiKey() {
  return _apiKey;
}

export function hasKey() {
  return _apiKey.length > 10;
}

function endpoint() {
  return `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${_apiKey}`;
}

function chatEndpoint() {
  return `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${_apiKey}`;
}

// ─── Core request ─────────────────────────────────────────────────────────────
async function geminiRequest(payload) {
  if (!hasKey()) throw new Error("NO_KEY");
  const res = await fetch(endpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

// ─── Single prompt ────────────────────────────────────────────────────────────
export async function callGemini(prompt, systemInstruction = "", temperature = 0.7) {
  return geminiRequest({
    system_instruction: systemInstruction
      ? { parts: [{ text: systemInstruction }] }
      : undefined,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature, maxOutputTokens: 1024 },
  });
}

// ─── Multi-turn chat ──────────────────────────────────────────────────────────
export async function callGeminiChat(messages, systemInstruction = "") {
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  return geminiRequest({
    system_instruction: systemInstruction
      ? { parts: [{ text: systemInstruction }] }
      : undefined,
    contents,
    generationConfig: { temperature: 0.8, maxOutputTokens: 1024 },
  });
}

// ─── Structured JSON output ───────────────────────────────────────────────────
export async function callGeminiJSON(prompt, systemInstruction = "") {
  const raw = await callGemini(prompt, systemInstruction, 0.5);
  const clean = raw.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(clean);
  } catch {
    // Try to extract JSON object/array from surrounding text
    const match = clean.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) return JSON.parse(match[1]);
    throw new Error("Gemini returned invalid JSON");
  }
}

// ─── Proactive alert ─────────────────────────────────────────────────────────
export async function generateProactiveAlert(topTask, fmtDeadlineFn, urgencyScoreFn) {
  const prompt = `You are a proactive AI productivity coach. The user's most urgent pending task is:

Title: "${topTask.title}"
Priority: ${topTask.priority}
Deadline: ${fmtDeadlineFn(topTask.deadline)}
Urgency score: ${Math.round(urgencyScoreFn(topTask))}/100
${topTask.notes ? `Notes: ${topTask.notes}` : ""}

Write ONE urgent, specific, actionable alert in 1-2 sentences. Be direct and commanding. Start with an action verb. No fluff. No greetings.`;

  return callGemini(prompt, "", 0.6);
}

// ─── Action plan ─────────────────────────────────────────────────────────────
export async function generateActionPlan(taskSummary, habitSummary) {
  const prompt = `You are an expert productivity AI powered by Google Gemini (Google AI Studio). Generate a focused, realistic action plan.

PENDING TASKS (sorted by urgency):
${taskSummary || "No pending tasks."}

HABITS:
${habitSummary || "None tracked."}

Respond ONLY with valid JSON — no markdown, no backticks, no preamble:
{
  "headline": "one punchy sentence summing up today's focus",
  "rescueTask": "the single most urgent task title",
  "riskAlert": "what specifically breaks if user doesn't act in the next 2 hours",
  "timeBlocks": [
    {"time": "Now", "duration": "45min", "task": "exact task title", "action": "the very next physical action to take"}
  ],
  "habitNote": "one sentence about current habit momentum and what to protect",
  "battleCry": "one punchy motivational line — real, not corporate"
}`;

  return callGeminiJSON(prompt);
}

// ─── Task breakdown ───────────────────────────────────────────────────────────
export async function generateTaskBreakdown(task) {
  const prompt = `Break down this task into concrete subtasks:

Task: "${task.title}"
Priority: ${task.priority}
Deadline: in ${Math.round(Math.max(0, (new Date(task.deadline) - Date.now()) / 36e5))} hours
${task.notes ? `Notes: ${task.notes}` : ""}

Respond ONLY with valid JSON:
{
  "estimate": "total realistic time estimate (e.g. '2.5 hours')",
  "steps": [
    {"order": 1, "action": "specific physical next step", "duration": "15min"}
  ],
  "tip": "one productivity tip specific to this task type"
}`;

  return callGeminiJSON(prompt);
}

// ─── Smart schedule suggestion ────────────────────────────────────────────────
export async function suggestScheduleSlot(task, existingSlots) {
  const occupied = existingSlots
    .map((s) => `Day ${s.day} at ${s.hour}:00`)
    .join(", ");

  const prompt = `Suggest the best calendar time slot for this task:

Task: "${task.title}"
Priority: ${task.priority}
Estimated duration: 1-2 hours
Deadline: ${new Date(task.deadline).toLocaleString()}
Already occupied slots (Day 0=Sun … 6=Sat): ${occupied || "none"}

Respond ONLY with valid JSON:
{
  "day": 1,
  "hour": 9,
  "reason": "one sentence why this slot is best"
}`;

  return callGeminiJSON(prompt);
}
