# SentiNex AI

**Unified Social Intelligence & Influence Analytics Platform**
Built for SIH 2026.

SentiNex AI is a fully functional, multi-page analytics dashboard frontend for
analyzing social media data with AI/ML/NLP — sentiment & emotion, audience
demographics, trending topics, influencer networks, and cross-platform
narrative spread.

This repository contains **only the frontend**, built with realistic mock
data and architected so a Python FastAPI + AI/ML backend can be plugged in
later with minimal changes.

---

## 1. Features

- **10 fully built pages**: Overview, Sentiment Intelligence, Audience
  Intelligence, Trend Intelligence, Network & Influence, Timeline Explorer,
  AI Analyst, Data Sources, Alerts, Settings.
- Dark, glassy, "intelligence platform" visual style (electric cyan / purple /
  green accents on a near-black background).
- Interactive charts (Recharts): sentiment timelines, emotion bars, platform
  donuts, trend velocity lines.
- Interactive D3.js force-directed **network graph** for influencer mapping
  (drag, zoom, click-to-inspect).
- Global filters (platform, date range) shared across the whole app via
  React Context.
- AI Analyst chat interface with canned, data-grounded mock responses and a
  "Generate Intelligence Brief" report.
- Reusable Loading / Error / Empty states on every data-driven page.
- Fully responsive: desktop, laptop, tablet, and mobile (collapsible sidebar).
- Clean component architecture, plain JavaScript (no TypeScript), simple
  `useState` / `useEffect` / `useMemo` hooks only.

## 2. Tech Stack

- React 19 + Vite
- JavaScript (no TypeScript)
- Tailwind CSS 3
- React Router v6
- Recharts (charts)
- D3.js (network graph)
- Lucide React (icons)

No Next.js, no Angular, no Material UI/Bootstrap, no heavy state-management
libraries — kept beginner-friendly on purpose.

## 3. Folder Structure

```
sentinex-ai/
├── src/
│   ├── components/
│   │   ├── layout/        Sidebar.jsx, Navbar.jsx, Layout.jsx
│   │   ├── cards/         KPICard, TrendCard, AlertCard, IntelligenceCard
│   │   ├── charts/        SentimentChart, EmotionChart, TrendChart,
│   │   │                  AudienceChart, PlatformChart
│   │   ├── network/       NetworkGraph.jsx (D3 force graph)
│   │   └── common/        Badge, Button, Modal, Loading, ErrorMessage, EmptyState
│   ├── pages/              Dashboard, Sentiment, Audience, Trends, Network,
│   │                       Timeline, AIAnalyst, DataSources, Alerts, Settings
│   ├── data/
│   │   └── mockData.js     ALL mock data lives here
│   ├── services/
│   │   └── api.js          Every backend call goes through this file
│   ├── hooks/
│   │   └── useAnalytics.js Generic loading/error/data hook
│   ├── context/
│   │   └── FiltersContext.jsx  Global platform/date-range filter state
│   ├── App.jsx              Routes
│   ├── main.jsx             React entry point
│   └── index.css            Design tokens / Tailwind base styles
├── tailwind.config.js
├── vite.config.js
└── package.json
```

## 4. Installation

```bash
cd sentinex-ai
npm install
```

## 5. How to Run

```bash
npm run dev       # start local dev server (usually http://localhost:5173)
npm run build     # production build -> dist/
npm run preview   # preview the production build locally
```

## 6. How Mock Data Works

All fake/sample data lives in **`src/data/mockData.js`** — nothing is
scattered across components. Every export in that file corresponds to one
section of the app (KPIs, sentiment timeline, trend leaderboard, network
nodes/links, alerts, etc).

Pages never import `mockData.js` directly. Instead, they call functions from
**`src/services/api.js`** (e.g. `getDashboardData()`), which currently
resolve mock data after a short artificial delay (to simulate a real network
request and let you see the Loading state).

## 7. How to Connect the FastAPI Backend

Open `src/services/api.js`. Every exported function already has:

1. A comment block documenting the exact endpoint and expected JSON shape.
2. A commented-out `fetch()` call using `BASE_URL` (defaults to
   `http://localhost:8000/api`).
3. A `mockRequest(...)` line returning the current mock data.

To connect your backend, for each function:

```js
// BEFORE (mock)
export async function getDashboardData() {
  return mockRequest({ kpis: kpiData, ... });
}

// AFTER (real backend)
export async function getDashboardData() {
  const res = await fetch(`${BASE_URL}/dashboard`);
  if (!res.ok) throw new Error("Failed to fetch dashboard data");
  return res.json();
}
```

No component needs to change — they only ever call these functions through
the `useAnalytics` hook and read `data`, `loading`, `error`.

## 8. API Endpoint Documentation

| Endpoint | Method | Used by | Returns |
|---|---|---|---|
| `/api/dashboard` | GET | Overview | `{ kpis, sentimentTimeline, trendingTopics, platformDistribution, emotionDistribution, latestIntelligence }` |
| `/api/sentiment` | GET | Sentiment Intelligence | `{ summary, timeline, emotions, byTopic, shiftAlert }` |
| `/api/audience` | GET | Audience Intelligence | `{ ageDistribution, locationDistribution, languageDistribution, interestDistribution, activeHours }` |
| `/api/trends` | GET | Trend Intelligence | `{ stats, leaderboard, velocitySeries, details }` |
| `/api/network` | GET | Network & Influence | `{ nodes, links, leaderboard }` |
| `/api/timeline` | GET | Timeline Explorer | `{ events }` |
| `/api/alerts` | GET | Alerts | `{ alerts }` |
| `/api/sources` | GET | Data Sources | `{ sources }` |
| `/api/ai/query` | POST | AI Analyst chat | body `{ question }` → `{ answer }` |
| `/api/analyze` | POST | "Generate Intelligence Brief" | `{ executiveSummary, topTrends, sentimentChanges, audienceInsights, influenceAnalysis, recommendedActions }` |

Full field-level shape documentation is written as comments directly above
each function in `src/services/api.js`.

**Security note:** the frontend never stores real API keys. The Settings
page's "API Configuration" section is a placeholder for the backend base URL
only — actual secrets belong in your FastAPI backend's environment
variables.

## 9. How to Add a New Analytics Module

Example: adding a new "Competitor Comparison" page.

1. **Mock data** — add a new export to `src/data/mockData.js`, e.g.
   `export const competitorData = [...]`.
2. **API function** — add `getCompetitorData()` to `src/services/api.js`,
   returning `mockRequest(competitorData)` for now, with a documented
   real-fetch version commented above it.
3. **Page component** — create `src/pages/Competitors.jsx`. Use the
   `useAnalytics(getCompetitorData)` hook to get `{ data, loading, error }`,
   and render `Loading` / `ErrorMessage` / your charts using the existing
   `charts/` and `cards/` components (or add new ones following the same
   pattern).
4. **Route** — add `<Route path="/competitors" element={<Competitors />} />`
   to `src/App.jsx`.
5. **Nav link** — add an entry to the `NAV_ITEMS` array in
   `src/components/layout/Sidebar.jsx`.

That's it — no other files need to change.
