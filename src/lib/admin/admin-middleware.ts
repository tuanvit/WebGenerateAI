/**
 * Admin middleware for API routes
 * Provides error handling, authentication, and logging for admin operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { AdminUser, requireAdminRole } from './admin-auth';
import { AdminAction, AdminResource, logAdminAction } from './admin-audit';
import { handleAdminError, isAdminError } from './admin-errors';
import { getClientIP, getUserAgent } from './index';

export interface AdminApiContext {
    user: AdminUser;
    req: NextRequest;
    ipAddress: string;
    userAgent: string;
}

/**
 * Middleware wrapper for admin API routes
 */
export const withAdminMiddleware = (
    handler: (context: AdminApiContext) => Promise<NextResponse>,
    options?: {
        logAction?: AdminAction;
        logResource?: AdminResource;
        requireAuth?: boolean;
    }
) => {
    return async (req: NextRequest): Promise<NextResponse> => {
        try {
            // Extract client information
            const ipAddress = getClientIP(req);
            const userAgent = getUserAgent(req);

            // Require admin authentication if specified (default: true)
            const requireAuth = options?.requireAuth !== false;
            let user: AdminUser | undefined;

            if (requireAuth) {
                user = await requireAdminRole(req);
            }

            // Create context
            const context: AdminApiContext = {
                user: user!,
                req,
                ipAddress,
                userAgent
            };

            // Execute the handler
            const response = await handler(context);

            // Log the action if specified
            if (options?.logAction && options?.logResource && user) {
                await logAdminAction(
                    user,
                    options.logAction,
                    options.logResource,
                    undefined,
                    {
                        method: req.method,
                        url: req.url,
                        success: response.status < 400
                    },
                    ipAddress,
                    userAgent
                );
            }

            return response;
        } catch (error) {
            console.error('Admin middleware error:', error);

            const adminError = handleAdminError(error);

            // Log failed action if specified
            if (options?.logAction && options?.logResource) {
                try {
                    const user = await requireAdminRole(req).catch(() => null);
                    if (user) {
                        await logAdminAction(
                            user,
                            options.logAction,
                            options.logResource,
                            undefined,
                            {
                                method: req.method,
                                url: req.url,
                                success: false,
                                error: adminError.message
                            },
                            getClientIP(req),
                            getUserAgent(req)
                        );
                    }
                } catch (logError) {
                    console.error('Error logging failed action:', logError);
                }
            }

            return NextResponse.json(
                {
                    error: adminError.message,
                    code: adminError.code,
                    ...(process.env.NODE_ENV === 'development' && { details: adminError.details })
                },
                { status: adminError.statusCode }
            );
        }
    };
};

/**
 * Middleware for handling JSON requests
 */
export const withJsonBody = <T = any>(
    handler: (context: AdminApiContext & { body: T }) => Promise<NextResponse>
) => {
    return withAdminMiddleware(async (context) => {
        try {
            const body = await context.req.json() as T;
            return await handler({ ...context, body });
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid JSON body', code: 'INVALID_JSON' },
                { status: 400 }
            );
        }
    });
};

/**
 * Middleware for handling form data requests
 */
export const withFormData = (
    handler: (context: AdminApiContext & { formData: FormData }) => Promise<NextResponse>
) => {
    return withAdminMiddleware(async (context) => {
        try {
            const formData = await context.req.formData();
            return await handler({ ...context, formData });
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid form data', code: 'INVALID_FORM_DATA' },
                { status: 400 }
            );
        }
    });
};

/**
 * Middleware for handling query parameters
 */
export const withQueryParams = <T = Record<string, string>>(
    handler: (context: AdminApiContext & { query: T }) => Promise<NextResponse>
) => {
    return withAdminMiddleware(async (context) => {
        const url = new URL(context.req.url);
        const query = Object.fromEntries(url.searchParams.entries()) as T;
        return await handler({ ...context, query });
    });
};

/**
 * CORS middleware for admin API routes
 */
