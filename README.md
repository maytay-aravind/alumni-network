# Alumni Network System — AI-Powered College Alumni Platform

A modern full-stack platform connecting **Students**, **Alumni**, and **Admin** with AI-powered career guidance. Built with **Next.js 16**, **Supabase**, and **Google Gemini**.

🔗 **Repo:** https://github.com/maytay-aravind/alumni-network

---

## Architecture — Frontend & Backend Separated

```
alumni-network/
├── src/                # Frontend (Next.js 16, Tailwind, Material You)
│   ├── app/            # App Router + pages
│   └── components/     # UI
├── backend/            # Backend (Standalone Express, optional)
│   ├── server.js       # Express entry (port 4000)
│   ├── routes/         # auth.js, ai.js
│   └── lib/            # supabase.js, gemini.js
└── supabase/           # SQL schema & patches
```

- **Frontend:** Next.js handles UI and by default also serves `/api/*` (full-stack mode for simple deploy).
- **Backend (separate):** `backend/` is a standalone Express server. Set `NEXT_PUBLIC_BACKEND_URL=http://localhost:4000` in frontend `.env.local` to make the frontend call the separate backend instead of Next.js API routes. This gives true separation for college demo (show two terminals: `npm run dev` in root and `npm run dev` in `backend/`).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), Tailwind CSS, Material You |
| Backend | Next.js API Routes **or** Express (`backend/`) — Supabase + Gemini |
| Database | PostgreSQL (Supabase) with RLS |
| Auth | Supabase Auth |
| AI | Google Gemini (`gemini-2.0-flash`) |

---

## Quick Start

### 1. Clone

```bash
git clone https://github.com/maytay-aravind/alumni-network.git
cd alumni-network
npm install
```

### 2. Environment Variables

Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
GEMINI_API_KEY=YOUR_GEMINI_KEY
```

- Supabase keys → Supabase Dashboard → Project Settings → API
- Gemini key → https://aistudio.google.com/apikey (starts with `AIza...`)

> `.env.local` is git-ignored and never committed.

### 3. Database

In Supabase Dashboard → **SQL Editor** → paste and run `supabase/schema.sql`.

This creates all tables, enums, indexes, and RLS policies.

### 4. Run

```bash
npm run dev
```

Open http://localhost:3000

### 5. Create Users

- Register as **Student** or **Alumni** via UI
- To make an admin: Supabase → Table Editor → `users` → change `role` to `admin`

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/login, register, forgot-password
│   ├── (dashboard)/student, alumni, admin
│   ├── api/ai/ (chat, resume, skill-gap, mentor-match, etc.)
│   └── page.tsx (landing)
├── components/
│   ├── ui/ (button, card, dialog, etc.)
│   ├── layout/ (Sidebar, Navbar)
│   ├── dashboard/, alumni/, student/, admin/
│   └── shared/
├── lib/
│   ├── supabase/ (client, server, middleware)
│   ├── ai/ (gemini.ts, prompts.ts)
│   └── utils.ts, constants.ts
├── types/
└── middleware.ts
supabase/schema.sql
```

---

## Features

- **Auth:** Student/Alumni/Admin roles, protected routes
- **Profiles:** Completion tracking, skills, projects, experience
- **Directory:** Search/filter alumni by company, skills, year, location
- **Social:** Connections, mentorship requests, community posts, likes/comments
- **Jobs:** Board + referrals, applications
- **Events:** Create, register, track attendance
- **Messaging:** Conversations with read states
- **AI:** Career chatbot, resume analyzer, skill-gap analysis, mentor matching, career readiness score, alumni insights
- **Admin:** Analytics, verification queue, user management

## Deploy

Vercel: import repo → add env vars → deploy. Add same env vars in Vercel project settings.
