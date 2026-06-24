# ⚡ LifeSaver AI — The Last-Minute Life Saver
**VIBe Coding Hackathon · Problem Statement 1**

> An AI-powered productivity companion that proactively helps you plan, prioritize, and complete tasks before deadlines are missed.

**Powered by Google Gemini (Google AI Studio)**

---

## 🚀 Quick Start (Demo)

Open `LifeSaverAI-demo.jsx` directly as a React artifact in Claude.ai — no build step needed.

To activate AI features:
1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Create a free API key
3. Paste it in the banner on the **Dashboard** tab

---

## 🏗 Full Project Setup (Vite)

```bash
npm create vite@latest lifesaver-ai -- --template react
cd lifesaver-ai
npm install
# Copy all files from this folder into src/
npm run dev
```

---

## 📁 File Structure

```
lifesaver-ai/
├── index.html
├── main.jsx                    # Entry point
├── App.jsx                     # Root: state, routing, layout
│
├── utils/
│   ├── constants.js            # Colors, seeds, config
│   ├── helpers.js              # Pure functions (urgency, time, markdown)
│   ├── gemini.js               # All Gemini API calls
│   └── storage.js              # localStorage with schema versioning
│
├── hooks/
│   ├── useTasks.js             # Task CRUD + persistence
│   ├── useHabits.js            # Habit state + streak logic
│   ├── useVoice.js             # Web Speech API with error handling
│   ├── useProactiveAlerts.js   # Auto Gemini alerts every 5 min
│   └── useTicker.js            # 60s re-render for live countdowns
│
├── components/
│   ├── UrgencyRing.jsx         # Animated SVG urgency score ring
│   ├── TaskCard.jsx            # Reusable task card
│   ├── ProactiveAlert.jsx      # Dismissable alert banner
│   ├── RescueMode.jsx          # Full-screen focus overlay
│   ├── AddTaskModal.jsx        # Add task form + voice input
│   ├── ApiKeyBanner.jsx        # Gemini key connection UI
│   └── Spinner.jsx             # LoadingDots, Spinner, GeminiLogo, EmptyState
│
├── pages/
│   ├── Dashboard.jsx           # Stats, top priority, upcoming, progress
│   ├── Tasks.jsx               # Full task list with filters + detail panel
│   ├── Calendar.jsx            # Drag-and-drop weekly calendar
│   ├── Habits.jsx              # Streak tracker with 7-day grid
│   ├── AICoach.jsx             # Multi-turn Gemini chat
│   └── ActionPlan.jsx          # One-click Gemini action plan
│
└── LifeSaverAI-demo.jsx        # ✅ Self-contained single-file demo
```

---

## ✨ Features

| Feature | Status |
|---|---|
| Intelligent urgency scoring (0–100) | ✅ |
| Real-time deadline countdowns | ✅ |
| AI-powered proactive alerts (auto, every 5 min) | ✅ Gemini |
| AI Chat Coach (multi-turn, context-aware) | ✅ Gemini |
| AI Action Plan (schedule + risk + battle cry) | ✅ Gemini |
| AI Task Breakdown (steps + estimate + tip) | ✅ Gemini |
| AI Calendar Slot Suggestion | ✅ Gemini |
| Rescue Mode (full-screen focus + breakdown) | ✅ |
| Voice input (tasks + chat) | ✅ Web Speech API |
| Weekly drag-and-drop calendar | ✅ |
| Habit tracker with streak rings | ✅ |
| localStorage persistence + schema migration | ✅ |
| API key validation on connect | ✅ |
| Keyboard accessibility (Escape, Enter, tab) | ✅ |
| Responsive dark UI (Space Grotesk + Inter) | ✅ |

---

## 🤖 Gemini API Usage

All AI calls go through `utils/gemini.js` using the `gemini-2.0-flash` model via:

```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
```

This is the **Google AI Studio** API endpoint as required by the problem statement.

---

## 🏆 Judging Alignment

| Evaluation Criterion | How It's Met |
|---|---|
| Google AI Studio as core tool | Gemini 2.0 Flash via AI Studio API throughout |
| Intelligent task prioritization | Live urgency score = deadline + priority formula |
| AI-powered scheduling | Gemini suggests calendar slots; drag-and-drop UI |
| Proactive AI (not reactive reminders) | Auto-alerts fire unprompted every 5 minutes |
| Personalized recommendations | Gemini reads full task + habit context per call |
| Calendar integration | Weekly grid with drag-and-drop scheduling |
| Goal and habit tracking | 7-day grid, streaks, daily check-in |
| Voice-enabled assistance | Web Speech API on tasks + AI coach |
| Autonomous planning | Action Plan tab generates full day schedule |
| Rescue Mode | Signature feature — full-screen AI-powered focus |
