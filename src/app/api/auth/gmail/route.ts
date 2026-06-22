import { NextRequest, NextResponse } from 'next/server';
import { getGmailAuthUrl } from '@/lib/gmail';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
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

        // Check env vars are set
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
            return NextResponse.json(
                { error: 'Gmail integration not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env' },
                { status: 503 }
            );
        }

        const authUrl = getGmailAuthUrl(userInfo.userId);
        return NextResponse.json({ authUrl });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
