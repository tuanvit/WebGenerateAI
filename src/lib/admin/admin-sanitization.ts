/**
 * Advanced input sanitization utilities for admin operations
 * Provides comprehensive protection against XSS, SQL injection, and other attacks
 */

import { AdminErrorCode, createAdminError } from './admin-errors';

// HTML sanitization configuration
interface SanitizeHtmlOptions {
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
    allowedSchemes?: string[];
    stripComments?: boolean;
    stripScripts?: boolean;
}

const DEFAULT_ALLOWED_TAGS = [
    'p', 'br', 'strong', 'em', 'u', 'i', 'b',
    'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote', 'code', 'pre', 'a', 'img'
];

const DEFAULT_ALLOWED_ATTRIBUTES: Record<string, string[]> = {
    'a': ['href', 'title'],
    'img': ['src', 'alt', 'title', 'width', 'height'],
    'blockquote': ['cite']
};

const DEFAULT_ALLOWED_SCHEMES = ['http', 'https', 'mailto'];

/**
 * Advanced HTML sanitization
 */
export class HtmlSanitizer {
    private options: Required<SanitizeHtmlOptions>;

    constructor(options: SanitizeHtmlOptions = {}) {
        this.options = {
            allowedTags: options.allowedTags || DEFAULT_ALLOWED_TAGS,
            allowedAttributes: options.allowedAttributes || DEFAULT_ALLOWED_ATTRIBUTES,
            allowedSchemes: options.allowedSchemes || DEFAULT_ALLOWED_SCHEMES,
            stripComments: options.stripComments !== false,
            stripScripts: options.stripScripts !== false
        };
    }

    sanitize(html: string): string {
        if (!html || typeof html !== 'string') return '';

        let sanitized = html;

        // Remove comments if configured
        if (this.options.stripComments) {
            sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, '');
        }

        // Remove script tags and content if configured
        if (this.options.stripScripts) {
            sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        }

        // Remove dangerous event handlers
        sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');

        // Remove javascript: and data: protocols (except data:image/)
        sanitized = sanitized.replace(/javascript:/gi, '');
        sanitized = sanitized.replace(/data:(?!image\/)/gi, '');

        // Remove vbscript: protocol
        sanitized = sanitized.replace(/vbscript:/gi, '');

        // Remove dangerous CSS expressions
        sanitized = sanitized.replace(/expression\s*\(/gi, '');

        // Sanitize URLs in href and src attributes
        sanitized = this.sanitizeUrls(sanitized);

        // Remove disallowed tags
        sanitized = this.removeDisallowedTags(sanitized);

        // Remove disallowed attributes
        sanitized = this.removeDisallowedAttributes(sanitized);

        return sanitized.trim();
    }

    private sanitizeUrls(html: string): string {
        // Sanitize href attributes
        html = html.replace(/href\s*=\s*["']([^"']+)["']/gi, (match, url) => {
            const sanitizedUrl = this.sanitizeUrl(url);
            return sanitizedUrl ? `href="${sanitizedUrl}"` : '';
        });

        // Sanitize src attributes
        html = html.replace(/src\s*=\s*["']([^"']+)["']/gi, (match, url) => {
            const sanitizedUrl = this.sanitizeUrl(url);
            return sanitizedUrl ? `src="${sanitizedUrl}"` : '';
        });

        return html;
    }

