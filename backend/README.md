# KrishiLink Backend
AI-Assisted Hyperlocal Farmer-to-Institution Marketplace (Backend only)

## 1. Node version
Node.js 20 LTS or newer.

## 2. Install
npm install

## 3. Environment variables
Copy .env.example to .env and fill:
- SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY (Supabase -> Project Settings -> API)
- FRONTEND_URL (your React app origin, default http://localhost:5173)
- SPEECH_API_KEY, LLM_API_KEY (optional, marketplace works without them)

Never commit .env. The service role key must exist ONLY on the backend.

## 4. Supabase setup
- Create a project at supabase.com
- Enable Email (and optionally Phone) auth in Authentication settings

## 5. Database migration
Open Supabase Dashboard -> SQL Editor and run in order:
1. supabase/migrations/001_initial_schema.sql
2. supabase/migrations/002_functions.sql
3. supabase/migrations/003_seed_products.sql
4. supabase/migrations/004_demo_data.sql   (optional demo data)

## 6. Start backend
npm run dev     (development, auto-reload)
npm start       (production)

## 7. Frontend URL
http://localhost:5173  (configure in FRONTEND_URL)

## 8. Backend URL
http://localhost:5000

## 9. API base URL
http://localhost:5000/api/v1

## 10. Test commands
npm test

## Auth flow
1. Frontend signs up/logs in using Supabase Auth (client-side supabase-js)
2. Frontend sends: Authorization: Bearer <access_token>
3. Backend validates token, loads profile, determines role from DB
4. First time: POST /api/v1/auth/profile with { role, farmer:{...} or buyer:{...} }

## Notes
- Payments are mock (auto-paid) outside production.
- Voice extraction works with transcript text even without SPEECH_API_KEY.
- API contract: see API_CONTRACT.md (must match frontend contract exactly).

