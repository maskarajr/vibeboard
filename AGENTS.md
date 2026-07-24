<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Learned User Preferences

- Prefers low-friction team access: join with a pseudonym plus a shared invite/secret code, without password-based signup.
- Wants email bound to the pseudonym so identity can be recovered after clearing cookies, while keeping auth simple.
- Prefers managed backends with less manual integration; chose Supabase over self-hosted alternatives.
- Building Vibeboard for personal use and a small trusted team, not a public multi-tenant product.
- Prefers Supabase newer publishable/secret API key names over legacy anon/service_role keys.
- Wants idea categories to start empty and grow from categories members enter when creating ideas (no seeded list).
- Wants a member profile page to edit display name, with a 14-day cooldown between username changes.
- Prefers local/dev testing isolated from the live production Supabase project, DB, and auth redirects.

## Learned Workspace Facts

- Vibeboard is a collaborative idea board: team members add ideas, open a detail view to discuss/comment, and vote Execute or Hold.
- Git remote for this workspace is `https://github.com/maskarajr/vibeboard.git`.
- App stack is Next.js with Supabase (`@supabase/ssr`, `@supabase/supabase-js`).
- Production Supabase project is `vibeboard` (`jmlxdicgbpqxfohaedsg`); local/dev uses separate project `vibeboard-dev` (`pfepuqcnvgmxidfkookn`).
- Hosted on Render; live custom domain is `vb.alifera.xyz` (GoDaddy).
- Auth email delivery is wired through Resend (Supabase custom SMTP); verified sending domain is `mail.alifera.xyz`.
- Member pseudonyms are stored in `public.members.display_name`, not in Supabase Auth user metadata.
- Post-auth redirects must use `NEXT_PUBLIC_APP_URL`, not `request.url` (Render's internal host is `localhost:10000`).
- Only the idea author can delete an idea or set its Final decision; comment authors can edit/delete their comments with updated timestamps.
- `.cursor` and `.residuals/` are listed in `.gitignore`.
