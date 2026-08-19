# Vercel + Supabase setup

This repaired build intentionally uses normal Supabase email/password authentication.
It does NOT require Anonymous Sign-Ins.

## Vercel environment variables

Set these in the Vercel project for Production (and Preview if desired):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Use the Supabase project URL and the browser-safe anon/publishable key from
Supabase Project Settings → API.

After changing variables, redeploy the project.

## Supabase Auth

Authentication → Providers → Email should be enabled.

Anonymous Sign-Ins can remain disabled.

## If a deployed build still reports "Anonymous sign-ins are disabled"

That error is not produced by the source in this repaired ZIP's explicit auth calls.
Check that Vercel is building this exact source/commit and that no stale deployment
or separate Supabase client is being served.
