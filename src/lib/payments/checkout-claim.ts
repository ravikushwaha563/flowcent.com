import { randomUUID } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

const CLAIM_TTL_MS = 2 * 60 * 1000;

export async function claimInvoiceCheckout(admin: SupabaseClient, invoiceId: string): Promise<string | null> {
    const token = randomUUID();
    const staleBefore = new Date(Date.now() - CLAIM_TTL_MS).toISOString();
    const { data, error } = await admin
        .from('invoices')
        .update({ checkout_claim_token: token, checkout_claimed_at: new Date().toISOString() })
        .eq('id', invoiceId)
        .eq('status', 'pending')
        .or(`checkout_claimed_at.is.null,checkout_claimed_at.lt.${staleBefore}`)
        .select('id')
        .maybeSingle();
    if (error) throw error;
    return data ? token : null;
}

export async function completeInvoiceCheckout(
    admin: SupabaseClient,
    invoiceId: string,
    claimToken: string,
    providerFields: Record<string, string>,
): Promise<boolean> {
    const { data, error } = await admin
        .from('invoices')
        .update({
            ...providerFields,
            checkout_claim_token: null,
            checkout_claimed_at: null,
            updated_at: new Date().toISOString(),
        })
        .eq('id', invoiceId)
        .eq('status', 'pending')
        .eq('checkout_claim_token', claimToken)
        .select('id')
        .maybeSingle();
    if (error) throw error;
    return Boolean(data);
}

export async function releaseInvoiceCheckout(
    admin: SupabaseClient,
    invoiceId: string,
    claimToken: string,
): Promise<void> {
    const { error } = await admin
        .from('invoices')
        .update({ checkout_claim_token: null, checkout_claimed_at: null })
        .eq('id', invoiceId)
        .eq('checkout_claim_token', claimToken);
    if (error) console.error(`Failed to release checkout claim for invoice ${invoiceId}:`, error);
}
