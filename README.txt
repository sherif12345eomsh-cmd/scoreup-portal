ScoreUp Elite Academy — Homework Portal (live app)
==================================================

WHAT THIS IS
A real React app, ready to deploy, that students use on their phones.
All data is shared via Supabase (a free database).

THE ONLY FILE YOU EDIT
  src/supabase.js   ← paste your 2 Supabase keys here (or use env vars on Vercel)

SETUP (full picture steps in the Deploy Guide PDF)
  1. Supabase: create project, run supabase_setup.sql, copy your 2 keys
  2. Paste keys into src/supabase.js  (or set them as env vars in Vercel)
  3. Push this folder to GitHub
  4. Import the repo into Vercel, add the 2 env vars, Deploy
  5. Share the vercel.app link in WhatsApp

DEMO LOGINS
  Student PIN: 1234   ·   Teacher password: admin
  (change these in Supabase once you're live)

FILES
  src/App.jsx          the whole app
  src/supabase.js      database connection (paste keys here)
  supabase_setup.sql   run once in Supabase to create tables + seed data
  package.json         dependencies
  .env.example         optional: copy to .env for local testing
