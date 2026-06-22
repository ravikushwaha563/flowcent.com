# Supabase database

The SQL files in `migrations/` are the canonical database schema and security
configuration for Flowcent. Apply them in filename order through the Supabase
CLI or the SQL editor before starting the application.

The application uses:

- authenticated RLS clients for user-owned data;
- a server-only service-role client for cron, payment callbacks, and webhooks;
- no direct anonymous table access.

Never expose `SUPABASE_SERVICE_ROLE_KEY` through a `NEXT_PUBLIC_` variable.

## Applying migrations

Preferred CLI flow:

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

If the database pooler is unavailable, paste the migration into the Supabase
SQL editor and run it as one transaction. Verify afterward that anonymous
table grants are revoked and RLS is enabled on every application table.
