# AlgoLens — Multi-Approach Coding Learning Platform

> Learn coding problem-solving by exploring multiple solution approaches side by side — brute force to optimized — with traced dry runs, complexity analysis, and interview follow-ups.

**No code execution. All output is manually traced, never run.**

---

## Quick Start

### Prerequisites
- Node.js 20+
- A [Supabase](https://supabase.com) project
- A [Groq](https://console.groq.com) API key

### 1. Database Setup

In your Supabase project's SQL Editor, run the contents of:
```
backend/src/db/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Fill in .env with your Supabase and Groq credentials
npm install
npm run dev          # Starts on http://localhost:3001
```

Seed the curated problem bank (run once):
```bash
node src/db/seed.js
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# Fill in .env with your Supabase and API URL
npm install
npm run dev          # Starts on http://localhost:5173
```

---

## Architecture

```
coding/
├── frontend/          # React + Vite + Tailwind
│   └── src/
│       ├── pages/     # HomePage, ProblemBankPage, SolvePage, FavoritesPage, AuthPage
│       ├── components/ # ApproachCard, ComparisonView, Layout, ProblemInputForm
│       ├── contexts/  # AuthContext (Supabase Auth)
│       └── lib/       # supabase.js, api.js (axios client)
│
└── backend/           # Node.js + Express
    └── src/
        ├── routes/    # problems.js, approaches.js, favorites.js
        ├── lib/       # supabase.js, groq.js, prompts.js
        └── db/        # schema.sql, seed.js
```

### Data Flow

1. **Curated problems** (pre-seeded): served directly from Supabase — no AI call
2. **Cache hit** (problem+language already generated): served from Supabase — no AI call
3. **New combination or custom problem**: calls Groq API → second verification pass → saved to Supabase

---

## Features

| Feature | Status |
|---|---|
| Problem bank with filters | ✅ |
| Individual approach detail view | ✅ |
| Side-by-side comparison view | ✅ |
| Monaco Editor (read-only, syntax-highlighted) | ✅ |
| Traced dry run display | ✅ |
| Time + Space complexity with justification | ✅ |
| Pros/Cons per approach | ✅ |
| AI-generated interview questions | ✅ |
| Groq AI for custom problems | ✅ |
| Second AI verification pass on complexity claims | ✅ |
| Curated vs AI-generated visual badges | ✅ |
| Supabase Auth (sign up / sign in) | ✅ |
| Favorites (save/unsave approaches) | ✅ |
| Response caching (no re-calling AI) | ✅ |
| Responsive layout (tablet minimum) | ✅ |
| Loading states for all AI calls | ✅ |
| Error handling with retry | ✅ |

---

## Environment Variables

### Backend (`backend/.env`)
```
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
GROQ_API_KEY=gsk_...
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001/api
```

---

## Deployment

### Frontend → Vercel
```bash
cd frontend
# Set env vars in Vercel dashboard (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL)
# Deploy via Vercel CLI or GitHub integration
```

### Backend → Render / Railway
- Set all env vars in the platform dashboard
- Build command: `npm install`
- Start command: `npm start`

---

## Correctness Strategy

- **Curated problems** (30–50 classic problems): approaches, code, complexity, and traces are pre-written by human experts and stored in Supabase. AI is not involved in generating these.
- **AI-generated content** (custom free-text problems): a second Groq call reviews the complexity claims against the code structure and flags discrepancies.
- All AI-generated content is visually marked with an "⚡ AI-generated, not verified" badge. Curated content shows "✓ Curated & Verified".

---

## Phase 2 (Out of Scope for This Build)

The following features are intentionally not implemented and are tracked for future work:

- Live code execution / sandboxing (no Judge0/Piston integration)
- "Run Code" button
- AI code review / optimization suggestions
- Practice tests / quizzes
- Progress tracking dashboard
- Spaced repetition / learning paths

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + Vite |
| Styling | Tailwind CSS 3 |
| Code display | Monaco Editor (read-only) |
| Routing | React Router v6 |
| Backend | Node.js + Express |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| AI model | Groq API (llama-3.3-70b-versatile) |
| Frontend deploy | Vercel |
| Backend deploy | Render / Railway |
