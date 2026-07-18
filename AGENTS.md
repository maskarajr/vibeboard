<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Learned User Preferences

- Prefers low-friction team access: join with a pseudonym plus a shared invite/secret code, without password-based signup.
- Wants email bound to the pseudonym so identity can be recovered after clearing cookies, while keeping auth simple.
- Prefers managed backends with less manual integration; chose Supabase over self-hosted alternatives.
- Building Vibeboard for personal use and a small trusted team, not a public multi-tenant product.

## Learned Workspace Facts

- Vibeboard is a collaborative idea board: team members add ideas, open a detail view to discuss/comment, and vote Execute or Hold.
- Git remote for this workspace is `https://github.com/maskarajr/vibeboard.git`.
- App stack is Next.js with Supabase (`@supabase/ssr`, `@supabase/supabase-js`).
- Intended hosting target for now is Render.
- `.cursor` is listed in `.gitignore`.
