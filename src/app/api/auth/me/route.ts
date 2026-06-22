import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'No authorization token provided' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);

        // Verify JWT token
        const userInfo = verifyToken(token);

        if (!userInfo) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        // Return user info from JWT (stored during login/signup)
        return NextResponse.json({
            user: {
                id: userInfo.userId,
                email: userInfo.email,
                name: null, // Will be populated from localStorage on client
                companyName: null,
            },
        });
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