export const withCors = (
    handler: (context: AdminApiContext) => Promise<NextResponse>,
    options?: {
        origin?: string | string[];
        methods?: string[];
        headers?: string[];
    }
) => {
    return withAdminMiddleware(async (context) => {
        const response = await handler(context);

        // Add CORS headers
        const origin = options?.origin || process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const methods = options?.methods || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
        const headers = options?.headers || ['Content-Type', 'Authorization'];

        response.headers.set('Access-Control-Allow-Origin', Array.isArray(origin) ? origin[0] : origin);
        response.headers.set('Access-Control-Allow-Methods', methods.join(', '));
        response.headers.set('Access-Control-Allow-Headers', headers.join(', '));
        response.headers.set('Access-Control-Max-Age', '86400');

        return response;
    });
};

/**
 * Rate limiting middleware
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const withRateLimit = (
    handler: (context: AdminApiContext) => Promise<NextResponse>,
    options?: {
        windowMs?: number;
        maxRequests?: number;
    }
) => {
    const windowMs = options?.windowMs || 15 * 60 * 1000; // 15 minutes
    const maxRequests = options?.maxRequests || 100;

    return withAdminMiddleware(async (context) => {
        const key = `${context.user.id}:${context.ipAddress}`;
        const now = Date.now();
        const windowStart = now - windowMs;

        // Clean up old entries
        for (const [k, v] of rateLimitMap.entries()) {
            if (v.resetTime < windowStart) {
                rateLimitMap.delete(k);
            }
        }

        // Check current rate limit
        const current = rateLimitMap.get(key);
        if (current && current.count >= maxRequests) {
            return NextResponse.json(
                {
                    error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
                    code: 'RATE_LIMIT_EXCEEDED'
                },
                { status: 429 }
            );
        }

        // Update rate limit
        if (current) {
            current.count++;
        } else {
            rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
        }

        return await handler(context);
    });
};

/**
 * Validation middleware with sanitization
 */
export const withValidation = <T>(
    validator: (data: unknown) => T,
    handler: (context: AdminApiContext & { validatedData: T }) => Promise<NextResponse>,
    options?: { sanitize?: boolean }
) => {
    return withJsonBody<unknown>(async (context) => {
        try {
            // Import sanitization functions
            const { sanitizeJson } = await import('./admin-sanitization');

            // Sanitize input if requested (default: true)
            let processedBody = context.body;
            if (options?.sanitize !== false) {
                processedBody = sanitizeJson(context.body);
            }

            const validatedData = validator(processedBody);
            return await handler({ ...context, validatedData });
        } catch (error) {
            if (isAdminError(error)) {
                throw error;
            }
            return NextResponse.json(
                { error: 'Validation failed', code: 'VALIDATION_ERROR' },
                { status: 400 }
            );
        }
    });
};

/**
 * File upload validation middleware
 */
export const withFileValidation = (
    handler: (context: AdminApiContext & { file: File; validatedFile: any }) => Promise<NextResponse>
) => {
    return withFormData(async (context) => {
        try {
            const { validateFile } = await import('./admin-sanitization');

            const file = context.formData.get('file') as File;
            if (!file) {
                return NextResponse.json(
                    { error: 'Không tìm thấy file', code: 'FILE_REQUIRED' },
                    { status: 400 }
                );
            }

            // Validate file
            validateFile({
                name: file.name,
                size: file.size,
                type: file.type
            });

            return await handler({ ...context, file, validatedFile: file });
        } catch (error) {
            if (isAdminError(error)) {
                throw error;
            }
            return NextResponse.json(
                { error: 'File validation failed', code: 'FILE_VALIDATION_ERROR' },
                { status: 400 }
            );
        }
    });
};

/**
 * Search query sanitization middleware
 */
export const withSearchValidation = (
    handler: (context: AdminApiContext & { searchParams: Record<string, string> }) => Promise<NextResponse>
) => {
    return withAdminMiddleware(async (context) => {
        try {
            const { sanitizeSearchQuery } = await import('./admin-sanitization');

            const url = new URL(context.req.url);
            const searchParams: Record<string, string> = {};

            for (const [key, value] of url.searchParams.entries()) {
                searchParams[key] = sanitizeSearchQuery(value);
            }

            return await handler({ ...context, searchParams });
        } catch (error) {
            if (isAdminError(error)) {
                throw error;
            }
            return NextResponse.json(
                { error: 'Search validation failed', code: 'SEARCH_VALIDATION_ERROR' },
                { status: 400 }
            );
        }
    });
};

/**
 * Combine multiple middlewares
 */
export const combineMiddlewares = (...middlewares: Array<(handler: any) => any>) => {
    return (handler: any) => {
        return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
    };
};