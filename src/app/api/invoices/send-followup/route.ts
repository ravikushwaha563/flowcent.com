import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { sendFollowUpEmail, generateFollowUpEmail } from '@/lib/gmail';

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const userInfo = verifyToken(token);
        if (!userInfo) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const body = await req.json();
        const { invoiceId, stage } = body;

        if (!invoiceId || !stage) {
            return NextResponse.json({ error: 'invoiceId and stage required' }, { status: 400 });
        }

        // Get user + Gmail tokens
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('name, company_name, gmail_connected, gmail_access_token, gmail_refresh_token')
            .eq('id', userInfo.userId)
            .single();

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!user.gmail_connected || !user.gmail_access_token) {
            return NextResponse.json({ error: 'Gmail not connected. Please connect Gmail first.' }, { status: 400 });
        }

        // Get invoice + client data
        const { data: invoice, error: invError } = await supabaseAdmin
            .from('invoices')
            .select(`*, clients(name, email)`)
            .eq('id', invoiceId)
            .eq('user_id', userInfo.userId)
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
            senderName: user.name || userInfo.email.split('@')[0],
            companyName: user.company_name,
        });

        // Send via Gmail API
        const result = await sendFollowUpEmail({
            accessToken: user.gmail_access_token,
            refreshToken: user.gmail_refresh_token || undefined,
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
        await supabaseAdmin.from('followups').insert({
            invoice_id: invoiceId,
            user_id: userInfo.userId,
            stage,
            email_subject: emailContent.subject,
            sent_at: new Date().toISOString(),
            status: 'sent',
        });

        return NextResponse.json({
            success: true,
            message: `Stage ${stage} follow-up sent to ${invoice.clients.email}`,
            messageId: result.messageId,
        });
    } catch (err: any) {
        console.error('Send follow-up error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
