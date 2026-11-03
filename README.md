# AI Wallpapers

A Persian RTL starter website for AI-generated wallpapers and AI music, inspired by the supplied design.

## What works in this starter
- Responsive dark neon landing page
- Wallpaper / AI music tabs and category filters
- Search
- Image preview and download link
- Supabase admin login, upload to cloud storage, and public media listing (after setup)

## Run on Windows
1. Install Node.js LTS from https://nodejs.org
2. Extract this ZIP.
3. Open the extracted folder in VS Code.
4. Open Terminal and run:
   ```bash
   npm install
   npm run dev
   ```
5. Open the local address printed by Vite (usually http://localhost:5173).

## Turn on real admin uploads
1. Create a project at https://supabase.com
2. In Supabase, open SQL Editor and run `supabase/schema.sql`.
3. Create your admin account in Authentication > Users.
4. Copy that user's UUID, then run this SQL (replace the UUID):
   ```sql
   insert into public.admin_users (user_id) values ('YOUR-AUTH-USER-UUID');
   ```
5. In Project Settings > API, copy the Project URL and anon/public key.
6. Copy `.env.example` to a new file named `.env` and fill in:
   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   ```
7. Stop and restart the dev server. Click the user icon to log in and upload images or audio.

## Publish online
Deploy this folder to a static host such as Netlify or Vercel. Add the two `VITE_SUPABASE_*` environment variables in the host's project settings, then deploy. The Supabase database and Storage keep uploaded content available to visitors.

## Important
- Never put a Supabase `service_role` key in this website. Only use the anon/public key.
- The included sample gallery is demonstration content. Replace it with your own licensed/generated files.
- For a real public launch, add your own domain, privacy/contact details, and review upload size/type limits.
