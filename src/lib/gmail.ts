import { google } from 'googleapis';
import { publicEnv } from '@/lib/env/public';
import { requireServerEnv, serverEnv } from '@/lib/env/server';
import { getErrorMessage } from '@/lib/errors';

export function getOAuthClient() {
    return new google.auth.OAuth2(
        requireServerEnv('GOOGLE_CLIENT_ID'),
        requireServerEnv('GOOGLE_CLIENT_SECRET'),
        serverEnv.GOOGLE_REDIRECT_URI || `${publicEnv.appUrl}/api/auth/gmail/callback`,
    );
}

export function getGmailAuthUrl(state: string): string {
    const oauth2Client = getOAuthClient();
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/userinfo.email',
        ],
        prompt: 'consent',
        state,
    });
}

export async function exchangeCodeForTokens(code: string) {
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
}

export async function refreshAccessToken(refreshToken: string) {
    const oauth2Client = getOAuthClient();
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials;
}

export async function getGmailClient(accessToken: string, refreshToken?: string) {
    const oauth2Client = getOAuthClient();
    oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
    });
    return google.gmail({ version: 'v1', auth: oauth2Client });
}

// Get the Gmail address of the connected account
export async function getGmailAddress(accessToken: string, refreshToken?: string): Promise<string> {
    const oauth2Client = getOAuthClient();
    oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    return data.email || '';
}

// Build RFC-2822 email message — base64url encoded
function buildEmailMessage({
    to, from, subject, body, replyTo,
}: {
    to: string; from: string; subject: string; body: string; replyTo?: string;
}): string {
    const headers = [
        `To: ${to}`,
        `From: ${from}`,
        `Subject: ${subject}`,
        replyTo ? `Reply-To: ${replyTo}` : '',
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
    ].filter(Boolean).join('\n');

    const message = `${headers}\n\n${body}`;
    return Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Send a follow-up email via Gmail API
export async function sendFollowUpEmail({
    accessToken, refreshToken, to, toName, fromName, subject, htmlBody,
}: {
    accessToken: string; refreshToken?: string;
    to: string; toName: string; fromName: string;
    subject: string; htmlBody: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        const oauth2Client = getOAuthClient();
        oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        // Get sender email
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const { data: userInfo } = await oauth2.userinfo.get();
        const fromEmail = userInfo.email || '';

        const raw = buildEmailMessage({
            to: `${toName} <${to}>`,
            from: `${fromName} <${fromEmail}>`,
            subject,
            body: htmlBody,
        });

        const res = await gmail.users.messages.send({
            userId: 'me',
            requestBody: { raw },
        });

        return { success: true, messageId: res.data.id || undefined };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, 'Failed to send email') };
    }
}

// Generate HTML email template for follow-up
export function generateFollowUpEmail({
    stage, clientName, invoiceNumber, amount, dueDate, senderName, companyName,
}: {
    stage: 1 | 2 | 3 | 4 | 5;
    clientName: string; invoiceNumber: string; amount: string;
    dueDate: string; senderName: string; companyName?: string;
}): { subject: string; html: string } {
    const company = companyName || senderName;
    const formattedDue = new Date(dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    const templates: Record<number, { subject: string; intro: string; tone: string }> = {
        1: {
            subject: `Friendly Reminder: Invoice ${invoiceNumber} is due`,
            intro: `I hope this message finds you well! I'm reaching out with a friendly reminder about`,
            tone: 'Just in case it slipped through the cracks — no worries at all!'
        },
        2: {
            subject: `Follow-up: Invoice ${invoiceNumber} – Payment Pending`,
            intro: `I wanted to follow up regarding the outstanding payment for`,
            tone: 'Please let me know if you have any questions or need any changes to the invoice.'
        },
        3: {
            subject: `Action Required: Invoice ${invoiceNumber} – 2nd Follow-up`,
            intro: `This is my second follow-up regarding the payment overdue for`,
            tone: 'Could you please let me know the expected payment date? Your prompt response is appreciated.'
        },
        4: {
            subject: `⚠️ Urgent: Invoice ${invoiceNumber} – Payment Overdue`,
            intro: `I'm writing regarding the significantly overdue payment for`,
            tone: 'Please arrange the payment immediately or contact me to discuss any issues.'
        },
        5: {
            subject: `Final Notice: Invoice ${invoiceNumber} – Immediate Action Required`,
            intro: `This is a final notice regarding the long overdue payment for`,
            tone: 'If payment is not received within 7 days, I will be forced to take further action.'
        },
    };

    const t = templates[stage];

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#111118;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#3d61ff,#7c3aed);padding:28px 32px;">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:32px;height:32px;background:rgba(255,255,255,0.2);border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:bold;color:white;font-size:16px;">F</div>
        <span style="color:white;font-weight:bold;font-size:18px;">${company}</span>
      </div>
    </div>
    <!-- Body -->
    <div style="padding:32px;">
      <p style="color:#c4c4d4;margin:0 0 20px;font-size:15px;line-height:1.6;">
        Dear <strong style="color:#f1f1f7;">${clientName}</strong>,
      </p>
      <p style="color:#c4c4d4;margin:0 0 24px;font-size:15px;line-height:1.6;">
        ${t.intro} Invoice <strong style="color:#6b96ff;">${invoiceNumber}</strong>.
      </p>
      <!-- Invoice Card -->
      <div style="background:#1a1a2e;border:1px solid rgba(95,135,255,0.15);border-radius:12px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#7474a0;font-size:13px;padding-bottom:12px;">Invoice Number</td>
            <td style="color:#6b96ff;font-size:13px;font-family:monospace;text-align:right;padding-bottom:12px;">${invoiceNumber}</td>
          </tr>
          <tr>
            <td style="color:#7474a0;font-size:13px;padding-bottom:12px;">Amount Due</td>
            <td style="color:#f87171;font-size:18px;font-weight:bold;text-align:right;padding-bottom:12px;">${amount}</td>
          </tr>
          <tr>
            <td style="color:#7474a0;font-size:13px;">Due Date</td>
            <td style="color:#fbbf24;font-size:13px;text-align:right;">${formattedDue}</td>
          </tr>
        </table>
      </div>
      <p style="color:#c4c4d4;margin:0 0 28px;font-size:14px;line-height:1.6;">${t.tone}</p>
      <!-- CTA -->
      <a href="mailto:${''}" style="display:inline-block;background:linear-gradient(135deg,#3d61ff,#7c3aed);color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">
        Reply to this email →
      </a>
    </div>
    <!-- Footer -->
    <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);">
      <p style="color:#4a4a6a;font-size:12px;margin:0;">
        This follow-up was sent by <strong>${senderName}</strong> via Flowcent Payment Intelligence Platform.
      </p>
    </div>
  </div>
</body>
</html>`;

    return { subject: t.subject, html };
}
