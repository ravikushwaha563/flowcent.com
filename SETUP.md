# Flowcent Setup Guide

Flowcent uses Supabase Auth and Postgres as its only identity and data layer.
Run these steps for every development, staging, or production environment.

## 1. Install

Requirements: Node.js 22, npm, and a Supabase project.

```bash
npm ci
Copy-Item .env.example .env.local
```

Fill in `.env.local`. Keep `SUPABASE_SERVICE_ROLE_KEY`, provider secrets,
`CRON_SECRET_KEY`, and `TOKEN_ENCRYPTION_KEY` on the server. Never expose them
through a `NEXT_PUBLIC_` variable.

Generate `TOKEN_ENCRYPTION_KEY` as 32 random bytes encoded with base64:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 2. Database

Apply every file in `supabase/migrations/` in filename order using the Supabase
SQL editor or CLI. The migration creates tables, indexes, auth profile triggers,
row-level security policies, API-only write grants, transactional plan limits,
billing activation, database-backed rate limits, webhook claims, and
concurrency-safe checkout and follow-up worker claims.

Do not serve user traffic until the migration has completed successfully. See
`supabase/README.md` for verification queries.

## 3. Provider Configuration

- Supabase Auth: add the local and production `/api/auth/callback` URLs.
- Google Cloud: add `/api/auth/gmail/callback` and enable Gmail API access.
- Razorpay: point a webhook to `/api/webhooks/razorpay`, subscribe to
  `payment.captured` and `order.paid`, and set its secret.
- Stripe: point a webhook to `/api/webhooks/stripe`, subscribe to
  `checkout.session.completed` and `checkout.session.async_payment_succeeded`,
  and set its signing secret.
- Scheduler: call `/api/cron/process-followups` using GET or POST with
  `Authorization: Bearer <CRON_SECRET_KEY>`.
- WhatsApp: configure approved templates and enable reminders only for clients
  whose explicit consent is recorded in Flowcent.

Provider callback URLs must use the same origin as `NEXT_PUBLIC_APP_URL`.

## 4. Run And Verify

```bash
npm run dev
npm run quality
npm run verify:deployment
```

Open `http://localhost:3000`. Before launch, smoke-test signup and password
reset, client and invoice lifecycle, Gmail connect/disconnect, both payment
providers and their webhooks, scheduled follow-ups, billing activation, account
export, and account deletion.

## 5. Production Checklist

- Rotate credentials that have ever appeared in source control or an archive.
- Use production callback URLs and live payment credentials.
- Confirm row-level security is enabled on every user-owned table.
- Configure webhook retries and scheduler monitoring.
- Poll `/api/health` from external uptime monitoring; a database or required
  service-role/core-schema failure returns HTTP 503.
- Run `npm run quality` from a clean checkout.
- Back up Postgres and document a restore drill before accepting live data.
