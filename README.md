# ⚡ LifeSaver AI — The Last-Minute Life Saver
**An AI-powered productivity companion that proactively helps users plan, prioritize, and complete tasks before deadlines are missed.**

LifeSaver AI combines intelligent task management, habit tracking, scheduling, and AI-powered guidance to help users stay productive and avoid missing important deadlines.



**Powered by Google Gemini (Google AI Studio)**

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
## 🛠 Tech Stack

| Technology            | Purpose          |
|----------------------|------------------|
| React               | Frontend UI      |
| Vite                | Build Tool       |
| JavaScript          | Application Logic|
| Framer Motion       | Animations       |
| Lucide React        | Icons            |
| Gemini 2.0 Flash    | AI Features      |
| Google AI Studio    | AI API           |
| Web Speech API      | Voice Input      |
| Local Storage       | Persistence      |



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

1.Visit Google AI Studio.

2.Create a free API key.

3.Open the application.

4.Paste the API key into the dashboard

## 👨‍💻 Developer
PAKHI SAXENA

## 📖 About

LifeSaver AI was originally built as a submission for the VIBe Coding Hackathon and continues to evolve as an AI-powered productivity companion powered by Google Gemini.
