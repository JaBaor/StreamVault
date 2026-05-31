## Cleanup (May 31)
- Deleted `StreamVault fronend v1/` (stale build), `backend/oauth-debug.log`, test uploads in `public/uploads/thumbnails/`, dead `src/public/`
- Removed unused backend deps: nodemailer, passport, passport-google-oauth20
- Created `frontend/.env.local` with `NEXT_PUBLIC_API_URL`
- Fixed 3 lint errors (setState in effects with cancelled flags, unused vars)
- Updated `schema.sql` with missing columns/tables: oauth_provider/oauth_id on users, airing_status on videos, series_subscriptions, actors. Removed temp railway-schema.sql
- Verified: backend starts clean (API 200), frontend builds with 0 errors

## DB Connection
- MySQL: `DB_HOST=localhost`, `DB_USER=root`, `DB_PASSWORD=Baormysql@07`, `DB_NAME=streaming_db`
- Run `schema.sql` then `seed.sql` to init DB

## Backend
- Node/Express, port 5000
- Start: `npm start` or `npm run dev`
- Google OAuth uses fetch (not passport), configured via .env GOOGLE_CLIENT_ID/SECRET

## Frontend
- Next.js 16, Tailwind 4, port 3000
- Prefer `<img>` for external thumbnails (not next/image)
