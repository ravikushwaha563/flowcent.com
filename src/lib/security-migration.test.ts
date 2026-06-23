import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(
    join(process.cwd(), 'supabase/migrations/202606220001_security_foundation.sql'),
    'utf8',
);

describe('database security migration', () => {
    it('keeps billing activation service-role only', () => {
        expect(migration).toContain(
            'revoke all on function public.activate_billing_order(text, text) from public, anon, authenticated;',
        );
        expect(migration).toContain(
            'grant execute on function public.activate_billing_order(text, text) to service_role;',
        );
    });

    it('keeps follow-up worker claims and delivery recording service-role only', () => {
        expect(migration).toContain(
            'revoke all on function public.claim_due_followup_invoices(integer) from public, anon, authenticated;',
        );
        expect(migration).toContain(
            'grant execute on function public.claim_due_followup_invoices(integer) to service_role;',
        );
        expect(migration).toContain(
            'revoke all on function public.record_followup_delivery(uuid, uuid, integer, text, text, text, text) from public, anon, authenticated;',
        );
        expect(migration).toContain('for update of i skip locked');
    });

    it('does not grant authenticated users direct access to sensitive profile columns', () => {
        const profileUpdateGrant = migration.match(/grant update \(([^)]+)\)\s+on public\.users to authenticated;/)?.[1] || '';
        expect(profileUpdateGrant).toContain('name');
        expect(profileUpdateGrant).not.toContain('subscription_plan');
        expect(profileUpdateGrant).not.toContain('gmail_access_token');
    });

    it('makes application data writes API-only', () => {
        expect(migration).toContain(
            'grant select on public.clients, public.invoices, public.promises,\n    public.followups, public.billing_orders to authenticated;',
        );
    });
});
