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
        const now = new Date().toISOString();

        // 2. Fetch overdue invoices that need follow-up
        const { data: invoices, error: invoiceError } = await supabaseAdmin
            .from('invoices')
            .select(`
                *,
                clients(id, name, email, company, phone),
                users(id, email, name, subscription_plan, plan_expires_at, gmail_connected, gmail_access_token, gmail_refresh_token, gmail_token_expiry)
            `)
            .eq('status', 'pending')
            .eq('auto_followup', true)
            .lte('next_followup_date', now)
            .lte('current_stage', 5)
            .limit(50); // Batch process

        if (invoiceError) {
            console.error('Error fetching invoices for cron:', invoiceError);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        if (!invoices || invoices.length === 0) {
            return NextResponse.json({ message: 'No invoices require follow-up at this time', processed: 0 });
        }

        let processedCount = 0;
        let errorCount = 0;

        // 3. Process each invoice
        for (const invoice of invoices) {
            try {
                const user = invoice.users;
                const client = invoice.clients;

                const paidPlanActive = user?.subscription_plan !== 'free'
                    && (!user?.plan_expires_at || new Date(user.plan_expires_at) > new Date());
                if (!paidPlanActive) continue;

                // Ensure user has connected Gmail
                if (!user || !user.gmail_connected || !user.gmail_refresh_token) {
                    console.log(`Skipping invoice ${invoice.id}: User ${user?.id} has no Gmail connected`);
                    continue; // Skip silently
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
                        await supabaseAdmin
                            .from('users')
                            .update({
                                gmail_access_token: encryptSecret(newTokens.access_token),
                                ...(newTokens.refresh_token ? { gmail_refresh_token: encryptSecret(newTokens.refresh_token) } : {}),
                                gmail_token_expiry: newTokens.expiry_date ? new Date(newTokens.expiry_date).toISOString() : null,
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', user.id);
                    } catch (refreshErr) {
                        console.error(`Failed to refresh token for user ${user.id}:`, refreshErr);
                        continue; // Skip this invoice if token refresh fails
                    }
                }

                if (!accessToken) continue;

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

                // Calculate next follow-up date (e.g., +3 days)
                const isFinalStage = stage >= 5;
                const nextDate = new Date();
                nextDate.setDate(nextDate.getDate() + 3);

                // Update invoice stage and next follow-up
                await supabaseAdmin
                    .from('invoices')
                    .update({
                        current_stage: stage + 1,
                        next_followup_date: isFinalStage ? null : nextDate.toISOString(),
                        auto_followup: !isFinalStage,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', invoice.id);

                await supabaseAdmin.from('followups').insert({
                    invoice_id: invoice.id,
                    user_id: user.id,
                    stage,
                    email_subject: emailContent.subject,
                    message_content: emailContent.html,
                    channel: client.phone && client.whatsapp_opt_in && whatsappStatus === 'sent' ? 'email+whatsapp' : 'email',
                    status: 'sent',
                    sent_at: new Date().toISOString(),
                });

                processedCount++;
            } catch (processErr) {
                console.error(`Error processing invoice ${invoice.id}:`, processErr);
                errorCount++;
            }
        }

        return NextResponse.json({
            message: 'Cron job completed successfully',
            processed: processedCount,
            errors: errorCount,
            checked: invoices.length
        });

    } catch (err: unknown) {
        console.error('Cron job fatal error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export const GET = processFollowups;
export const POST = processFollowups;
