/**
 * Admin validation schemas and utilities
 * Provides comprehensive validation for admin operations with Vietnamese error messages
 */

import { z } from 'zod';
import { AdminErrorCode, createAdminError } from './admin-errors';

// AI Tool Category enum
export const AIToolCategorySchema = z.enum([
    'TEXT_GENERATION',
    'PRESENTATION',
    'IMAGE',
    'VIDEO',
    'SIMULATION',
    'ASSESSMENT',
    'DATA_ANALYSIS'
]);

// AI Tool validation schema
export const AIToolSchema = z.object({
    id: z.string().optional(),
    name: z.string()
        .min(1, 'Tên công cụ không được để trống')
        .max(100, 'Tên công cụ không được quá 100 ký tự'),
    description: z.string()
        .min(10, 'Mô tả phải có ít nhất 10 ký tự')
        .max(1000, 'Mô tả không được quá 1000 ký tự'),
    url: z.string()
        .url('URL không hợp lệ')
        .startsWith('https://', 'URL phải bắt đầu bằng https://'),
    category: AIToolCategorySchema,
    subjects: z.array(z.string())
        .min(1, 'Phải chọn ít nhất một môn học')
        .refine(subjects => {
            const validSubjects = ['Toán', 'Văn', 'Khoa học tự nhiên', 'Lịch sử & Địa lí', 'Giáo dục công dân', 'Công nghệ'];
            return subjects.every(subject => validSubjects.includes(subject));
        }, 'Môn học không hợp lệ'),
    gradeLevel: z.array(z.number().int().min(6).max(9))
        .min(1, 'Phải chọn ít nhất một lớp')
        .refine(grades => grades.every(grade => [6, 7, 8, 9].includes(grade)), 'Lớp học phải từ 6 đến 9'),
    useCase: z.string()
        .min(10, 'Trường hợp sử dụng phải có ít nhất 10 ký tự')
        .max(500, 'Trường hợp sử dụng không được quá 500 ký tự'),
    vietnameseSupport: z.boolean(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    features: z.array(z.string())
        .min(1, 'Phải có ít nhất một tính năng'),
    pricingModel: z.enum(['free', 'freemium', 'paid']),
    integrationGuide: z.string()
        .min(10, 'Hướng dẫn tích hợp phải có ít nhất 10 ký tự')
        .max(1000, 'Hướng dẫn tích hợp không được quá 1000 ký tự'),
    samplePrompts: z.array(z.string())
        .optional(),
    relatedTools: z.array(z.string())
        .optional()
});

// Template validation schemas
export const templateVariableSchema = z.object({
    name: z.string()
        .min(1, 'Tên biến không được để trống')
        .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, 'Tên biến chỉ được chứa chữ cái, số và dấu gạch dưới, bắt đầu bằng chữ cái'),
    label: z.string()
        .min(1, 'Nhãn biến không được để trống'),
    description: z.string().optional().nullable(),
    type: z.enum(['text', 'textarea', 'select', 'multiselect']),
    required: z.boolean(),
    placeholder: z.string().optional().nullable(),
    options: z.array(z.string()).optional(),
    defaultValue: z.string().optional().nullable()
});

export const templateExampleSchema = z.object({
    title: z.string()
        .min(1, 'Tiêu đề ví dụ không được để trống'),
    description: z.string()
        .min(1, 'Mô tả ví dụ không được để trống'),
    sampleInput: z.record(z.string(), z.string()),
    expectedOutput: z.string()
        .min(10, 'Kết quả mong đợi phải có ít nhất 10 ký tự')
});

export const templateSchema = z.object({
    id: z.string().optional(),
    name: z.string()
        .min(1, 'Tên template không được để trống')
        .max(100, 'Tên template không được quá 100 ký tự'),
    description: z.string()
        .min(10, 'Mô tả phải có ít nhất 10 ký tự')
        .max(1000, 'Mô tả không được quá 1000 ký tự'),
    subject: z.string()
        .min(1, 'Phải chọn môn học')
        .refine(subject => {
            const validSubjects = ['Toán', 'Văn', 'Khoa học tự nhiên', 'Lịch sử & Địa lí', 'Giáo dục công dân', 'Công nghệ'];
            return validSubjects.includes(subject);
        }, 'Môn học không hợp lệ'),
    gradeLevel: z.array(z.number().int().min(6).max(9))
        .min(1, 'Phải chọn ít nhất một lớp'),
    outputType: z.enum(['lesson-plan', 'presentation', 'assessment', 'interactive', 'research']),
    templateContent: z.string()
        .min(50, 'Nội dung template phải có ít nhất 50 ký tự')
        .max(10000, 'Nội dung template không được quá 10000 ký tự'),
    recommendedTools: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    compliance: z.array(z.string()).optional(),
    variables: z.array(templateVariableSchema).optional(),
    examples: z.array(templateExampleSchema).optional()
});

