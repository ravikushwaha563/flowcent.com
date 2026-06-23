# Supabase database

The SQL files in `migrations/` are the canonical database schema and security
configuration for Flowcent. Apply them in filename order through the Supabase
CLI or the SQL editor before starting the application.

The application uses:

- authenticated RLS clients for scoped reads and safe profile fields;
- a server-only service-role client for validated application writes, cron,
  payment callbacks, and webhooks;
- no direct anonymous table access.

Client and invoice creation limits, AI usage, billing activation, and webhook
claims are enforced by database functions. Billing activation is executable by
the service role only. Authenticated clients cannot directly mutate billing,
invoice, client, promise, or follow-up rows.

Never expose `SUPABASE_SERVICE_ROLE_KEY` through a `NEXT_PUBLIC_` variable.

## Applying migrations

Preferred CLI flow:

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

If the database pooler is unavailable, paste the migration into the Supabase
SQL editor and run it as one transaction. Verify afterward that anonymous
table grants are revoked, RLS is enabled on every application table, and
`activate_billing_order` is executable only by `service_role`.
