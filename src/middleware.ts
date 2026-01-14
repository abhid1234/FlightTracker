import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory store for rate limiting. 
// Note: This is instance-local on Cloud Run.
const rateLimitStore = new Map<string, { count: number; lastReset: number }>();

const LIMIT = 20; // max requests
const WINDOW = 60 * 1000; // 1 minute window

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only rate limit API and search-related paths
    // Exclude static assets, _next paths, etc.
    const isApi = pathname.startsWith('/api/');
    const isSearch = pathname === '/' && request.nextUrl.searchParams.has('query');
    const isAirportDashboard = pathname.startsWith('/airport-dashboard');

    if (!isApi && !isSearch && !isAirportDashboard) {
        return NextResponse.next();
    }

    // Get IP from headers (Cloud Run provides x-forwarded-for)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

    const now = Date.now();
    const userRecord = rateLimitStore.get(ip) || { count: 0, lastReset: now };

    // Reset if window has passed
    if (now - userRecord.lastReset > WINDOW) {
        userRecord.count = 0;
        userRecord.lastReset = now;
    }

    userRecord.count++;
    rateLimitStore.set(ip, userRecord);

    if (userRecord.count > LIMIT) {
        console.warn(`[RateLimit] Blocked IP: ${ip} for path: ${pathname}`);
        return new NextResponse(
            JSON.stringify({ error: 'Too many requests. Please try again in a minute.' }),
            {
                status: 429,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public (public assets)
         */
        '/((?!_next/static|_next/image|favicon.ico|public|logo.png|blog_images).*)',
    ],
};
