import type { SupabaseClient } from '@supabase/supabase-js';

export async function activateBillingOrder(
    supabase: SupabaseClient,
    razorpayOrderId: string,
    razorpayPaymentId: string,
) {
    const { data, error } = await supabase.rpc('activate_billing_order', {
        p_order_id: razorpayOrderId,
        p_payment_id: razorpayPaymentId,
    });
    if (error) throw error;

    const result = Array.isArray(data) ? data[0] : data;
    if (!result) throw new Error('Billing activation returned no result');
    return {
        alreadyProcessed: Boolean(result.already_processed),
        plan: String(result.plan),
        expiresAt: String(result.expires_at),
    };
}
