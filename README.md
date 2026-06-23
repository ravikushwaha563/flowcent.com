# Flowcent

Flowcent is a payment collection SaaS for freelancers and agencies. It tracks
clients and invoices, accepts Razorpay or Stripe payments, sends staged Gmail
follow-ups, exports Pro invoice records to CSV, and provides AI-assisted payment
intelligence.

## Stack

- Next.js 16, React 19, TypeScript, Tailwind CSS
- Supabase Auth and Postgres with row-level security
- Razorpay and Stripe payments
- Gmail OAuth, Gemini/Groq AI, optional WhatsApp Cloud API
- Vitest for unit tests

## Local setup

1. Install Node.js 22 and run `npm ci`.
2. Copy `.env.example` to `.env.local` and provide the required credentials.
3. Apply every SQL file in `supabase/migrations/` in filename order.
4. Run `npm run dev` and open `http://localhost:3000`.

The service-role Supabase key is required for validated application writes and
is server-only. Never prefix it with
`NEXT_PUBLIC_` or expose it to browser code.

## Quality checks

```bash
npm run quality
```

Individual commands are available as `npm run lint`, `npm run typecheck`,
`npm test`, `npm run test:coverage`, and `npm run build`.

After applying migrations to a configured Supabase project, run:

```bash
npm run verify:deployment
```

This fails if anonymous table reads remain open or required billing and
follow-up worker RPCs are missing or reachable by anonymous callers.

## Production requirements

- Apply the database security migration before serving traffic.
- Rotate any credential that has ever appeared in an archive or shared file.
- Configure the production app URL and provider callback URLs exactly.
- Supply `CRON_SECRET_KEY` and invoke `/api/cron/process-followups` with a
  bearer token from a trusted scheduler. Both GET-based schedulers and POST are
  supported.
- Obtain explicit client consent before enabling WhatsApp reminders.
- Configure Razorpay and Stripe webhooks before enabling live payments.
- Monitor `/api/health` (database, service-role and core-schema readiness),
  scheduler failures, and payment webhook retries.
- Run the full quality gate and a payment/auth smoke test before deployment.

See [supabase/README.md](supabase/README.md) for database details and
`.env.example` for the complete environment contract.
