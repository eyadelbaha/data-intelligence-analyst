# Data Intelligence Analyst

An AI-powered customer data analysis platform built with Next.js and Claude. Upload any Excel or CSV file to get instant segmentation, CLV predictions, churn detection, cohort retention analysis, and an AI chat assistant — all rendered in a production-grade dashboard.

![Data Intelligence Analyst](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Claude](https://img.shields.io/badge/Claude-Opus-orange)

---

## Features

- **AI-Powered Analysis** — Claude reads your data and generates flags, insights, segment descriptions, and executive summaries
- **Customer Segmentation** — RFM (Recency, Frequency, Monetary) clustering into Champions, Loyal, At Risk, Promising, Hibernating, and New segments
- **CLV Prediction** — 12-month and 24-month Customer Lifetime Value forecasts per segment
- **Churn Detection** — Identifies at-risk customers with severity ratings and actionable flags
- **Cohort Retention Heatmap** — Visual retention curves per acquisition cohort
- **6 Chart Types** — Revenue by segment, monthly trend, RFM bubble map, CLV bar comparison, churn donut, new customer acquisition
- **AI Chat Assistant** — Ask free-form questions about your data and get analyst-grade answers
- **Data Quality Score** — Automatic assessment of your dataset completeness
- **Zero data storage** — Your data never leaves your browser except to call the Gemini API directly

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/data-intelligence-analyst.git
cd data-intelligence-analyst
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up your API key

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and add your Gemini API key:

```
GEMINI_API_KEY=AIza...r-key-here
```

> **Don't have a key?** Get one at [aistudio.google.com](https://aistudio.google.com). You can also enter it directly in the app UI — it stays in browser memory only and is never stored.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel (Recommended)

Vercel is the easiest way to deploy — free tier works perfectly.

### Option A — Deploy via Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts. When asked about environment variables, add `GEMINI_API_KEY`.

### Option B — Deploy via GitHub + Vercel dashboard

1. Push your repo to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/data-intelligence-analyst.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your GitHub repo

3. In **Environment Variables**, add:
   - Key: `GEMINI_API_KEY`
   - Value: `AIza...r-key-here`

4. Click **Deploy** — your app will be live at `https://your-project.vercel.app`

---

## Pushing to an Existing GitHub Repo

If you already have a repo:

```bash
# Copy files into your repo directory, then:
git add .
git commit -m "Add Data Intelligence Analyst"
git push
```

---

## What Data Works Best

Your Excel/CSV can have any column names — Claude auto-detects the structure. For best results, include some of:

| Column Type | Example Names |
|---|---|
| Customer identifier | `customer_name`, `customer_id`, `company` |
| Revenue / amount | `revenue`, `amount`, `sales`, `value` |
| Date | `date`, `order_date`, `transaction_date` |
| Segment / tier | `tier`, `plan`, `segment`, `type` |
| Region | `region`, `country`, `territory` |
| Order count | `orders`, `frequency`, `purchases` |
| NPS score | `nps`, `nps_score`, `satisfaction` |

Minimum viable dataset: just a **customer name + revenue + date** column.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Charts | Chart.js + react-chartjs-2 |
| File parsing | SheetJS (xlsx) + PapaParse |
| AI | Google Gemini 1.5 Flash (free) |
| Deployment | Vercel |

---

## Project Structure

```
data-intelligence-analyst/
├── app/
│   ├── api/analyze/route.ts   # Server-side Claude API proxy
│   ├── globals.css            # Global styles + fonts
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main dashboard page
├── components/
│   ├── AIChat.tsx             # AI chat assistant
│   ├── Charts.tsx             # All chart components
│   ├── CohortHeatmap.tsx      # Retention heatmap
│   ├── FlagCard.tsx           # Alert/flag cards
│   ├── MetricCard.tsx         # KPI metric cards
│   └── UploadZone.tsx         # File upload UI
├── lib/
│   ├── analysis.ts            # Prompts, fallback data, utilities
│   └── types.ts               # TypeScript interfaces
├── .env.local.example         # Environment template
├── .gitignore
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## Security Notes

- **API key via UI**: If users enter their key in the browser, it's held in React state (memory) only — cleared on page refresh, never persisted to localStorage or sent anywhere except Anthropic's API
- **API key via env**: The `GEMINI_API_KEY` env variable is only used server-side in `app/api/analyze/route.ts` — it's never exposed to the browser
- **Data privacy**: No customer data is stored anywhere. It flows: browser → Next.js API route → Gemini API → back to browser

---

## License

MIT — use freely, modify as needed.
