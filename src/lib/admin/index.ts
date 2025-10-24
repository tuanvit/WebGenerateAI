/**
 * Admin system utilities
 * Centralized exports for all admin functionality
 */

// Error handling
export * from './admin-errors';

// Validation
export * from './admin-validation';

// Authentication and authorization
export * from './admin-auth';

// Audit logging
export * from './admin-audit';

// Configuration
export * from './admin-config';

// Middleware
export * from './admin-middleware';

// Repositories
export * from './repositories';

// Services
export * from './services';

// Type definitions
export interface AdminDashboardStats {
    totalAITools: number;
    totalTemplates: number;
    totalUsers: number;
    totalAdmins: number;
    recentActivity: Array<{
        id: string;
        action: string;
        resource: string;
        userName: string;
        timestamp: Date;
    }>;
    aiToolsByCategory: Record<string, number>;
    templatesBySubject: Record<string, number>;
    userGrowth: Array<{
        date: string;
        count: number;
    }>;
}

export interface AdminFilters {
    search?: string;
    category?: string;
    subject?: string;
    gradeLevel?: number[];
    difficulty?: string;
    pricingModel?: string;
    vietnameseSupport?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface AdminPaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface BulkOperationResult {
    success: boolean;
    processed: number;
    failed: number;
    errors: Array<{
        index: number;
        error: string;
    }>;
}

export interface ImportResult extends BulkOperationResult {
    imported: number;
    skipped: number;
    duplicates: number;
}

export interface ExportResult {
    success: boolean;
    filename: string;
    recordCount: number;
    fileSize: number;
}

// Utility functions
export const createPaginatedResponse = <T>(
    data: T[],
    total: number,
    page: number,
    limit: number
): AdminPaginatedResponse<T> => {
    const totalPages = Math.ceil(total / limit);

    return {
        data,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
    };
};

export const getClientIP = (req: Request): string => {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    if (realIP) {
        return realIP;
    }

    return 'unknown';
};

export const getUserAgent = (req: Request): string => {
    return req.headers.get('user-agent') || 'unknown';
};