// Bulk operation schemas
export const BulkAIToolUpdateSchema = z.object({
    ids: z.array(z.string()).min(1, 'Phải chọn ít nhất một công cụ AI'),
    updates: z.object({
        category: AIToolCategorySchema.optional(),
        subjects: z.array(z.string()).optional(),
        gradeLevel: z.array(z.number().int().min(6).max(9)).optional(),
        vietnameseSupport: z.boolean().optional(),
        difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
        pricingModel: z.enum(['free', 'freemium', 'paid']).optional()
    }).refine(updates => Object.keys(updates).length > 0, 'Phải có ít nhất một trường cập nhật')
});

export const BulkTemplateUpdateSchema = z.object({
    ids: z.array(z.string()).min(1, 'Phải chọn ít nhất một template'),
    updates: z.object({
        subject: z.string().optional(),
        gradeLevel: z.array(z.number().int().min(6).max(9)).optional(),
        outputType: z.enum(['lesson-plan', 'presentation', 'assessment', 'interactive', 'research']).optional(),
        difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
        tags: z.array(z.string()).optional()
    }).refine(updates => Object.keys(updates).length > 0, 'Phải có ít nhất một trường cập nhật')
});

// File upload validation
export const FileUploadSchema = z.object({
    file: z.object({
        name: z.string(),
        size: z.number().max(10 * 1024 * 1024, 'File không được lớn hơn 10MB'),
        type: z.string().refine(type => {
            const allowedTypes = ['application/json', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
            return allowedTypes.includes(type);
        }, 'Chỉ hỗ trợ file JSON, CSV, và Excel')
    })
});

// Validation helper functions
export const validateAITool = (data: unknown) => {
    try {
        return AIToolSchema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const firstError = error.issues[0];
            throw createAdminError(
                AdminErrorCode.VALIDATION_ERROR,
                firstError.message,
                400,
                { field: firstError.path.join('.'), errors: error.issues }
            );
        }
        throw error;
    }
};

export const validateTemplate = (data: unknown) => {
    try {
        return templateSchema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const firstError = error.issues[0];
            throw createAdminError(
                AdminErrorCode.VALIDATION_ERROR,
                firstError.message,
                400,
                { field: firstError.path.join('.'), errors: error.issues }
            );
        }
        throw error;
    }
};

export const validateBulkAIToolUpdate = (data: unknown) => {
    try {
        return BulkAIToolUpdateSchema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const firstError = error.issues[0];
            throw createAdminError(
                AdminErrorCode.BULK_VALIDATION_ERROR,
                firstError.message,
                400,
                { field: firstError.path.join('.'), errors: error.issues }
            );
        }
        throw error;
    }
};

export const validateBulkTemplateUpdate = (data: unknown) => {
    try {
        return BulkTemplateUpdateSchema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const firstError = error.issues[0];
            throw createAdminError(
                AdminErrorCode.BULK_VALIDATION_ERROR,
                firstError.message,
                400,
                { field: firstError.path.join('.'), errors: error.issues }
            );
        }
        throw error;
    }
};

export const validateFileUpload = (data: unknown) => {
    try {
        return FileUploadSchema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const firstError = error.issues[0];
            throw createAdminError(
                AdminErrorCode.FILE_UPLOAD_ERROR,
                firstError.message,
                400,
                { field: firstError.path.join('.'), errors: error.issues }
            );
        }
        throw error;
    }
};

// Admin user management schemas
export const adminUserUpdateSchema = z.object({
    name: z.string()
        .min(1, 'Tên không được để trống')
        .max(100, 'Tên không được quá 100 ký tự')
        .optional(),
    role: z.enum(['user', 'admin', 'moderator', 'viewer'])
        .optional(),
    school: z.string()
        .max(200, 'Tên trường không được quá 200 ký tự')
        .optional(),
    subjects: z.string()
        .optional(),
    gradeLevel: z.string()
        .optional()
});

export const adminBulkRoleUpdateSchema = z.object({
    updates: z.array(z.object({
        userId: z.string().min(1, 'ID người dùng không được để trống'),
        role: z.enum(['user', 'admin', 'moderator', 'viewer'])
    })).min(1, 'Phải có ít nhất một cập nhật')
});

