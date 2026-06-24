import { useState, useRef, useEffect, useCallback } from "react";
import { callGeminiChat, hasKey } from "../utils/gemini.js";
import { taskSummaryText, habitSummaryText, renderMarkdown } from "../utils/helpers.js";
import { useVoice } from "../hooks/useVoice.js";
import { LoadingDots, GeminiLogo } from "../components/Spinner.jsx";
import { COLORS } from "../utils/constants.js";

const QUICK_PROMPTS = [
  "What's my #1 priority right now?",
  "Plan my next 3 hours",
  "I'm overwhelmed — help me",
  "Break down my most urgent task",
  "How are my habit streaks looking?",
  "What should I do first thing tomorrow?",
];

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        gap: 10,
        alignItems: "flex-end",
      }}
    >
      {!isUser && <GeminiLogo size={28} />}
      <div
        style={{
          maxWidth: "80%",
          background: isUser ? COLORS.indigo : COLORS.surface,
          border: isUser ? "none" : `1px solid ${COLORS.border}`,
          borderRadius: isUser
            ? "16px 16px 4px 16px"
            : "4px 16px 16px 16px",
          padding: "11px 15px",
          fontSize: 13.5,
          color: COLORS.textMid,
          lineHeight: 1.6,
          fontFamily: "Inter, sans-serif",
          wordBreak: "break-word",
          animation: "fadeIn 0.25s ease",
        }}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
      />
    </div>
  );
}

function ErrorMessage({ text }) {
  return (
    <div
      style={{
        background: "#F43F5E10",
        border: `1px solid ${COLORS.red}40`,
        borderRadius: 10,
        padding: "10px 14px",
        fontSize: 13,
        color: "#FCA5A5",
        fontFamily: "Inter, sans-serif",
      }}
    >
      ⚠️ {text}
    </div>
  );
}

const SYSTEM_INSTRUCTION = (taskSummary, habitSummary) => `You are an elite AI productivity coach inside LifeSaver AI, powered by Google Gemini (Google AI Studio). You are proactive, direct, and laser-focused on helping the user actually complete tasks — not just feel better about them.

USER'S PENDING TASKS (sorted by urgency):
${taskSummary || "None — all clear!"}

USER'S HABITS:
${habitSummary || "No habits tracked."}

Coaching rules:
- Be concise (under 200 words), punchy, and actionable.
- Use **bold** for key actions. Use bullet points for steps.
- If tasks are overdue, be direct and urgent — no sugarcoating.
- Suggest specific time estimates and next concrete actions.
- Reference the user's actual task names, deadlines, and habit streaks when relevant.
- If the user says they're overwhelmed, help them pick ONE thing and start.
- Powered by Google Gemini via Google AI Studio.`;

