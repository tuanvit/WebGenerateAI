import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { logger } from './lib/logger'

export default withAuth(
    function middleware(req) {
        // Log the request
        const requestId = logger.logRequest(req);

        // Add request ID to response headers for tracking
        const response = NextResponse.next();
        response.headers.set('X-Request-ID', requestId);

        return response;
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // Check if user is authenticated for protected routes
                const { pathname } = req.nextUrl

                // Public routes that don't require authentication
                const publicRoutes = [
                    '/',
                    '/auth/signin',
                    '/auth/error',
                    '/api/auth',
                ]

                // API routes that require authentication
                const protectedApiRoutes = [
                    '/api/prompts',
                    '/api/library',
                    '/api/community/content',
                    '/api/users',
                ]

                // Page routes that require authentication
                const protectedPageRoutes = [
                    '/library',
                    '/profile',
                    '/generate',
                ]

                // Check if route is public
                if (publicRoutes.some(route => pathname.startsWith(route))) {
                    return true
                }

                // Check if route requires authentication
                const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route))
                const isProtectedPage = protectedPageRoutes.some(route => pathname.startsWith(route))

                if (isProtectedApi || isProtectedPage) {
                    // Require authentication
                    const isAuthorized = !!token;

                    // Log authentication attempts
                    if (!isAuthorized) {
                        logger.warn('Unauthorized access attempt', {
                            path: pathname,
                            userAgent: req.headers.get('user-agent'),
                            ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
                        });
                    }

                    return isAuthorized;
                }

                // Allow access to other routes
                return true
            },
        },
    }
)

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    ],
}