// Search and filter schemas
export const adminSearchSchema = z.object({
    query: z.string()
        .max(100, 'Từ khóa tìm kiếm không được quá 100 ký tự')
        .optional(),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const adminFilterSchema = z.object({
    category: AIToolCategorySchema.optional(),
    subject: z.string().optional(),
    gradeLevel: z.array(z.number().int().min(6).max(9)).optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    vietnameseSupport: z.boolean().optional(),
    pricingModel: z.enum(['free', 'freemium', 'paid']).optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional()
});

// Backup and restore schemas
export const backupCreateSchema = z.object({
    name: z.string()
        .min(1, 'Tên backup không được để trống')
        .max(100, 'Tên backup không được quá 100 ký tự'),
    description: z.string()
        .max(500, 'Mô tả không được quá 500 ký tự')
        .optional(),
    includeAITools: z.boolean().default(true),
    includeTemplates: z.boolean().default(true)
});

export const backupRestoreSchema = z.object({
    backupId: z.string().min(1, 'ID backup không được để trống'),
    restoreAITools: z.boolean().default(true),
    restoreTemplates: z.boolean().default(true),
    overwriteExisting: z.boolean().default(false)
});

// Import/Export schemas
export const importDataSchema = z.object({
    data: z.array(z.record(z.string(), z.any()))
        .min(1, 'Dữ liệu import không được để trống'),
    overwriteExisting: z.boolean().default(false),
    validateOnly: z.boolean().default(false)
});

export const exportDataSchema = z.object({
    format: z.enum(['json', 'csv', 'xlsx']).default('json'),
    includeMetadata: z.boolean().default(true),
    filters: adminFilterSchema.optional()
});

// Input sanitization with DOMPurify-like functionality
export const sanitizeHtml = (html: string): string => {
    if (!html) return '';

    // Remove script tags and their content
    let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove dangerous event handlers
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');

    // Remove javascript: protocol
    sanitized = sanitized.replace(/javascript:/gi, '');

    // Remove data: protocol (except for images)
    sanitized = sanitized.replace(/data:(?!image\/)/gi, '');

    // Remove dangerous tags
    const dangerousTags = ['script', 'object', 'embed', 'form', 'input', 'button', 'select', 'textarea', 'iframe', 'frame', 'frameset'];
    dangerousTags.forEach(tag => {
        const regex = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi');
        sanitized = sanitized.replace(regex, '');
    });

    // Remove style attributes that could contain malicious CSS
    sanitized = sanitized.replace(/\s*style\s*=\s*["'][^"']*["']/gi, '');

    return sanitized.trim();
};

export const sanitizeInput = (input: string): string => {
    if (!input) return '';

    return input
        .trim()
        // Remove null bytes
        .replace(/\0/g, '')
        // Remove control characters except newlines and tabs
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        // Normalize whitespace
        .replace(/\s+/g, ' ');
};

export const sanitizeUrl = (url: string): string => {
    if (!url) return '';

    try {
        const parsed = new URL(url);

        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            throw new Error('Invalid protocol');
        }

        return parsed.toString();
    } catch {
        throw createAdminError(AdminErrorCode.VALIDATION_ERROR, 'URL không hợp lệ');
    }
};

export const sanitizeFileName = (fileName: string): string => {
    if (!fileName) return '';

    return fileName
        .trim()
        // Remove path traversal attempts
        .replace(/\.\./g, '')
        .replace(/[\/\\]/g, '')
        // Remove dangerous characters
        .replace(/[<>:"|?*]/g, '')
        // Limit length
        .substring(0, 255);
};

// SQL injection prevention helpers
export const escapeSqlLike = (input: string): string => {
    return input.replace(/[%_\\]/g, '\\$&');
};

// XSS prevention for JSON data
export const sanitizeJsonValue = (value: any): any => {
    if (typeof value === 'string') {
        return sanitizeInput(value);
    } else if (Array.isArray(value)) {
        return value.map(sanitizeJsonValue);
    } else if (value && typeof value === 'object') {
        const sanitized: any = {};
        for (const [key, val] of Object.entries(value)) {
            sanitized[sanitizeInput(key)] = sanitizeJsonValue(val);
        }
        return sanitized;
    }
    return value;
};

// Comprehensive validation wrapper
export const validateAndSanitize = <T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    sanitizeStrings = true
): T => {
    try {
        // Pre-sanitize string values if requested
        let processedData = data;
        if (sanitizeStrings && typeof data === 'object' && data !== null) {
            processedData = sanitizeJsonValue(data);
        }

        return schema.parse(processedData);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const firstError = error.issues[0];
            throw createAdminError(
                AdminErrorCode.VALIDATION_ERROR,
                firstError.message,
                400,
                {
                    field: firstError.path.join('.'),
                    errors: error.issues.map(issue => ({
                        path: issue.path.join('.'),
                        message: issue.message,
                        code: issue.code
                    }))
                }
            );
        }
        throw error;
    }
};

// Rate limiting validation
export const rateLimitSchema = z.object({
    windowMs: z.number().int().min(1000).max(3600000).default(900000), // 15 minutes default
    maxRequests: z.number().int().min(1).max(1000).default(100)
});

// Audit log validation
export const auditLogFilterSchema = z.object({
    userId: z.string().optional(),
    action: z.string().optional(),
    resource: z.string().optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(50)
});