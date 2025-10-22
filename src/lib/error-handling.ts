import { z } from 'zod';
import { NextResponse } from 'next/server';

// Error types for the application
export enum ErrorType {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
    NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
    RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
    DATABASE_ERROR = 'DATABASE_ERROR',
    EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}

// Base error class for application errors
export class AppError extends Error {
    public readonly type: ErrorType;
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly details?: unknown;

    constructor(
        message: string,
        type: ErrorType,
        statusCode: number,
        isOperational = true,
        details?: unknown
    ) {
        super(message);
        this.type = type;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Specific error classes
export class ValidationError extends AppError {
    constructor(message: string, details?: unknown) {
        super(message, ErrorType.VALIDATION_ERROR, 400, true, details);
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Vui lòng đăng nhập để sử dụng tính năng này') {
        super(message, ErrorType.AUTHENTICATION_ERROR, 401);
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Bạn không có quyền truy cập tài nguyên này') {
        super(message, ErrorType.AUTHORIZATION_ERROR, 403);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Không tìm thấy tài nguyên yêu cầu') {
        super(message, ErrorType.NOT_FOUND_ERROR, 404);
    }
}

export class RateLimitError extends AppError {
    constructor(message: string = 'Quá nhiều yêu cầu. Vui lòng thử lại sau.') {
        super(message, ErrorType.RATE_LIMIT_ERROR, 429);
    }
}

export class DatabaseError extends AppError {
    constructor(message: string = 'Lỗi cơ sở dữ liệu. Vui lòng thử lại sau.', details?: unknown) {
        super(message, ErrorType.DATABASE_ERROR, 500, true, details);
    }
}

export class ExternalServiceError extends AppError {
    constructor(message: string = 'Lỗi dịch vụ bên ngoài. Vui lòng thử lại sau.', details?: unknown) {
        super(message, ErrorType.EXTERNAL_SERVICE_ERROR, 502, true, details);
    }
}

// Vietnamese error messages for common validation scenarios
export const VIETNAMESE_ERROR_MESSAGES = {
    // Common validation errors
    required: 'Trường này là bắt buộc',
    invalid_email: 'Email không hợp lệ',
    invalid_format: 'Định dạng không hợp lệ',
    too_short: 'Quá ngắn',
    too_long: 'Quá dài',
    invalid_number: 'Số không hợp lệ',
    out_of_range: 'Giá trị nằm ngoài phạm vi cho phép',

    // Educational specific errors
    invalid_grade_level: 'Khối lớp phải từ 6 đến 9',
    invalid_subject: 'Môn học không hợp lệ',
    invalid_pedagogical_standard: 'Chuẩn sư phạm không hợp lệ',
    lesson_name_required: 'Tên bài học không được để trống',
    lesson_name_too_long: 'Tên bài học quá dài (tối đa 200 ký tự)',
    curriculum_content_required: 'Nội dung chương trình không được để trống',
    curriculum_content_too_short: 'Nội dung chương trình quá ngắn (tối thiểu 10 ký tự)',
    curriculum_content_too_long: 'Nội dung chương trình quá dài (tối đa 5000 ký tự)',
    topic_required: 'Chủ đề không được để trống',
    topic_too_long: 'Chủ đề quá dài (tối đa 200 ký tự)',
    invalid_slide_count: 'Số slide phải từ 3 đến 20',
    invalid_question_count: 'Số câu hỏi phải từ 1 đến 50',
    bloom_levels_required: 'Phải chọn ít nhất một mức độ tư duy',

    // Authentication errors
    login_required: 'Vui lòng đăng nhập để sử dụng tính năng này',
    invalid_credentials: 'Thông tin đăng nhập không chính xác',
    session_expired: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại',

    // Authorization errors
    insufficient_permissions: 'Bạn không có quyền thực hiện hành động này',
    resource_access_denied: 'Bạn không có quyền truy cập tài nguyên này',

    // Server errors
    internal_server_error: 'Có lỗi xảy ra trên máy chủ. Vui lòng thử lại sau',
    database_error: 'Lỗi cơ sở dữ liệu. Vui lòng thử lại sau',
    external_service_error: 'Lỗi dịch vụ bên ngoài. Vui lòng thử lại sau',

    // Rate limiting
    rate_limit_exceeded: 'Quá nhiều yêu cầu. Vui lòng thử lại sau {minutes} phút',

    // Not found errors
    user_not_found: 'Không tìm thấy người dùng',
    prompt_not_found: 'Không tìm thấy prompt',
    content_not_found: 'Không tìm thấy nội dung',
} as const;

// Error response formatter
export interface ErrorResponse {
    error: string;
    type: ErrorType;
    details?: unknown;
    timestamp: string;
}

export function formatErrorResponse(error: AppError | Error): ErrorResponse {
    if (error instanceof AppError) {
        return {
            error: error.message,
            type: error.type,
            details: error.details,
            timestamp: new Date().toISOString()
        };
    }

    // Handle unknown errors
    return {
        error: VIETNAMESE_ERROR_MESSAGES.internal_server_error,
        type: ErrorType.INTERNAL_SERVER_ERROR,
        timestamp: new Date().toISOString()
    };
}

// API error handler
export function handleApiError(error: unknown): NextResponse {
    console.error('API Error:', error);

    if (error instanceof AppError) {
        return NextResponse.json(
            formatErrorResponse(error),
            { status: error.statusCode }
        );
    }

    if (error instanceof z.ZodError) {
        const validationError = new ValidationError(
            'Dữ liệu đầu vào không hợp lệ',
            error.errors.map(err => ({
                field: err.path.join('.'),
                message: getVietnameseZodErrorMessage(err)
            }))
        );
        return NextResponse.json(
            formatErrorResponse(validationError),
            { status: validationError.statusCode }
        );
    }

    // Handle Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
        const prismaError = error as { code: string; message: string };

        switch (prismaError.code) {
            case 'P2002':
                const duplicateError = new ValidationError('Dữ liệu đã tồn tại');
                return NextResponse.json(
                    formatErrorResponse(duplicateError),
                    { status: duplicateError.statusCode }
                );
            case 'P2025':
                const notFoundError = new NotFoundError('Không tìm thấy bản ghi');
                return NextResponse.json(
                    formatErrorResponse(notFoundError),
                    { status: notFoundError.statusCode }
                );
            default:
                const dbError = new DatabaseError();
                return NextResponse.json(
                    formatErrorResponse(dbError),
                    { status: dbError.statusCode }
                );
        }
    }

    // Default error response
    const internalError = new AppError(
        VIETNAMESE_ERROR_MESSAGES.internal_server_error,
        ErrorType.INTERNAL_SERVER_ERROR,
        500,
        false
    );

    return NextResponse.json(
        formatErrorResponse(internalError),
        { status: internalError.statusCode }
    );
}

// Convert Zod errors to Vietnamese messages
export function getVietnameseZodErrorMessage(error: z.ZodIssue): string {
    switch (error.code) {
        case 'invalid_type':
            if (error.expected === 'string') return 'Phải là chuỗi ký tự';
            if (error.expected === 'number') return 'Phải là số';
            if (error.expected === 'boolean') return 'Phải là true/false';
            return 'Kiểu dữ liệu không hợp lệ';

        case 'too_small':
            if (error.type === 'string') {
                return `Tối thiểu ${error.minimum} ký tự`;
            }
            if (error.type === 'number') {
                return `Giá trị tối thiểu là ${error.minimum}`;
            }
            if (error.type === 'array') {
                return `Phải có ít nhất ${error.minimum} phần tử`;
            }
            return 'Giá trị quá nhỏ';

        case 'too_big':
            if (error.type === 'string') {
                return `Tối đa ${error.maximum} ký tự`;
            }
            if (error.type === 'number') {
                return `Giá trị tối đa là ${error.maximum}`;
            }
            if (error.type === 'array') {
                return `Tối đa ${error.maximum} phần tử`;
            }
            return 'Giá trị quá lớn';

        case 'invalid_string':
            if (error.validation === 'email') return 'Email không hợp lệ';
            if (error.validation === 'url') return 'URL không hợp lệ';
            return 'Chuỗi không hợp lệ';

        case 'invalid_enum_value':
            return `Giá trị phải là một trong: ${error.options.join(', ')}`;

        case 'invalid_literal':
            return `Giá trị phải là: ${error.expected}`;

        default:
            return error.message || 'Dữ liệu không hợp lệ';
    }
}

// Async error wrapper for API routes
export function asyncHandler(
    handler: (req: Request, context?: any) => Promise<NextResponse>
) {
    return async (req: Request, context?: any): Promise<NextResponse> => {
        try {
            return await handler(req, context);
        } catch (error) {
            return handleApiError(error);
        }
    };
}

// Client-side error handler
export function handleClientError(error: unknown): string {
    if (error && typeof error === 'object' && 'message' in error) {
        return (error as { message: string }).message;
    }

    if (typeof error === 'string') {
        return error;
    }

    return VIETNAMESE_ERROR_MESSAGES.internal_server_error;
}