import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware temporarily disabled - auth is handled client-side via auth-context
// The issue was that token is stored in localStorage, not cookies
export function middleware(request: NextRequest) {
    // Allow all requests for now - client-side auth-context handles protection
    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*'],
};
