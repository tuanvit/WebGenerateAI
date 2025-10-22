import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';

/**
 * Authentication middleware for API routes
 * Checks if user is authenticated and adds user info to request
 */
export async function withAuth(
    handler: (request: NextRequest, context: { params?: any }, session: any) => Promise<NextResponse>
) {
    return async (request: NextRequest, context: { params?: any } = {}) => {
        try {
            const session = await getServerSession(authOptions);

            if (!session?.user?.id) {
                return NextResponse.json(
                    {
                        error: 'Vui lòng đăng nhập để sử dụng tính năng này',
                        code: 'UNAUTHORIZED'
                    },
                    { status: 401 }
                );
            }

            return handler(request, context, session);
        } catch (error) {
            console.error('Authentication middleware error:', error);
            return NextResponse.json(
                {
                    error: 'Có lỗi xảy ra khi xác thực. Vui lòng thử lại.',
                    code: 'AUTH_ERROR'
                },
                { status: 500 }
            );
        }
    };
}

/**
 * Optional authentication middleware
 * Adds user info to request if authenticated, but doesn't require authentication
 */
export async function withOptionalAuth(
    handler: (request: NextRequest, context: { params?: any }, session: any | null) => Promise<NextResponse>
) {
    return async (request: NextRequest, context: { params?: any } = {}) => {
        try {
            const session = await getServerSession(authOptions);
            return handler(request, context, session);
        } catch (error) {
            console.error('Optional authentication middleware error:', error);
            return handler(request, context, null);
        }
    };
}

/**
 * Role-based access control middleware
 * Checks if user has required role (for future use)
 */
export async function withRole(
    requiredRole: string,
    handler: (request: NextRequest, context: { params?: any }, session: any) => Promise<NextResponse>
) {
    return async (request: NextRequest, context: { params?: any } = {}) => {
        try {
            const session = await getServerSession(authOptions);

            if (!session?.user?.id) {
                return NextResponse.json(
                    {
                        error: 'Vui lòng đăng nhập để sử dụng tính năng này',
                        code: 'UNAUTHORIZED'
                    },
                    { status: 401 }
                );
            }

            // For now, all authenticated users have the same role
            // This can be extended in the future with user roles
            const userRole = (session.user as any).role || 'teacher';

            if (userRole !== requiredRole && requiredRole !== 'teacher') {
                return NextResponse.json(
                    {
                        error: 'Bạn không có quyền truy cập tính năng này',
                        code: 'FORBIDDEN'
                    },
                    { status: 403 }
                );
            }

            return handler(request, context, session);
        } catch (error) {
            console.error('Role-based authentication middleware error:', error);
            return NextResponse.json(
                {
                    error: 'Có lỗi xảy ra khi xác thực quyền. Vui lòng thử lại.',
                    code: 'AUTH_ERROR'
                },
                { status: 500 }
            );
        }
    };
}

/**
 * Rate limiting middleware (basic implementation)
 * Limits requests per user per time window
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function withRateLimit(
    maxRequests: number = 100,
    windowMs: number = 15 * 60 * 1000, // 15 minutes
    handler: (request: NextRequest, context: { params?: any }, session: any) => Promise<NextResponse>
) {
    return async (request: NextRequest, context: { params?: any } = {}) => {
        try {
            const session = await getServerSession(authOptions);

            if (!session?.user?.id) {
                return NextResponse.json(
                    {
                        error: 'Vui lòng đăng nhập để sử dụng tính năng này',
                        code: 'UNAUTHORIZED'
                    },
                    { status: 401 }
                );
            }

            const userId = session.user.id;
            const now = Date.now();
            const userLimit = rateLimitMap.get(userId);

            if (!userLimit || now > userLimit.resetTime) {
                // Reset or initialize rate limit
                rateLimitMap.set(userId, {
                    count: 1,
                    resetTime: now + windowMs
                });
            } else if (userLimit.count >= maxRequests) {
                // Rate limit exceeded
                return NextResponse.json(
                    {
                        error: 'Bạn đã vượt quá giới hạn số lần gọi API. Vui lòng thử lại sau.',
                        code: 'RATE_LIMIT_EXCEEDED',
                        retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
                    },
                    {
                        status: 429,
                        headers: {
                            'Retry-After': Math.ceil((userLimit.resetTime - now) / 1000).toString()
                        }
                    }
                );
            } else {
                // Increment count
                userLimit.count++;
                rateLimitMap.set(userId, userLimit);
            }

            return handler(request, context, session);
        } catch (error) {
            console.error('Rate limiting middleware error:', error);
            return NextResponse.json(
                {
                    error: 'Có lỗi xảy ra khi kiểm tra giới hạn. Vui lòng thử lại.',
                    code: 'RATE_LIMIT_ERROR'
                },
                { status: 500 }
            );
        }
    };
}

/**
 * Content ownership middleware
 * Checks if user owns the content they're trying to modify
 */
