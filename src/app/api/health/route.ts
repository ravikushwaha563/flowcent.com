import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
    const startedAt = Date.now();
    try {
        const admin = createAdminSupabaseClient();
        const checks = await Promise.all([
            admin.from('users').select('id').limit(1),
            admin.from('invoices').select('id, checkout_claim_token, checkout_claimed_at').limit(1),
            admin.from('rate_limit_buckets').select('key').limit(1),
        ]);
        const failedCheck = checks.find(check => check.error);
        if (failedCheck?.error) throw failedCheck.error;

        return NextResponse.json({
            status: 'ok',
            database: 'reachable',
            latencyMs: Date.now() - startedAt,
            timestamp: new Date().toISOString(),
        }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
        console.error('Health check failed:', error);
        return NextResponse.json({
            status: 'degraded',
            database: 'unreachable',
            timestamp: new Date().toISOString(),
        }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }
}
