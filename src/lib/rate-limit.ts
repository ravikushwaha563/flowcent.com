import 'server-only';
import { createHash } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function consumeRateLimit(
    admin: SupabaseClient,
    scope: string,
    subject: string,
    limit: number,
    windowSeconds: number,
): Promise<boolean> {
    const key = createHash('sha256').update(`${scope}\0${subject}`).digest('hex');
    const { data, error } = await admin.rpc('consume_rate_limit', {
        p_key: key,
        p_limit: limit,
        p_window_seconds: windowSeconds,
    });
    if (error) throw error;
    return data === true;
}

export function rateLimitResponse(retryAfterSeconds: number) {
    return Response.json(
        { error: 'Too many requests. Please retry shortly.' },
        { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } },
    );
}
