import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { generateFollowUpEmail, sendFollowUpEmail, refreshAccessToken } from '@/lib/gmail';
import { sendWhatsAppTemplate } from '@/lib/whatsapp';
import { serverEnv } from '@/lib/env/server';
import { decryptSecret, encryptSecret } from '@/lib/crypto/secrets';
import { publicEnv } from '@/lib/env/public';
import crypto from 'crypto';

function hasValidBearerToken(header: string | null, secret: string): boolean {
    if (!header) return false;
    const actual = Buffer.from(header);
    const expected = Buffer.from(`Bearer ${secret}`);
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

async function cleanupOperationalData(admin: ReturnType<typeof createAdminSupabaseClient>) {
    const rateLimitCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const webhookCutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const [rateLimits, webhookEvents] = await Promise.all([
        admin.from('rate_limit_buckets').delete().lt('expires_at', rateLimitCutoff),
        admin.from('webhook_events').delete().not('processed_at', 'is', null).lt('processed_at', webhookCutoff),
    ]);
    if (rateLimits.error) console.error('Expired rate-limit cleanup failed:', rateLimits.error);
    if (webhookEvents.error) console.error('Processed webhook cleanup failed:', webhookEvents.error);
}

async function processFollowups(req: NextRequest) {
    try {
        // 1. Verify Cron Secret securely
        const authHeader = req.headers.get('authorization');
        const expectedSecret = serverEnv.CRON_SECRET_KEY;
        
        if (!expectedSecret) {
            console.error('CRON_SECRET_KEY is not configured in environment variables');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        if (!hasValidBearerToken(authHeader, expectedSecret)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabaseAdmin = createAdminSupabaseClient();
        await cleanupOperationalData(supabaseAdmin);
        // 2. Atomically claim due work so overlapping cron runs cannot send the same stage.
        const { data: claims, error: claimError } = await supabaseAdmin.rpc('claim_due_followup_invoices', { p_limit: 50 });
        if (claimError) {
            console.error('Error claiming invoices for cron:', claimError);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        if (!claims || claims.length === 0) {
            return NextResponse.json({ message: 'No invoices require follow-up at this time', processed: 0 });
        }

        const claimTokens = new Map<string, string>(claims.map((claim: { invoice_id: string; claim_token: string }) => [claim.invoice_id, claim.claim_token]));
        const { data: invoices, error: invoiceError } = await supabaseAdmin
            .from('invoices')
            .select(`
                *,
                clients(id, name, email, company, phone, whatsapp_opt_in),
                users(id, email, name, subscription_plan, plan_expires_at, gmail_connected, gmail_access_token, gmail_refresh_token, gmail_token_expiry)
            `)
            .in('id', [...claimTokens.keys()]);

        if (invoiceError) {
            console.error('Error fetching invoices for cron:', invoiceError);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        let processedCount = 0;
        let errorCount = 0;

        // 3. Process each invoice
        for (const invoice of invoices) {
            const claimToken = claimTokens.get(invoice.id);
            if (!claimToken) continue;
            try {
                const user = invoice.users;
                const client = invoice.clients;

                const paidPlanActive = user?.subscription_plan !== 'free'
                    && (!user?.plan_expires_at || new Date(user.plan_expires_at) > new Date());
                if (!paidPlanActive) throw new Error('Paid automation plan is no longer active');

                // Ensure user has connected Gmail
                if (!user || !user.gmail_connected || !user.gmail_refresh_token) {
                    throw new Error(`User ${user?.id || 'unknown'} no longer has Gmail connected`);
                }

                // Check and refresh token if needed
                const refreshToken = decryptSecret(user.gmail_refresh_token);
                let accessToken = user.gmail_access_token ? decryptSecret(user.gmail_access_token) : null;
                const expiry = user.gmail_token_expiry ? new Date(user.gmail_token_expiry) : new Date(0);
                
                if (expiry <= new Date()) {
                    console.log(`Refreshing token for user ${user.id}`);
                    try {
                        const newTokens = await refreshAccessToken(refreshToken);
                        if (!newTokens.access_token) throw new Error('Refresh failed');
                        accessToken = newTokens.access_token;
                        
                        // Update in DB
                        const { error: tokenUpdateError } = await supabaseAdmin
                            .from('users')
                            .update({
                                gmail_access_token: encryptSecret(newTokens.access_token),
                                ...(newTokens.refresh_token ? { gmail_refresh_token: encryptSecret(newTokens.refresh_token) } : {}),
                                gmail_token_expiry: newTokens.expiry_date ? new Date(newTokens.expiry_date).toISOString() : null,
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', user.id);
                        if (tokenUpdateError) throw tokenUpdateError;
                    } catch (refreshErr) {
                        console.error(`Failed to refresh token for user ${user.id}:`, refreshErr);
                        throw refreshErr;
                    }
                }

                if (!accessToken) throw new Error('Gmail access token is unavailable');

                // Generate Email Content based on stage
                const stage = Math.min(Math.max(invoice.current_stage || 1, 1), 5) as 1 | 2 | 3 | 4 | 5;
                const amountFormatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: invoice.currency, maximumFractionDigits: 0 }).format(invoice.amount);
                const emailContent = generateFollowUpEmail({
                    stage,
                    clientName: client.name,
                    invoiceNumber: invoice.invoice_number,
                    amount: amountFormatted,
                    dueDate: invoice.due_date,
                    senderName: user.name || 'Your Partner',
                    paymentUrl: `${publicEnv.appUrl}/pay/${invoice.public_token}`,
                });

                // Send the email
                const emailResult = await sendFollowUpEmail({
                    accessToken,
                    refreshToken,
                    to: client.email,
                    toName: client.name,
                    fromName: user.name || 'Your Partner',
                    subject: emailContent.subject,
                    htmlBody: emailContent.html
                });
                if (!emailResult.success) {
                    throw new Error(emailResult.error || 'Gmail send failed');
                }

                // --- WhatsApp Integration ---
                let whatsappStatus = 'skipped_no_phone';
                if (client.phone && client.whatsapp_opt_in) {
                    const templateName = stage === 1 ? 'payment_reminder_v1' : 'payment_overdue_v1';
                    const sent = await sendWhatsAppTemplate(
                        client.phone,
                        templateName,
                        'en',
                        [
                            {
                                type: 'body',
                                parameters: [
                                    { type: 'text', text: client.name },
                                    { type: 'text', text: invoice.invoice_number },
                                    { type: 'text', text: amountFormatted }
                                ]
                            }
                        ]
                    );
                    whatsappStatus = sent ? 'sent' : 'failed';
                    console.log(`WhatsApp follow-up [${templateName}] to ${client.phone}: ${whatsappStatus}`);
                }
                // --- End WhatsApp ---

                const { data: recorded, error: recordError } = await supabaseAdmin.rpc('record_followup_delivery', {
                    p_invoice_id: invoice.id,
                    p_claim_token: claimToken,
                    p_expected_stage: stage,
                    p_email_subject: emailContent.subject,
                    p_message_content: emailContent.html,
                    p_channel: client.phone && client.whatsapp_opt_in && whatsappStatus === 'sent' ? 'email+whatsapp' : 'email',
                    p_provider_message_id: emailResult.messageId || null,
                });
                if (recordError || !recorded) throw recordError || new Error('Follow-up claim was no longer valid');

                processedCount++;
            } catch (processErr) {
                console.error(`Error processing invoice ${invoice.id}:`, processErr);
                const { error: releaseError } = await supabaseAdmin
                    .from('invoices')
                    .update({ followup_claim_token: null, followup_claimed_at: null })
                    .eq('id', invoice.id)
                    .eq('followup_claim_token', claimToken);
                if (releaseError) console.error(`Failed to release invoice ${invoice.id} claim:`, releaseError);
                errorCount++;
            }
        }

        return NextResponse.json({
            message: 'Cron job completed successfully',
            processed: processedCount,
            errors: errorCount,
            checked: claims.length
        });

    } catch (err: unknown) {
        console.error('Cron job fatal error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export const GET = processFollowups;
export const POST = processFollowups;
