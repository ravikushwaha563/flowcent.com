import type { SupabaseClient } from '@supabase/supabase-js';

export type WebhookClaim = 'claimed' | 'busy' | 'processed';

export async function claimWebhookEvent(
    admin: SupabaseClient,
    provider: 'stripe' | 'razorpay',
    eventId: string,
    eventType: string,
    payload: unknown,
): Promise<WebhookClaim> {
    const { data, error } = await admin.rpc('claim_webhook_event', {
        p_provider: provider,
        p_event_id: eventId,
        p_event_type: eventType,
        p_payload: payload,
    });
    if (error) throw error;
    if (data !== 'claimed' && data !== 'busy' && data !== 'processed') {
        throw new Error('Unexpected webhook claim state');
    }
    return data;
}

export async function completeWebhookEvent(
    admin: SupabaseClient,
    provider: 'stripe' | 'razorpay',
    eventId: string,
): Promise<void> {
    const { data, error } = await admin.from('webhook_events').update({
        processed_at: new Date().toISOString(),
        processing_started_at: null,
    }).eq('provider', provider).eq('provider_event_id', eventId)
        .select('provider_event_id').maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Webhook event disappeared before completion');
}

export async function releaseWebhookEvent(
    admin: SupabaseClient,
    provider: 'stripe' | 'razorpay',
    eventId: string,
): Promise<void> {
    const { error } = await admin.from('webhook_events')
        .update({ processing_started_at: null })
        .eq('provider', provider)
        .eq('provider_event_id', eventId)
        .is('processed_at', null);
    if (error) console.error(`Failed to release ${provider} webhook claim:`, error);
}
