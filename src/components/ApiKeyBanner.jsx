import { useState } from "react";
import { setGeminiKey, hasKey } from "../utils/gemini.js";
import { saveApiKey } from "../utils/storage.js";
import { COLORS } from "../utils/constants.js";

export function ApiKeyBanner({ onKeySet }) {
  const [input, setInput]     = useState("");
  const [visible, setVisible] = useState(true);
  const [error, setError]     = useState(null);
  const [saving, setSaving]   = useState(false);

  if (!visible) return null;

  async function save() {
    const key = input.trim();
    if (key.length < 20) {
      setError("Key looks too short. Paste your full Google AI Studio API key.");
      return;
    }
    setSaving(true);
    setError(null);
    // Quick validation ping
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error?.message || `HTTP ${res.status}`);
      }
      setGeminiKey(key);
      saveApiKey(key);
      onKeySet?.(key);
      setVisible(false);
    } catch (e) {
      setError(`Invalid key: ${e.message}`);
    }
    setSaving(false);
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #4285F415, #34A85315)",
        border: "1px solid #4285F440",
        borderRadius: 12,
        padding: "14px 18px",
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        flexWrap: "wrap",
        animation: "slideIn 0.3s ease",
      }}
    >
      <div style={{ flex: "1 1 300px", minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            color: "#4285F4",
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 700,
            letterSpacing: "0.07em",
            marginBottom: 6,
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: "linear-gradient(135deg, #4285F4, #34A853, #FBBC04, #EA4335)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 900,
              color: "#fff",
            }}
          >
            G
          </span>
          CONNECT GOOGLE AI STUDIO
        </div>
        <p
          style={{
            margin: "0 0 10px",
            fontSize: 12.5,
            color: COLORS.textMid,
            fontFamily: "Inter, sans-serif",
            lineHeight: 1.5,
          }}
        >
          Paste your <strong style={{ color: "#93C5FD" }}>Gemini API key</strong> from{" "}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#4285F4", textDecoration: "none" }}
          >
            aistudio.google.com
          </a>{" "}
          to enable AI Coach, Action Plan, and proactive alerts.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="password"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(null); }}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder="AIza…"
            style={{
              flex: 1,
              background: COLORS.bg,
              border: `1px solid ${error ? COLORS.red : COLORS.border}`,
              borderRadius: 8,
              padding: "8px 12px",
              color: COLORS.text,
              fontSize: 13,
              fontFamily: "Inter, sans-serif",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#4285F4")}
            onBlur={(e) => (e.target.style.borderColor = error ? COLORS.red : COLORS.border)}
          />
          <button
            onClick={save}
            disabled={saving || !input.trim()}
            style={{
              background: saving
                ? COLORS.border
                : "linear-gradient(135deg, #4285F4, #34A853)",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              color: saving ? COLORS.textDim : "#fff",
              cursor: saving || !input.trim() ? "default" : "pointer",
              fontSize: 13,
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              flexShrink: 0,
              transition: "opacity 0.15s",
            }}
          >
            {saving ? "Checking…" : "Connect"}
          </button>
        </div>
        {error && (
          <div
            style={{
              marginTop: 6,
              fontSize: 11.5,
              color: COLORS.red,
              fontFamily: "Inter, sans-serif",
            }}
          >
            {error}
          </div>
        )}
      </div>

      <button
        onClick={() => setVisible(false)}
        aria-label="Dismiss"
        style={{
          background: "transparent",
          border: "none",
          color: COLORS.textFaint,
          cursor: "pointer",
          fontSize: 20,
          lineHeight: 1,
          padding: 0,
          flexShrink: 0,
          alignSelf: "flex-start",
        }}
      >
        ×
      </button>
    </div>
  );
}
