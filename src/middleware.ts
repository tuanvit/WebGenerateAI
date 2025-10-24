import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the request is for admin routes
    if (pathname.startsWith('/admin')) {
        // For now, we'll let the AdminLayout component handle authentication and role checking
        // This is because middleware runs on the edge and has limited access to session data
        // The AdminLayout component will redirect users who are not authenticated or don't have admin role

        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*'
    ]
};