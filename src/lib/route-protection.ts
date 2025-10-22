import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';

/**
 * Simple authentication check for API routes
 * Returns user session if authenticated, throws error if not
 */
export async function requireAuth(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        throw new Error('UNAUTHORIZED');
    }

    return session;
}

/**
 * Check if user owns a specific resource
 */
export async function requireOwnership(userId: string, resourceUserId: string) {
    if (userId !== resourceUserId) {
        throw new Error('FORBIDDEN');
    }
}

/**
 * Handle authentication errors consistently
 */
export function handleAuthError(error: Error) {
    if (error.message === 'UNAUTHORIZED') {
        return NextResponse.json(
            {
                error: 'Vui lòng đăng nhập để sử dụng tính năng này',
                code: 'UNAUTHORIZED'
            },
            { status: 401 }
        );
    }

    if (error.message === 'FORBIDDEN') {
        return NextResponse.json(
            {
                error: 'Bạn không có quyền truy cập tài nguyên này',
                code: 'FORBIDDEN'
            },
            { status: 403 }
        );
    }

    return NextResponse.json(
        {
            error: 'Có lỗi xảy ra khi xác thực. Vui lòng thử lại.',
            code: 'AUTH_ERROR'
        },
        { status: 500 }
    );
}

/**
 * Protected route wrapper
 */
export function withAuthProtection(
    handler: (request: NextRequest, context: any, session: any) => Promise<NextResponse>
) {
    return async (request: NextRequest, context: any = {}) => {
        try {
            const session = await requireAuth(request);
            return await handler(request, context, session);
        } catch (error) {
            return handleAuthError(error as Error);
        }
    };
}

/**
 * Rate limiting for API routes (simple in-memory implementation)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(userId: string, maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
    const now = Date.now();
    const userLimit = rateLimitStore.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
        rateLimitStore.set(userId, { count: 1, resetTime: now + windowMs });
        return true;
    }

    if (userLimit.count >= maxRequests) {
        return false;
    }

    userLimit.count++;
    rateLimitStore.set(userId, userLimit);
    return true;
}

/**
 * Content moderation helpers
 */
export function validateVietnameseContent(content: string): boolean {
    // Basic content validation for Vietnamese educational content
    if (!content || content.trim().length === 0) {
        return false;
    }

    // Check for minimum length
    if (content.length < 10) {
        return false;
    }

    // Check for maximum length
    if (content.length > 10000) {
        return false;
    }

    // Add more validation rules as needed
    return true;
}

/**
 * Grade level validation for Vietnamese education system
 */
export function validateGradeLevel(gradeLevel: number): boolean {
    return [6, 7, 8, 9].includes(gradeLevel);
}

/**
 * Subject validation for Vietnamese curriculum
 */
export function validateSubject(subject: string): boolean {
    const validSubjects = [
        'Toán học',
        'Ngữ văn',
        'Tiếng Anh',
        'Lịch sử',
        'Địa lý',
        'Vật lý',
        'Hóa học',
        'Sinh học',
        'GDCD',
        'Thể dục',
        'Công nghệ',
        'Mỹ thuật',
        'Âm nhạc'
    ];

    return validSubjects.some(validSubject =>
        subject.toLowerCase().includes(validSubject.toLowerCase())
    );
}