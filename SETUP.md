# WasteSmart Karnataka — Setup Guide

## Supabase Setup (Free)

1. Go to https://supabase.com → New Project (free tier)
2. After project is created, go to **Settings → API**
3. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`
4. Paste into `frontend-react/.env`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```

### Enable Google OAuth (optional)
- Supabase Dashboard → Authentication → Providers → Google → Enable
- Add your Google OAuth Client ID & Secret (from console.cloud.google.com)

### Enable Email OTP
- Supabase Dashboard → Authentication → Providers → Email → Enable "Magic Link"

## Running the App

### Backend
```bash
cd backend
python main.py
# Runs on http://localhost:8000
```

### Frontend (React)
```bash
cd frontend-react
npm run dev
# Runs on http://localhost:5174
```

Open http://localhost:5174 in your browser.

## Gemini API Key (optional, for real AI)
- Get free key at https://aistudio.google.com/app/apikey
- Add to `backend/.env`: `GEMINI_API_KEY=your_key`