export function AICoach({ tasks, habits }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 I'm your AI Coach, powered by **Google Gemini**. I have full context of your tasks, deadlines, and habits.\n\nAsk me to prioritize your day, break down a task, create a plan, or just tell me you're overwhelmed — I'll get you unstuck.",
    },
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const bottomRef             = useRef(null);
  const inputRef              = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const voice = useVoice({
    onResult: (text) => {
      setInput(text);
      // Auto-send after short delay so user can see what was heard
      setTimeout(() => sendMsg(text), 400);
    },
    onError: (err) => setError(err),
  });

  const systemPrompt = SYSTEM_INSTRUCTION(
    taskSummaryText(tasks),
    habitSummaryText(habits)
  );

  const sendMsg = useCallback(
    async (textOverride) => {
      const text = (textOverride ?? input).trim();
      if (!text || loading) return;

      if (!hasKey()) {
        setError(
          "No Gemini API key connected. Add your Google AI Studio key on the Dashboard."
        );
        return;
      }

      const userMsg = { role: "user", content: text };
      setMessages((m) => [...m, userMsg]);
      setInput("");
      setLoading(true);
      setError(null);

      try {
        const history = [...messages, userMsg];
        const reply = await callGeminiChat(history, systemPrompt);
        setMessages((m) => [...m, { role: "assistant", content: reply }]);
      } catch (e) {
        setError(
          e.message === "NO_KEY"
            ? "Gemini API key missing. Connect it on the Dashboard."
            : `Gemini error: ${e.message}`
        );
      }

      setLoading(false);
    },
    [input, loading, messages, systemPrompt]
  );

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMsg();
    }
  }

  function clearChat() {
    setMessages([
      {
        role: "assistant",
        content: "Chat cleared. What would you like to work on?",
      },
    ]);
    setError(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div
        style={{
          padding: "10px 20px",
          borderBottom: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <GeminiLogo size={24} />
          <div>
            <div
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 13,
                fontWeight: 700,
                color: COLORS.text,
              }}
            >
              AI Coach
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: COLORS.textDim,
                fontFamily: "Inter, sans-serif",
              }}
            >
              Powered by Google Gemini · Google AI Studio
            </div>
          </div>
        </div>
        <button
          onClick={clearChat}
          style={{
            background: "transparent",
            border: `1px solid ${COLORS.border}`,
            borderRadius: 7,
            padding: "5px 12px",
            color: COLORS.textDim,
            cursor: "pointer",
            fontSize: 12,
            fontFamily: "Space Grotesk, sans-serif",
            transition: "all 0.15s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = COLORS.border2;
            e.currentTarget.style.color = COLORS.textMid;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = COLORS.border;
            e.currentTarget.style.color = COLORS.textDim;
          }}
        >
          Clear chat
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 22px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {messages.map((m, i) => (
          <Message key={i} msg={m} />
        ))}

        {loading && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <GeminiLogo size={28} />
            <div
              style={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "4px 16px 16px 16px",
                padding: "13px 16px",
              }}
            >
              <LoadingDots color={COLORS.gBlue} />
            </div>
          </div>
        )}

        {error && <ErrorMessage text={error} />}

        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div
        style={{
          padding: "8px 20px",
          display: "flex",
          gap: 7,
          flexWrap: "wrap",
          borderTop: `1px solid ${COLORS.border}`,
        }}
      >
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => sendMsg(p)}
            disabled={loading}
            style={{
              background: "transparent",
              border: `1px solid ${COLORS.border}`,
              borderRadius: 20,
              padding: "5px 12px",
              fontSize: 11.5,
              color: COLORS.textDim,
              cursor: loading ? "default" : "pointer",
              fontFamily: "Inter, sans-serif",
              transition: "all 0.15s",
              opacity: loading ? 0.5 : 1,
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.borderColor = "#4285F4";
                e.currentTarget.style.color = "#93C5FD";
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = COLORS.border;
              e.currentTarget.style.color = COLORS.textDim;
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div
        style={{
          padding: "10px 20px 16px",
          display: "flex",
          gap: 10,
          alignItems: "flex-end",
        }}
      >
        {/* Voice button */}
        <button
          onClick={voice.toggle}
          disabled={!voice.supported}
          title={
            !voice.supported
              ? "Voice not supported"
              : voice.listening
              ? "Stop listening"
              : "Voice input"
          }
          style={{
            background: voice.listening ? "#F43F5E18" : "transparent",
            border: `1px solid ${voice.listening ? COLORS.red : COLORS.border}`,
            borderRadius: 10,
            padding: "10px 13px",
            color: voice.listening ? COLORS.red : COLORS.textDim,
            cursor: voice.supported ? "pointer" : "not-allowed",
            fontSize: 18,
            flexShrink: 0,
            transition: "all 0.15s",
            opacity: voice.supported ? 1 : 0.35,
            animation: voice.listening ? "pulse 1.5s ease infinite" : "none",
          }}
        >
          🎙
        </button>

        {/* Text input */}
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            voice.listening
              ? "Listening… speak your question"
              : "Ask Gemini anything about your tasks…"
          }
          rows={1}
          style={{
            flex: 1,
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 10,
            padding: "10px 14px",
            color: COLORS.text,
            fontSize: 13.5,
            fontFamily: "Inter, sans-serif",
            outline: "none",
            resize: "none",
            lineHeight: 1.5,
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#4285F4")}
          onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
        />

        {/* Send */}
        <button
          onClick={() => sendMsg()}
          disabled={loading || !input.trim()}
          style={{
            background:
              input.trim() && !loading
                ? "linear-gradient(135deg, #4285F4, #34A853)"
                : COLORS.border,
            border: "none",
            borderRadius: 10,
            padding: "10px 16px",
            color: input.trim() && !loading ? "#fff" : COLORS.textDim,
            cursor: input.trim() && !loading ? "pointer" : "default",
            fontSize: 18,
            flexShrink: 0,
            transition: "all 0.2s",
            boxShadow:
              input.trim() && !loading
                ? "0 3px 12px #4285F440"
                : "none",
          }}
        >
          ↑
        </button>
      </div>

      {voice.listening && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#F43F5E",
            borderRadius: 20,
            padding: "6px 16px",
            fontSize: 12,
            color: "#fff",
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 700,
            animation: "pulse 1.5s ease infinite",
            pointerEvents: "none",
          }}
        >
          🎙 Listening…
        </div>
      )}
    </div>
  );
}