export async function withContentOwnership(
    getContentUserId: (contentId: string) => Promise<string | null>,
    handler: (request: NextRequest, context: { params?: any }, session: any) => Promise<NextResponse>
) {
    return async (request: NextRequest, context: { params?: any } = {}) => {
        try {
            const session = await getServerSession(authOptions);

            if (!session?.user?.id) {
                return NextResponse.json(
                    {
                        error: 'Vui lòng đăng nhập để sử dụng tính năng này',
                        code: 'UNAUTHORIZED'
                    },
                    { status: 401 }
                );
            }

            const contentId = context.params?.id;
            if (!contentId) {
                return NextResponse.json(
                    {
                        error: 'ID nội dung không hợp lệ',
                        code: 'INVALID_CONTENT_ID'
                    },
                    { status: 400 }
                );
            }

            const contentUserId = await getContentUserId(contentId);
            if (!contentUserId) {
                return NextResponse.json(
                    {
                        error: 'Không tìm thấy nội dung',
                        code: 'CONTENT_NOT_FOUND'
                    },
                    { status: 404 }
                );
            }

            if (contentUserId !== session.user.id) {
                return NextResponse.json(
                    {
                        error: 'Bạn không có quyền truy cập nội dung này',
                        code: 'FORBIDDEN'
                    },
                    { status: 403 }
                );
            }

            return handler(request, context, session);
        } catch (error) {
            console.error('Content ownership middleware error:', error);
            return NextResponse.json(
                {
                    error: 'Có lỗi xảy ra khi kiểm tra quyền sở hữu. Vui lòng thử lại.',
                    code: 'OWNERSHIP_ERROR'
                },
                { status: 500 }
            );
        }
    };
}

/**
 * Input validation middleware
 * Validates request body against a Zod schema
 */
export function withValidation<T>(
    schema: any, // Zod schema
    handler: (request: NextRequest, context: { params?: any }, session: any, validatedData: T) => Promise<NextResponse>
) {
    return async (request: NextRequest, context: { params?: any } = {}) => {
        try {
            const session = await getServerSession(authOptions);

            if (!session?.user?.id) {
                return NextResponse.json(
                    {
                        error: 'Vui lòng đăng nhập để sử dụng tính năng này',
                        code: 'UNAUTHORIZED'
                    },
                    { status: 401 }
                );
            }

            const body = await request.json();
            const validatedData = schema.parse(body);

            return handler(request, context, session, validatedData);
        } catch (error) {
            if (error instanceof Error && error.name === 'ZodError') {
                return NextResponse.json(
                    {
                        error: 'Dữ liệu đầu vào không hợp lệ',
                        code: 'VALIDATION_ERROR',
                        details: (error as any).errors?.map((err: any) => ({
                            field: err.path.join('.'),
                            message: err.message
                        }))
                    },
                    { status: 400 }
                );
            }

            console.error('Validation middleware error:', error);
            return NextResponse.json(
                {
                    error: 'Có lỗi xảy ra khi xác thực dữ liệu. Vui lòng thử lại.',
                    code: 'VALIDATION_ERROR'
                },
                { status: 500 }
            );
        }
    };
}

/**
 * Combine multiple middleware functions
 */
export function combineMiddleware(...middlewares: any[]) {
    return (handler: any) => {
        return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
    };
}