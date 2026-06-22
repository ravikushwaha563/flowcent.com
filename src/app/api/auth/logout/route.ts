import { NextResponse } from 'next/server';

export async function POST() {
    // Logout is handled client-side by removing the token
    // This endpoint exists for consistency and future server-side session management
    return NextResponse.json({
        success: true,
        message: 'Logged out successfully',
    });
}
