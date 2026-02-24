<p align="center">
  <img src="public/favicon.svg" alt="CogniTrace Logo" width="64" height="64" />
</p>

<h1 align="center">CogniTrace</h1>

<p align="center">
  <strong>Non-Invasive Behavioral Signal Analysis for Early Cognitive Decline Awareness</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Track-Healthcare-2563eb?style=flat-square" alt="Healthcare Track" />
  <img src="https://img.shields.io/badge/Stack-React%2019%20%7C%20Vite%20%7C%20Tailwind-0a1628?style=flat-square" alt="Tech Stack" />
  <img src="https://img.shields.io/badge/Data-100%25%20Local-059669?style=flat-square" alt="Local Data" />
  <img src="https://img.shields.io/badge/License-MIT-d97706?style=flat-square" alt="License" />
</p>

---

## Overview

CogniTrace is a browser-based prototype that captures **speech behavioral signals** — pauses, pacing, and rhythm — to help users monitor cognitive patterns over time. It uses the **Web Speech API** to analyze reading-aloud sessions and presents deviation insights through a clinical-grade dashboard.

> ⚠️ **Disclaimer:** CogniTrace is for personal awareness and educational purposes only. It does not provide medical diagnosis, treatment advice, or clinical assessments. Consult a healthcare professional for any health concerns.

---

## Key Features

### 🎙️ Speech Pause Analyzer
- Read a passage aloud while the app captures speech in real-time
- Detects pauses (>500ms), calculates words-per-minute, pause frequency, and duration
- Live waveform visualization and transcript display during recording
- Live signal telemetry panel showing real-time metrics

### 📊 Cognitive Dashboard
- **CSI Score** — Cognitive Signal Index (0–100) composite gauge, animated with color-coding
- **4 Metric Cards** — WPM, Pause Frequency, Avg Pause Duration, Longest Pause — each with baseline comparison, delta %, Z-score badge, and 7-session sparkline
- **Session History Table** — Sortable, color-coded history of the last 10 sessions
- **Plain-English Insights** — Automatically generated summaries like *"Your speech pauses were 34% longer than your baseline today"*

### 🧠 Deviation Detection Engine
- Personal baseline established from your first sessions
- **Z-score analysis** compares each metric to your baseline
- Flags: `Z > 1.5` → Mild deviation · `Z > 2.5` → Significant deviation
- Trend detection: Stable / Improving / Declining across recent sessions

---

## How It Works

```
┌──────────────┐     ┌──────────────────┐     ┌────────────────────┐
│  Speech Task │────▶│ Analysis Engine   │────▶│ Clinical Dashboard │
│              │     │                  │     │                    │
│ Read passage │     │ • Z-score calc   │     │ • CSI gauge        │
│ aloud into   │     │ • CSI composite  │     │ • Metric cards     │
│ microphone   │     │ • Trend detect   │     │ • Session history  │
│              │     │ • Insight gen    │     │ • Insight callout  │
└──────────────┘     └──────────────────┘     └────────────────────┘
       │                                              │
       └──────── All data in localStorage ────────────┘
```

1. **Start a Session** — Click "New Session" and read a displayed passage aloud
2. **Real-Time Capture** — Web Speech API captures your speech; the live monitor shows WPM, pause frequency, and duration updating in real-time
3. **Analysis** — The engine calculates Z-scores for each metric against your personal baseline and generates a composite CSI score
4. **Dashboard** — View your results with animated charts, trend indicators, and plain-English insights

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 (Vite) |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Speech | Web Speech API (`SpeechRecognition`) |
| Storage | `localStorage` (no backend) |
| Fonts | Inter + Space Mono |

---

## Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **Google Chrome** (recommended — best Web Speech API support)

### Installation

```bash
# Clone the repository
git clone https://github.com/Sarasbari/coginTrace.git
cd coginTrace

# Install dependencies
npm install

# Start development server
npm run dev
```

Open **(https://cogin-trace.vercel.app/)** in Chrome.

### First Run
On first load, CogniTrace generates **5 mock baseline sessions** so the dashboard isn't empty. Start a real session to begin building your personal baseline.

---

## Project Structure

```
src/
├── utils/
│   ├── analysisEngine.js      # Z-score, CSI composite, trend detection, insights
│   ├── storage.js             # localStorage CRUD, baseline management, mock data
│   └── speechCapture.js       # Web Speech API wrapper with pause detection
├── components/
│   ├── App.jsx                # Page state machine with animated transitions
│   ├── Navbar.jsx             # Fixed navbar with frosted glass scroll effect
│   ├── Footer.jsx             # Dark footer with disclaimer + status indicator
│   ├── HomePage.jsx           # Landing page with hero, features, last session
│   ├── SpeechTask.jsx         # Read-aloud task with live waveform + transcript
│   ├── LiveMonitor.jsx        # Collapsible real-time telemetry panel
│   ├── Dashboard.jsx          # CSI gauge + metric grid + history + insights
│   ├── SessionHistory.jsx     # Sortable session table with color-coded cells
│   ├── InsightCallout.jsx     # Plain-English insights + medical disclaimer
│   ├── CSIGauge.jsx           # Animated SVG ring gauge
│   ├── MetricCard.jsx         # Metric display with delta, Z-badge, sparkline
│   └── Sparkline.jsx          # Mini inline chart component
├── index.css                  # Design system (tokens, noise overlay, components)
└── main.jsx                   # Entry point
```

---

## Design Philosophy

- **Clinical & Clean** — White/navy palette with precise typography inspired by medical SaaS
- **SVG Noise Overlay** — Subtle `feTurbulence` texture at 0.04 opacity eliminates flat digital gradients
- **Micro-Interactions** — `scale(1.02)` hover on buttons, `translateY(-2px)` lift on cards, `requestAnimationFrame` number counters
- **Staggered Animations** — Metric cards enter with 0.1s stagger, charts animate with easing curves
- **Monospace Data** — All numeric data rendered in Space Mono for clinical precision
- **Zero Placeholders** — Every metric shows real captured or generated data; no lorem ipsum

---

## Privacy

All data is processed and stored **locally in your browser** using `localStorage`. No data is sent to any server. Your speech recordings are processed in real-time and only the extracted metrics are stored — raw audio is never saved.

---

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full (recommended) |
| Edge | ✅ Full |
| Safari | ⚠️ Partial (limited SpeechRecognition) |
| Firefox | ❌ No SpeechRecognition API |

---

## License

MIT © [Sarasbari](https://github.com/Sarasbari)

---

<p align="center">
  <sub>Built for the <strong>Healthcare Track</strong> — Smart Digital System for Early Cognitive Decline Detection</sub>
</p>
