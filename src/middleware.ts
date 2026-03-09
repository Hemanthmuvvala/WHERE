import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/police'];
const publicRoutes = ['/', '/login', '/signup'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (publicRoutes.some((r) => pathname === r)) {
        return NextResponse.next();
    }

    // Allow API routes and static files
    if (
        pathname.startsWith('/api/') ||
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/favicon')
    ) {
        return NextResponse.next();
    }

    // Check if route needs protection
    const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));

    if (isProtected) {
        // We rely on client-side auth guards for redirect; middleware just passes
        // The client AuthContext will redirect if no user
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