    private sanitizeUrl(url: string): string {
        try {
            const parsed = new URL(url);

            if (this.options.allowedSchemes.includes(parsed.protocol.replace(':', ''))) {
                return parsed.toString();
            }

            return '';
        } catch {
            // If it's a relative URL, allow it
            if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
                return url;
            }
            return '';
        }
    }

    private removeDisallowedTags(html: string): string {
        // Get all tags in the HTML
        const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi;

        return html.replace(tagRegex, (match, tagName) => {
            if (this.options.allowedTags.includes(tagName.toLowerCase())) {
                return match;
            }
            return '';
        });
    }

    private removeDisallowedAttributes(html: string): string {
        const tagRegex = /<([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/gi;

        return html.replace(tagRegex, (match, tagName, attributes) => {
            const allowedAttrs = this.options.allowedAttributes[tagName.toLowerCase()] || [];

            if (allowedAttrs.length === 0) {
                return `<${tagName}>`;
            }

            const attrRegex = /(\w+)\s*=\s*["']([^"']*)["']/gi;
            const sanitizedAttrs: string[] = [];

            let attrMatch;
            while ((attrMatch = attrRegex.exec(attributes)) !== null) {
                const [, attrName, attrValue] = attrMatch;

                if (allowedAttrs.includes(attrName.toLowerCase())) {
                    sanitizedAttrs.push(`${attrName}="${attrValue}"`);
                }
            }

            return sanitizedAttrs.length > 0
                ? `<${tagName} ${sanitizedAttrs.join(' ')}>`
                : `<${tagName}>`;
        });
    }
}

// Default HTML sanitizer instance
export const htmlSanitizer = new HtmlSanitizer();

/**
 * Text input sanitization
 */
export class TextSanitizer {
    static sanitizeBasicText(input: string): string {
        if (!input || typeof input !== 'string') return '';

        return input
            .trim()
            // Remove null bytes
            .replace(/\0/g, '')
            // Remove control characters except newlines, tabs, and carriage returns
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
            // Normalize Unicode
            .normalize('NFC')
            // Remove excessive whitespace
            .replace(/\s+/g, ' ');
    }

    static sanitizeMultilineText(input: string): string {
        if (!input || typeof input !== 'string') return '';

        return input
            .trim()
            // Remove null bytes
            .replace(/\0/g, '')
            // Remove dangerous control characters but keep newlines and tabs
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
            // Normalize Unicode
            .normalize('NFC')
            // Normalize line endings
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            // Remove excessive blank lines
            .replace(/\n{3,}/g, '\n\n');
    }

    static sanitizeFileName(fileName: string): string {
        if (!fileName || typeof fileName !== 'string') return '';

        return fileName
            .trim()
            // Remove path traversal attempts
            .replace(/\.\./g, '')
            .replace(/[\/\\]/g, '')
            // Remove dangerous characters
            .replace(/[<>:"|?*\x00-\x1F\x7F]/g, '')
            // Remove leading/trailing dots and spaces
            .replace(/^[.\s]+|[.\s]+$/g, '')
            // Limit length
            .substring(0, 255);
    }

    static sanitizeEmail(email: string): string {
        if (!email || typeof email !== 'string') return '';

        const sanitized = email.trim().toLowerCase();

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sanitized)) {
            throw createAdminError(AdminErrorCode.VALIDATION_ERROR, 'Email không hợp lệ');
        }

        return sanitized;
    }

    static sanitizeUrl(url: string, allowedProtocols: string[] = ['http', 'https']): string {
        if (!url || typeof url !== 'string') return '';

        try {
            const parsed = new URL(url.trim());

            const protocol = parsed.protocol.replace(':', '');
            if (!allowedProtocols.includes(protocol)) {
                throw createAdminError(AdminErrorCode.VALIDATION_ERROR, 'Giao thức URL không được phép');
            }

            return parsed.toString();
        } catch (error) {
            if (error instanceof Error && 'code' in error) {
                throw error;
            }
            throw createAdminError(AdminErrorCode.VALIDATION_ERROR, 'URL không hợp lệ');
        }
    }
}

/**
 * JSON data sanitization
 */
export class JsonSanitizer {
    static sanitizeObject(obj: any, maxDepth = 10, currentDepth = 0): any {
        if (currentDepth >= maxDepth) {
            throw createAdminError(AdminErrorCode.VALIDATION_ERROR, 'Dữ liệu JSON quá phức tạp');
        }

        if (obj === null || obj === undefined) {
            return obj;
        }

        if (typeof obj === 'string') {
            return TextSanitizer.sanitizeBasicText(obj);
        }

        if (typeof obj === 'number' || typeof obj === 'boolean') {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeObject(item, maxDepth, currentDepth + 1));
        }

        if (typeof obj === 'object') {
            const sanitized: any = {};

            for (const [key, value] of Object.entries(obj)) {
                const sanitizedKey = TextSanitizer.sanitizeBasicText(key);
                if (sanitizedKey) {
                    sanitized[sanitizedKey] = this.sanitizeObject(value, maxDepth, currentDepth + 1);
                }
            }

            return sanitized;
        }

        return obj;
    }

    static sanitizeArray(arr: any[], maxLength = 1000): any[] {
        if (!Array.isArray(arr)) {
            throw createAdminError(AdminErrorCode.VALIDATION_ERROR, 'Dữ liệu phải là mảng');
        }

        if (arr.length > maxLength) {
            throw createAdminError(AdminErrorCode.VALIDATION_ERROR, `Mảng không được có quá ${maxLength} phần tử`);
        }

        return arr.map(item => this.sanitizeObject(item));
    }
}

