# Alumni Network System — AI-Powered College Alumni Platform

A modern full-stack platform connecting **Students**, **Alumni**, and **Admin** with AI-powered career guidance. Built with **Next.js 16**, **Supabase**, and **Google Gemini**.

🔗 **Repo:** https://github.com/maytay-aravind/alumni-network

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), Tailwind CSS, shadcn/ui pattern |
| Backend | Next.js API Routes, Supabase |
| Database | PostgreSQL (Supabase) with RLS policies |
| Auth | Supabase Auth (email/password) |
| AI | Google Gemini (`gemini-2.0-flash`) |
| Charts | Recharts |
| Deployment | Vercel / any Node host |

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
