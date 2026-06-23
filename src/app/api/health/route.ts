import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
    const startedAt = Date.now();
    try {
        const { error } = await createAdminSupabaseClient()
            .from('users')
            .select('id')
            .limit(1);
        if (error) throw error;

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
