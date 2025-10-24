/**
 * Admin-specific error handling utilities
 * Provides Vietnamese error messages and proper error classification
 */

export class AdminError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 500,
        public details?: any
    ) {
        super(message);
        this.name = 'AdminError';
    }
}

export enum AdminErrorCode {
    // Authentication & Authorization
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    INVALID_ADMIN_ROLE = 'INVALID_ADMIN_ROLE',

    // Validation Errors
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    INVALID_INPUT = 'INVALID_INPUT',
    MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

    // Database Errors
    DATABASE_ERROR = 'DATABASE_ERROR',
    RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
    DUPLICATE_RECORD = 'DUPLICATE_RECORD',
    FOREIGN_KEY_CONSTRAINT = 'FOREIGN_KEY_CONSTRAINT',

    // AI Tools Errors
    AI_TOOL_NOT_FOUND = 'AI_TOOL_NOT_FOUND',
    AI_TOOL_ALREADY_EXISTS = 'AI_TOOL_ALREADY_EXISTS',
    INVALID_AI_TOOL_CATEGORY = 'INVALID_AI_TOOL_CATEGORY',

    // Template Errors
    TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
    TEMPLATE_ALREADY_EXISTS = 'TEMPLATE_ALREADY_EXISTS',
    INVALID_TEMPLATE_VARIABLE = 'INVALID_TEMPLATE_VARIABLE',

    // File Operations
    FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',
    FILE_TOO_LARGE = 'FILE_TOO_LARGE',
    INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',

    // Bulk Operations
    BULK_OPERATION_FAILED = 'BULK_OPERATION_FAILED',
    BULK_VALIDATION_ERROR = 'BULK_VALIDATION_ERROR',

    // Backup & Restore Operations
    BACKUP_FAILED = 'BACKUP_FAILED',
    BACKUP_NOT_FOUND = 'BACKUP_NOT_FOUND',
    BACKUP_INCOMPLETE = 'BACKUP_INCOMPLETE',
    BACKUP_CORRUPTED = 'BACKUP_CORRUPTED',
    RESTORE_FAILED = 'RESTORE_FAILED',
    EXPORT_FAILED = 'EXPORT_FAILED',
    IMPORT_FAILED = 'IMPORT_FAILED',
    INVALID_BACKUP_DATA = 'INVALID_BACKUP_DATA',

    // General
    NOT_FOUND = 'NOT_FOUND',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}

export const AdminErrorMessages: Record<AdminErrorCode, string> = {
    // Authentication & Authorization
    [AdminErrorCode.UNAUTHORIZED]: 'Bạn chưa đăng nhập vào hệ thống',
    [AdminErrorCode.FORBIDDEN]: 'Bạn không có quyền truy cập chức năng này',
    [AdminErrorCode.INVALID_ADMIN_ROLE]: 'Chỉ quản trị viên mới có thể truy cập',

    // Validation Errors
    [AdminErrorCode.VALIDATION_ERROR]: 'Dữ liệu không hợp lệ',
    [AdminErrorCode.INVALID_INPUT]: 'Thông tin nhập vào không đúng định dạng',
    [AdminErrorCode.MISSING_REQUIRED_FIELD]: 'Thiếu thông tin bắt buộc',

    // Database Errors
    [AdminErrorCode.DATABASE_ERROR]: 'Lỗi cơ sở dữ liệu',
    [AdminErrorCode.RECORD_NOT_FOUND]: 'Không tìm thấy bản ghi',
    [AdminErrorCode.DUPLICATE_RECORD]: 'Bản ghi đã tồn tại',
    [AdminErrorCode.FOREIGN_KEY_CONSTRAINT]: 'Không thể xóa do có dữ liệu liên quan',

    // AI Tools Errors
    [AdminErrorCode.AI_TOOL_NOT_FOUND]: 'Không tìm thấy công cụ AI',
    [AdminErrorCode.AI_TOOL_ALREADY_EXISTS]: 'Công cụ AI đã tồn tại',
    [AdminErrorCode.INVALID_AI_TOOL_CATEGORY]: 'Danh mục công cụ AI không hợp lệ',

    // Template Errors
    [AdminErrorCode.TEMPLATE_NOT_FOUND]: 'Không tìm thấy template',
    [AdminErrorCode.TEMPLATE_ALREADY_EXISTS]: 'Template đã tồn tại',
    [AdminErrorCode.INVALID_TEMPLATE_VARIABLE]: 'Biến template không hợp lệ',

    // File Operations
    [AdminErrorCode.FILE_UPLOAD_ERROR]: 'Lỗi tải file lên',
    [AdminErrorCode.FILE_TOO_LARGE]: 'File quá lớn',
    [AdminErrorCode.INVALID_FILE_TYPE]: 'Định dạng file không được hỗ trợ',

    // Bulk Operations
    [AdminErrorCode.BULK_OPERATION_FAILED]: 'Thao tác hàng loạt thất bại',
    [AdminErrorCode.BULK_VALIDATION_ERROR]: 'Lỗi xác thực dữ liệu hàng loạt',

    // Backup & Restore Operations
    [AdminErrorCode.BACKUP_FAILED]: 'Không thể tạo backup',
    [AdminErrorCode.BACKUP_NOT_FOUND]: 'Không tìm thấy backup',
    [AdminErrorCode.BACKUP_INCOMPLETE]: 'Backup chưa hoàn thành',
    [AdminErrorCode.BACKUP_CORRUPTED]: 'Backup bị hỏng hoặc không hợp lệ',
    [AdminErrorCode.RESTORE_FAILED]: 'Không thể khôi phục dữ liệu',
    [AdminErrorCode.EXPORT_FAILED]: 'Không thể xuất dữ liệu',
    [AdminErrorCode.IMPORT_FAILED]: 'Không thể nhập dữ liệu',
    [AdminErrorCode.INVALID_BACKUP_DATA]: 'Dữ liệu backup không hợp lệ',

    // General
    [AdminErrorCode.NOT_FOUND]: 'Không tìm thấy',
    [AdminErrorCode.UNKNOWN_ERROR]: 'Đã xảy ra lỗi không xác định',
    [AdminErrorCode.INTERNAL_SERVER_ERROR]: 'Lỗi server nội bộ'
};

