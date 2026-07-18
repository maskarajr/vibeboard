# vibeboard

Collaborative idea board for a small team. Members join with an invite code, email, and pseudonym (passwordless email OTP via Supabase). Vote Execute / Hold, comment, and mark final decisions.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Supabase (Postgres + Auth email OTP)
- Deploy app on Render (see `render.yaml`)

## Setup

1. Create a Supabase project.
2. In the SQL editor, run [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql).
3. Auth → Providers → Email: enable email OTP / magic link as needed for your project.
4. Auth → URL configuration: add `http://localhost:3000/**` and your Render URL to redirect allow-list.
5. Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

| Variable | Where |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | New publishable key (`sb_publishable_...`) |
| `SUPABASE_SECRET_KEY` | New secret key (`sb_secret_...`) — server only, never expose |
| `TEAM_INVITE_CODE` | Shared secret you give teammates |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` locally |

6. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → **Join** with your invite code.

## Deploy (Render)

1. Push this repo to GitHub.
2. Create a Render Web Service from the repo (or use `render.yaml`).
3. Set the same env vars as above; set `NEXT_PUBLIC_APP_URL` to your Render URL.
4. Add the Render URL to Supabase Auth redirect URLs.

## Flows

- **Join:** invite code + email + pseudonym → magic link email → `/auth/callback` creates member profile
- **Login:** email → magic link → same member (works after clearing cookies)
- **Board:** filter ideas, open drawer, vote, comment, mark decision

In Supabase **Authentication → URL configuration**, set Site URL to your app URL and add `http://localhost:3000/auth/callback` (plus your production callback) under Redirect URLs.
