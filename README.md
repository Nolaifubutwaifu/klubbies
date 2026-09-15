# Klubbies

Private photo and video albums for university clubs. Only people on a club's member list, verified with an emailed code, can see anything.

Read `klubbies_masterfile.md` for scope, `DECISIONS.md` for choices made during the build, and `design/DESIGN_NOTES.md` for the visual system.

## Stack

- Next.js 16 (App Router)
- Tailwind 4
- Supabase: Postgres + RLS, Storage, Auth OTP
- Resend + React Email
- Zod
- Vitest + Playwright
- pnpm

## Setup

```bash
pnpm install
cp .env.example .env.local   # fill in the values
pnpm dev
```

The Supabase project (`klubbies`, Sydney) already has every migration in `supabase/migrations` applied. For a fresh project, apply them in order with `supabase db push` or the SQL editor.

Seed sample data (two clubs, three members, twelve photos):

```bash
SEED_ADMIN_EMAIL=you@example.com pnpm seed
```

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Local dev server |
| `pnpm typecheck` | Route types + `tsc` |
| `pnpm lint` | ESLint |
| `pnpm test` | Unit tests (handles, roster parsing, name matching) |
| `pnpm test:e2e` | Access-control tests against the real Supabase project (needs the service role key) |

## Billing

Clubs pay through Stripe Checkout before they can add members or upload.

1. Set `STRIPE_SECRET_KEY` and `STRIPE_PRICE_ID` (use test mode keys locally).
2. In Stripe → Developers → Webhooks, add `https://<your-domain>/api/stripe/webhook` with these events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `customer.subscription.created`, `.updated` and `.deleted`
3. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
4. For local webhooks, run `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

## Deploying

Deploy to Vercel in the `syd1` region (`vercel.json`). Set every variable from `.env.example`. `CRON_SECRET` enables the daily grace-period job at `/api/cron/grace`.
