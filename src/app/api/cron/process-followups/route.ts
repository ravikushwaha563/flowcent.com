import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { sendFollowUpEmail, refreshAccessToken } from '@/lib/gmail';
import { sendWhatsAppTemplate } from '@/lib/whatsapp';
import { serverEnv } from '@/lib/env/server';
import { decryptSecret, encryptSecret } from '@/lib/crypto/secrets';

export async function GET(req: NextRequest) {
    try {
        // 1. Verify Cron Secret securely
        const authHeader = req.headers.get('authorization');
        const expectedSecret = serverEnv.CRON_SECRET_KEY;
        
        if (!expectedSecret) {
            console.error('CRON_SECRET_KEY is not configured in environment variables');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        if (authHeader !== `Bearer ${expectedSecret}`) {
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
            .neq('status', 'paid')
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
                const stage = invoice.current_stage || 1;
                const amountFormatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: invoice.currency, maximumFractionDigits: 0 }).format(invoice.amount);
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
                const payLink = `${appUrl}/pay/${invoice.public_token}`;

                const subject = stage === 1 
                    ? `Payment Reminder: Invoice ${invoice.invoice_number}`
                    : `Action Required: Overdue Invoice ${invoice.invoice_number} – Follow-up #${stage}`;
                
                const body = `
<div style="font-family:system-ui,-apple-system,sans-serif;color:#1a1a2e;max-width:560px;margin:0 auto;padding:24px">
  <p style="margin:0 0 16px">Hi ${client.name},</p>
  <p style="margin:0 0 16px">This is a ${stage === 1 ? 'friendly reminder' : '<b style="color:#e74c3c">follow-up notice</b>'} regarding invoice <strong>${invoice.invoice_number}</strong> for <strong>${amountFormatted}</strong>, which was due on ${new Date(invoice.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
  ${stage > 1 ? '<p style="margin:0 0 16px;padding:12px 16px;background:#fff3f3;border-left:4px solid #e74c3c;border-radius:8px;font-size:14px;color:#c0392b"><strong>This invoice is now overdue.</strong> Please settle it at your earliest convenience.</p>' : ''}
  <p style="margin:0 0 24px">You can securely view and pay this invoice with one click:</p>
  <div style="text-align:center;margin:0 0 24px">
    <a href="${payLink}" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;font-weight:700;font-size:15px;text-decoration:none;border-radius:12px;letter-spacing:0.3px">Pay ${amountFormatted} Now →</a>
  </div>
  <p style="margin:0 0 8px;font-size:13px;color:#666">If you have already made this payment, please disregard this email.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
  <p style="margin:0;font-size:13px;color:#999">Best regards,<br/><strong style="color:#333">${user.name || 'Your Partner'}</strong></p>
  <p style="margin:16px 0 0;font-size:11px;color:#bbb;text-align:center">Powered by <a href="https://flowcent.in" style="color:#3b82f6;text-decoration:none">Flowcent</a> · AI-Powered Payment Collection</p>
</div>`;

                // Send the email
                const emailResult = await sendFollowUpEmail({
                    accessToken,
                    refreshToken,
                    to: client.email,
                    toName: client.name,
                    fromName: user.name || 'Your Partner',
                    subject,
                    htmlBody: body
                });
                if (!emailResult.success) {
                    throw new Error(emailResult.error || 'Gmail send failed');
                }

                // --- WhatsApp Integration ---
                let whatsappStatus = 'skipped_no_phone';
                if (client.phone) {
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
                    email_subject: subject,
                    message_content: body,
                    channel: client.phone && whatsappStatus === 'sent' ? 'email+whatsapp' : 'email',
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