/**
 * SQL injection prevention
 */
export class SqlSanitizer {
    static escapeLikePattern(pattern: string): string {
        return pattern.replace(/[%_\\]/g, '\\$&');
    }

    static sanitizeSearchQuery(query: string): string {
        if (!query || typeof query !== 'string') return '';

        return query
            .trim()
            // Remove SQL injection attempts
            .replace(/[';-]/g, '')
            // Remove excessive whitespace
            .replace(/\s+/g, ' ')
            // Limit length
            .substring(0, 100);
    }
}

/**
 * File upload sanitization
 */
export class FileSanitizer {
    private static readonly ALLOWED_MIME_TYPES = [
        'application/json',
        'text/csv',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/plain'
    ];

    private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    static validateFile(file: { name: string; size: number; type: string }): void {
        // Validate file name
        const sanitizedName = TextSanitizer.sanitizeFileName(file.name);
        if (!sanitizedName) {
            throw createAdminError(AdminErrorCode.FILE_UPLOAD_ERROR, 'Tên file không hợp lệ');
        }

        // Validate file size
        if (file.size > this.MAX_FILE_SIZE) {
            throw createAdminError(AdminErrorCode.FILE_UPLOAD_ERROR, 'File quá lớn (tối đa 10MB)');
        }

        // Validate MIME type
        if (!this.ALLOWED_MIME_TYPES.includes(file.type)) {
            throw createAdminError(AdminErrorCode.FILE_UPLOAD_ERROR, 'Loại file không được hỗ trợ');
        }

        // Validate file extension
        const extension = sanitizedName.split('.').pop()?.toLowerCase();
        const allowedExtensions = ['json', 'csv', 'xlsx', 'xls', 'txt'];

        if (!extension || !allowedExtensions.includes(extension)) {
            throw createAdminError(AdminErrorCode.FILE_UPLOAD_ERROR, 'Phần mở rộng file không được hỗ trợ');
        }
    }

    static sanitizeFileContent(content: string, fileType: string): string {
        switch (fileType) {
            case 'application/json':
                try {
                    const parsed = JSON.parse(content);
                    return JSON.stringify(JsonSanitizer.sanitizeObject(parsed));
                } catch {
                    throw createAdminError(AdminErrorCode.FILE_UPLOAD_ERROR, 'File JSON không hợp lệ');
                }

            case 'text/csv':
            case 'text/plain':
                return TextSanitizer.sanitizeMultilineText(content);

            default:
                return content;
        }
    }
}

// Export convenience functions
export const sanitizeHtml = (html: string, options?: SanitizeHtmlOptions): string => {
    const sanitizer = options ? new HtmlSanitizer(options) : htmlSanitizer;
    return sanitizer.sanitize(html);
};

export const sanitizeText = TextSanitizer.sanitizeBasicText;
export const sanitizeMultilineText = TextSanitizer.sanitizeMultilineText;
export const sanitizeFileName = TextSanitizer.sanitizeFileName;
export const sanitizeEmail = TextSanitizer.sanitizeEmail;
export const sanitizeUrl = TextSanitizer.sanitizeUrl;
export const sanitizeJson = JsonSanitizer.sanitizeObject;
export const sanitizeArray = JsonSanitizer.sanitizeArray;
export const sanitizeSearchQuery = SqlSanitizer.sanitizeSearchQuery;
export const validateFile = FileSanitizer.validateFile;
export const sanitizeFileContent = FileSanitizer.sanitizeFileContent;