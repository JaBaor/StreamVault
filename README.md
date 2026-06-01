# StreamVault

## Description

StreamVault is a streaming platform for anime and movies with admin management, user authentication, subscription plans, and social features like reviews and watchlists.

## Tech Stack

**Front-End:** Next.js, TypeScript, Tailwind CSS

**Back-End:** Node.js, Express

**Database:** MySQL

**Host Video:** abyss.to, Google Drive

**Web Deploy:** Railway

## Features

1. **User**
   - Register and login account
   - Browse anime/movies with filters and search
   - Watch video online
   - Review and rate content
   - Save to watchlist
   - View watch history
   - Profile with avatar upload
   - Subscription plans (free / premium)

2. **Admin**
   - Manage movies, series, and episodes
   - Upload thumbnails
   - Manage genres and users
   - Export data

## Demo

- **Website:** https://frontend-production-70ed.up.railway.app
- **Demo account:** admin@streamify.com / Admin123!
                     user@streamvault.dev / User123!
                     moderator@streamvault.dev / User123!

## Authors

- **Atomyst & JaBaor** — [GitHub](https://github.com/Atomyst)

## Run Locally

Clone the project

```bash
git clone https://github.com/Atomyst/WAD-Project
```

Install backend dependencies

```bash
cd backend
npm install
```

Set up MySQL database (run schema.sql then seed.sql)

Start the backend

```bash
npm run dev
```

Install frontend dependencies

```bash
cd frontend
npm install
```

Start the frontend

```bash
npm run dev
```

## Build and run project

```bash
cd frontend
npm run build
npm start
```

## Deployment

This project is deployed on Railway. Link your GitHub repo to Railway and set the required environment variables.

## FAQ

#### Why does the session expire so fast?

- Access tokens expire in 15 minutes. The refresh token (7 days) should auto-renew it. If cookies aren't sent cross-domain, you'll be logged out.

#### Why can't I see images?

- Thumbnails and avatars are stored as base64 in the database. Make sure the column is LONGTEXT.

#### Registration and login not working?

- Make sure MySQL is running and the schema is initialized. Check that CORS allows your frontend origin.

## Feedback

If you have any feedback, please reach out to us at streamvault@example.com

## Support

For support, email danhuoc1234@gmail.com or dgbscorpion206@gmail.com