export const createAdminError = (
    code: AdminErrorCode,
    customMessage?: string,
    statusCode?: number,
    details?: any
): AdminError => {
    const message = customMessage || AdminErrorMessages[code];
    const status = statusCode || getDefaultStatusCode(code);
    return new AdminError(message, code, status, details);
};

const getDefaultStatusCode = (code: AdminErrorCode): number => {
    switch (code) {
        case AdminErrorCode.UNAUTHORIZED:
            return 401;
        case AdminErrorCode.FORBIDDEN:
        case AdminErrorCode.INVALID_ADMIN_ROLE:
            return 403;
        case AdminErrorCode.RECORD_NOT_FOUND:
        case AdminErrorCode.AI_TOOL_NOT_FOUND:
        case AdminErrorCode.TEMPLATE_NOT_FOUND:
            return 404;
        case AdminErrorCode.VALIDATION_ERROR:
        case AdminErrorCode.INVALID_INPUT:
        case AdminErrorCode.MISSING_REQUIRED_FIELD:
        case AdminErrorCode.DUPLICATE_RECORD:
        case AdminErrorCode.AI_TOOL_ALREADY_EXISTS:
        case AdminErrorCode.TEMPLATE_ALREADY_EXISTS:
        case AdminErrorCode.INVALID_AI_TOOL_CATEGORY:
        case AdminErrorCode.INVALID_TEMPLATE_VARIABLE:
        case AdminErrorCode.FILE_TOO_LARGE:
        case AdminErrorCode.INVALID_FILE_TYPE:
        case AdminErrorCode.BULK_VALIDATION_ERROR:
            return 400;
        case AdminErrorCode.FOREIGN_KEY_CONSTRAINT:
            return 409;
        default:
            return 500;
    }
};

export const handleAdminError = (error: unknown): AdminError => {
    if (error instanceof AdminError) {
        return error;
    }

    if (error instanceof Error) {
        // Handle Prisma errors
        if (error.message.includes('Unique constraint')) {
            return createAdminError(AdminErrorCode.DUPLICATE_RECORD);
        }

        if (error.message.includes('Foreign key constraint')) {
            return createAdminError(AdminErrorCode.FOREIGN_KEY_CONSTRAINT);
        }

        if (error.message.includes('Record to update not found')) {
            return createAdminError(AdminErrorCode.RECORD_NOT_FOUND);
        }

        return createAdminError(AdminErrorCode.UNKNOWN_ERROR, error.message);
    }

    return createAdminError(AdminErrorCode.INTERNAL_SERVER_ERROR);
};

export const isAdminError = (error: unknown): error is AdminError => {
    return error instanceof AdminError;
};