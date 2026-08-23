# Backend — Express (Standalone)

Standalone backend that mirrors Next.js `/api` routes. Use this when you want true frontend/backend separation.

## Run

```bash
cd backend
copy .env.example .env   # fill SUPABASE_*, GEMINI_API_KEY
npm install
npm run dev   # http://localhost:4000
```

Frontend will call this backend if `NEXT_PUBLIC_BACKEND_URL=http://localhost:4000` is set in the frontend `.env.local`. Otherwise frontend uses its built-in Next.js API routes.

Health check: `GET http://localhost:4000/health`
