[README.md](https://github.com/user-attachments/files/31234169/README.md)
# LPS Command Center Final SaaS v2

Uses a Supabase schema: companies, company_members, profiles, projects, tasks, constraints, commitments, activity_log.
The full schema + Row Level Security policies are in `supabase/schema.sql`.

## Setup

1. Create a project at https://supabase.com (free tier is fine).
2. In the Supabase dashboard, go to SQL Editor → New query, paste the contents of `supabase/schema.sql`, and run it.
3. In Supabase, go to Project Settings → API and copy your Project URL and `anon` `public` key.
4. In Vercel, go to your project → Settings → Environment Variables and set:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon public key
5. Redeploy on Vercel.

Upload CONTENTS to the ROOT of the GitHub repo connected to the Vercel project (not inside a subfolder).

Workflow: /login -> create account -> /setup -> Dashboard -> Pull Planning -> Look-Ahead -> Constraints -> Weekly Commitments -> PPC.

Never commit a service-role key. Only the anon/public key belongs in `NEXT_PUBLIC_*` env vars.
