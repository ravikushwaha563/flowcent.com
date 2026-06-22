import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/server';
import { sendFollowUpEmail, generateFollowUpEmail } from '@/lib/gmail';
import { followUpSchema, validationError } from '@/lib/validations/domain';
import { ZodError } from 'zod';
import { decryptSecret } from '@/lib/crypto/secrets';

export async function POST(req: NextRequest) {
    try {
        const { supabase, user: authUser, response } = await requireUser();
        if (!authUser) return response!;
        const { invoiceId, stage } = followUpSchema.parse(await req.json());

        // Get user + Gmail tokens
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('name, company_name, gmail_connected, gmail_access_token, gmail_refresh_token')
            .eq('id', authUser.id)
            .single();

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!user.gmail_connected || !user.gmail_access_token) {
            return NextResponse.json({ error: 'Gmail not connected. Please connect Gmail first.' }, { status: 400 });
        }

        // Get invoice + client data
        const { data: invoice, error: invError } = await supabase
            .from('invoices')
            .select(`*, clients(name, email)`)
            .eq('id', invoiceId)
            .eq('user_id', authUser.id)
            .single();

        if (invError || !invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        if (invoice.status === 'paid') {
            return NextResponse.json({ error: 'Invoice is already paid' }, { status: 400 });
        }

        // Format amount
        const formattedAmount = new Intl.NumberFormat('en-IN', {
            style: 'currency', currency: invoice.currency || 'INR', maximumFractionDigits: 0,
        }).format(invoice.amount);

        // Generate email
        const emailContent = generateFollowUpEmail({
            stage: stage as 1 | 2 | 3 | 4 | 5,
            clientName: invoice.clients.name,
            invoiceNumber: invoice.invoice_number,
            amount: formattedAmount,
            dueDate: invoice.due_date,
            senderName: user.name || authUser.email?.split('@')[0] || 'Flowcent User',
            companyName: user.company_name,
        });

        // Send via Gmail API
        const result = await sendFollowUpEmail({
            accessToken: decryptSecret(user.gmail_access_token),
            refreshToken: user.gmail_refresh_token ? decryptSecret(user.gmail_refresh_token) : undefined,
            to: invoice.clients.email,
            toName: invoice.clients.name,
            fromName: user.company_name || user.name || 'Flowcent User',
            subject: emailContent.subject,
            htmlBody: emailContent.html,
        });

        if (!result.success) {
            return NextResponse.json({ error: `Failed to send: ${result.error}` }, { status: 500 });
        }

        // Record the follow-up in DB
        const { error: followUpError } = await supabase.from('followups').insert({
            invoice_id: invoiceId,
            user_id: authUser.id,
            stage,
            email_subject: emailContent.subject,
            message_content: emailContent.html,
            channel: 'email',
            sent_at: new Date().toISOString(),
            status: 'sent',
        });
        if (followUpError) console.error('Follow-up audit log failed:', followUpError);

        return NextResponse.json({
            success: true,
            message: `Stage ${stage} follow-up sent to ${invoice.clients.email}`,
            messageId: result.messageId,
        });
    } catch (err: unknown) {
        if (err instanceof ZodError) return NextResponse.json(validationError(err), { status: 400 });
        console.error('Send follow-up error:', err);
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to send follow-up' }, { status: 500 });
    }
}
