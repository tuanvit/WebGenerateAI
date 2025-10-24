/**
 * Admin audit logging system
 * Tracks all admin actions for security and compliance
 */

import { prisma } from '@/lib/db';
import { AdminUser } from './admin-auth';
import { AdminErrorCode, createAdminError } from './admin-errors';

export enum AdminAction {
    // CRUD actions
    CREATE = 'CREATE',
    READ = 'READ',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',

    // Bulk actions
    BULK_CREATE = 'BULK_CREATE',
    BULK_UPDATE = 'BULK_UPDATE',
    BULK_DELETE = 'BULK_DELETE',

    // Import/Export actions
    IMPORT = 'IMPORT',
    EXPORT = 'EXPORT',

    // AI Tools specific actions
    CREATE_AI_TOOL = 'CREATE_AI_TOOL',
    UPDATE_AI_TOOL = 'UPDATE_AI_TOOL',
    DELETE_AI_TOOL = 'DELETE_AI_TOOL',
    BULK_UPDATE_AI_TOOLS = 'BULK_UPDATE_AI_TOOLS',
    BULK_DELETE_AI_TOOLS = 'BULK_DELETE_AI_TOOLS',
    IMPORT_AI_TOOLS = 'IMPORT_AI_TOOLS',
    EXPORT_AI_TOOLS = 'EXPORT_AI_TOOLS',

    // Template actions
    CREATE_TEMPLATE = 'CREATE_TEMPLATE',
    UPDATE_TEMPLATE = 'UPDATE_TEMPLATE',
    DELETE_TEMPLATE = 'DELETE_TEMPLATE',
    BULK_UPDATE_TEMPLATES = 'BULK_UPDATE_TEMPLATES',
    BULK_DELETE_TEMPLATES = 'BULK_DELETE_TEMPLATES',
    IMPORT_TEMPLATES = 'IMPORT_TEMPLATES',
    EXPORT_TEMPLATES = 'EXPORT_TEMPLATES',

    // User management actions
    UPDATE_USER = 'UPDATE_USER',
    DELETE_USER = 'DELETE_USER',
    UPDATE_USER_ROLE = 'UPDATE_USER_ROLE',
    BULK_UPDATE_USER_ROLES = 'BULK_UPDATE_USER_ROLES',
    CREATE_ADMIN_USER = 'CREATE_ADMIN_USER',

    // Authentication actions
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
    LOGIN_FAILED = 'LOGIN_FAILED',
    SESSION_EXPIRED = 'SESSION_EXPIRED',

    // System actions
    BACKUP_CREATE = 'BACKUP_CREATE',
    BACKUP_RESTORE = 'BACKUP_RESTORE',
    BACKUP_DELETE = 'BACKUP_DELETE',
    VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS',
    EXPORT_AUDIT_LOGS = 'EXPORT_AUDIT_LOGS',
    CLEANUP_AUDIT_LOGS = 'CLEANUP_AUDIT_LOGS',

    // Settings actions
    UPDATE_SETTINGS = 'UPDATE_SETTINGS',

    // Security actions
    PERMISSION_DENIED = 'PERMISSION_DENIED',
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY'
}

export enum AdminResource {
    AI_TOOLS = 'ai_tools',
    TEMPLATES = 'templates',
    USERS = 'users',
    AUDIT_LOGS = 'audit_logs',
    BACKUPS = 'backups',
    SETTINGS = 'settings',
    SYSTEM = 'system',
    AUTH = 'auth'
}

export interface AuditLogEntry {
    id: string;
    userId: string;
    action: AdminAction;
    resource: AdminResource;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
    user: {
        name: string;
        email: string;
        role: string;
    };
}

export interface AuditLogContext {
    method?: string;
    url?: string;
    success?: boolean;
    error?: string;
    duration?: number;
    requestSize?: number;
    responseSize?: number;
    changes?: Record<string, { from: any; to: any }>;
    affectedRecords?: number;
    filters?: any;
    page?: number;
    limit?: number;
    exportFormat?: string;
    [key: string]: any;
}

export interface AuditLogFilters {
    userId?: string;
    action?: AdminAction;
    resource?: AdminResource;
    resourceId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
}

/**
 * Log an admin action with enhanced context
 */
export const logAdminAction = async (
    user: AdminUser,
    action: AdminAction,
    resource: AdminResource,
    resourceId?: string,
    context?: AuditLogContext,
    ipAddress?: string,
    userAgent?: string
): Promise<void> => {
    try {
        const details = context ? {
            ...context,
            timestamp: new Date().toISOString(),
            userRole: user.role
        } : null;

        await prisma.adminAuditLog.create({
            data: {
                userId: user.id,
                action,
                resource,
                resourceId,
                details: details ? JSON.stringify(details) : null,
                ipAddress,
                userAgent
            }
        });

        // Log security-related actions to console for immediate attention
        if (isSecurityAction(action)) {
            console.warn(`SECURITY AUDIT: ${action} by ${user.email} (${user.role}) from ${ipAddress}`, {
                action,
                resource,
                resourceId,
                user: user.email,
                role: user.role,
                ipAddress,
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('Error logging admin action:', error);
        // Don't throw error to avoid breaking the main operation
    }
};

/**
 * Check if an action is security-related
 */
const isSecurityAction = (action: AdminAction): boolean => {
    const securityActions = [
        AdminAction.LOGIN_FAILED,
        AdminAction.PERMISSION_DENIED,
        AdminAction.RATE_LIMIT_EXCEEDED,
        AdminAction.SUSPICIOUS_ACTIVITY,
        AdminAction.UPDATE_USER_ROLE,
        AdminAction.BULK_UPDATE_USER_ROLES,
        AdminAction.CREATE_ADMIN_USER,
        AdminAction.DELETE_USER
    ];

    return securityActions.includes(action);
};

/**
 * Log authentication events
 */
export const logAuthEvent = async (
    action: AdminAction.LOGIN | AdminAction.LOGOUT | AdminAction.LOGIN_FAILED | AdminAction.SESSION_EXPIRED,
    userEmail?: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
    context?: AuditLogContext
): Promise<void> => {
    try {
        await prisma.adminAuditLog.create({
            data: {
                userId: userId || 'anonymous',
                action,
                resource: AdminResource.AUTH,
                details: context ? JSON.stringify({
                    ...context,
                    userEmail,
                    timestamp: new Date().toISOString()
                }) : JSON.stringify({ userEmail }),
                ipAddress,
                userAgent
            }
        });
    } catch (error) {
        console.error('Error logging auth event:', error);
    }
};

/**
 * Log security violations
 */
export const logSecurityViolation = async (
    violationType: 'PERMISSION_DENIED' | 'RATE_LIMIT_EXCEEDED' | 'SUSPICIOUS_ACTIVITY' | 'VALIDATION_ERROR',
    userId?: string,
    resource?: AdminResource,
    context?: AuditLogContext & {
        violation?: string;
        severity?: 'low' | 'medium' | 'high' | 'critical';
    },
    ipAddress?: string,
    userAgent?: string
): Promise<void> => {
    try {
        const action = AdminAction[violationType as keyof typeof AdminAction];

        await prisma.adminAuditLog.create({
            data: {
                userId: userId || 'anonymous',
                action,
                resource: resource || AdminResource.SYSTEM,
                details: context ? JSON.stringify({
                    ...context,
                    timestamp: new Date().toISOString(),
                    severity: context.severity || 'medium'
                }) : null,
                ipAddress,
                userAgent
            }
        });

        // Log critical violations to console immediately
        if (context?.severity === 'critical' || context?.severity === 'high') {
            console.error(`CRITICAL SECURITY VIOLATION: ${violationType}`, {
                userId,
                resource,
                context,
                ipAddress,
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('Error logging security violation:', error);
    }
};

/**
 * Get audit logs with filtering and pagination
 */
export const getAuditLogs = async (filters: AuditLogFilters = {}): Promise<{
    logs: AuditLogEntry[];
    total: number;
}> => {
    try {
        const {
            userId,
            action,
            resource,
            resourceId,
            startDate,
            endDate,
            limit = 50,
            offset = 0
        } = filters;

        const where: any = {};

        if (userId) where.userId = userId;
        if (action) where.action = action;
        if (resource) where.resource = resource;
        if (resourceId) where.resourceId = resourceId;

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = startDate;
            if (endDate) where.createdAt.lte = endDate;
        }

        const [logs, total] = await Promise.all([
            prisma.adminAuditLog.findMany({
                where,
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            role: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset
            }),
            prisma.adminAuditLog.count({ where })
        ]);

        return {
            logs: logs.map(log => ({
                ...log,
                details: log.details ? JSON.parse(log.details) : null
            })) as AuditLogEntry[],
            total
        };
    } catch (error) {
        console.error('Error getting audit logs:', error);
        throw createAdminError(AdminErrorCode.DATABASE_ERROR, 'Không thể lấy nhật ký audit');
    }
};

/**
 * Get audit log statistics
 */
export const getAuditLogStats = async (days: number = 30): Promise<{
    totalActions: number;
    actionsByType: Record<AdminAction, number>;
    actionsByResource: Record<AdminResource, number>;
    actionsByUser: Array<{ userId: string; userName: string; count: number }>;
    dailyActivity: Array<{ date: string; count: number }>;
}> => {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const logs = await prisma.adminAuditLog.findMany({
            where: {
                createdAt: {
                    gte: startDate
                }
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        const totalActions = logs.length;

        // Actions by type
        const actionsByType = logs.reduce((acc, log) => {
            acc[log.action as AdminAction] = (acc[log.action as AdminAction] || 0) + 1;
            return acc;
        }, {} as Record<AdminAction, number>);

        // Actions by resource
        const actionsByResource = logs.reduce((acc, log) => {
            acc[log.resource as AdminResource] = (acc[log.resource as AdminResource] || 0) + 1;
            return acc;
        }, {} as Record<AdminResource, number>);

        // Actions by user
        const userActions = logs.reduce((acc, log) => {
            const key = log.userId;
            if (!acc[key]) {
                acc[key] = {
                    userId: log.userId,
                    userName: log.user.name,
                    count: 0
                };
            }
            acc[key].count++;
            return acc;
        }, {} as Record<string, { userId: string; userName: string; count: number }>);

        const actionsByUser = Object.values(userActions)
            .sort((a, b) => b.count - a.count);

        // Daily activity
        const dailyActivity = logs.reduce((acc, log) => {
            const date = log.createdAt.toISOString().split('T')[0];
            const existing = acc.find(item => item.date === date);
            if (existing) {
                existing.count++;
            } else {
                acc.push({ date, count: 1 });
            }
            return acc;
        }, [] as Array<{ date: string; count: number }>)
            .sort((a, b) => a.date.localeCompare(b.date));

        return {
            totalActions,
            actionsByType,
            actionsByResource,
            actionsByUser,
            dailyActivity
        };
    } catch (error) {
        console.error('Error getting audit log stats:', error);
        throw createAdminError(AdminErrorCode.DATABASE_ERROR, 'Không thể lấy thống kê audit');
    }
};

/**
 * Clean up old audit logs (for maintenance)
 */
export const cleanupOldAuditLogs = async (retentionDays: number = 90): Promise<number> => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        const result = await prisma.adminAuditLog.deleteMany({
            where: {
                createdAt: {
                    lt: cutoffDate
                }
            }
        });

        return result.count;
    } catch (error) {
        console.error('Error cleaning up audit logs:', error);
        throw createAdminError(AdminErrorCode.DATABASE_ERROR, 'Không thể dọn dẹp nhật ký audit');
    }
};

/**
 * Get security alerts (recent suspicious activities)
 */
export const getSecurityAlerts = async (hours: number = 24): Promise<AuditLogEntry[]> => {
    try {
        const startDate = new Date();
        startDate.setHours(startDate.getHours() - hours);

        const securityActions = [
            AdminAction.LOGIN_FAILED,
            AdminAction.PERMISSION_DENIED,
            AdminAction.RATE_LIMIT_EXCEEDED,
            AdminAction.SUSPICIOUS_ACTIVITY,
            AdminAction.VALIDATION_ERROR
        ];

        const logs = await prisma.adminAuditLog.findMany({
            where: {
                action: { in: securityActions },
                createdAt: { gte: startDate }
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        role: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        return logs.map(log => ({
            ...log,
            details: log.details ? JSON.parse(log.details) : null
        })) as AuditLogEntry[];
    } catch (error) {
        console.error('Error getting security alerts:', error);
        throw createAdminError(AdminErrorCode.DATABASE_ERROR, 'Không thể lấy cảnh báo bảo mật');
    }
};

/**
 * Get user activity summary
 */
export const getUserActivitySummary = async (userId: string, days: number = 30): Promise<{
    totalActions: number;
    recentActions: AuditLogEntry[];
    actionsByType: Record<string, number>;
    actionsByResource: Record<string, number>;
}> => {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const logs = await prisma.adminAuditLog.findMany({
            where: {
                userId,
                createdAt: { gte: startDate }
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        role: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const totalActions = logs.length;
        const recentActions = logs.slice(0, 10).map(log => ({
            ...log,
            details: log.details ? JSON.parse(log.details) : null
        })) as AuditLogEntry[];

        const actionsByType = logs.reduce((acc, log) => {
            acc[log.action] = (acc[log.action] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const actionsByResource = logs.reduce((acc, log) => {
            acc[log.resource] = (acc[log.resource] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalActions,
            recentActions,
            actionsByType,
            actionsByResource
        };
    } catch (error) {
        console.error('Error getting user activity summary:', error);
        throw createAdminError(AdminErrorCode.DATABASE_ERROR, 'Không thể lấy tóm tắt hoạt động người dùng');
    }
};

/**
 * Search audit logs with advanced filters
 */
export const searchAuditLogs = async (searchParams: {
    query?: string;
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
    ipAddress?: string;
    page?: number;
    limit?: number;
}): Promise<{
    logs: AuditLogEntry[];
    total: number;
    totalPages: number;
}> => {
    try {
        const {
            query,
            userId,
            action,
            resource,
            startDate,
            endDate,
            ipAddress,
            page = 1,
            limit = 50
        } = searchParams;

        const offset = (page - 1) * limit;
        const where: any = {};

        if (userId) where.userId = userId;
        if (action) where.action = action;
        if (resource) where.resource = resource;
        if (ipAddress) where.ipAddress = { contains: ipAddress };

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        // Text search in details
        if (query) {
            where.OR = [
                { details: { contains: query } },
                { user: { name: { contains: query } } },
                { user: { email: { contains: query } } }
            ];
        }

        const [logs, total] = await Promise.all([
            prisma.adminAuditLog.findMany({
                where,
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            role: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset
            }),
            prisma.adminAuditLog.count({ where })
        ]);

        return {
            logs: logs.map(log => ({
                ...log,
                details: log.details ? JSON.parse(log.details) : null
            })) as AuditLogEntry[],
            total,
            totalPages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error('Error searching audit logs:', error);
        throw createAdminError(AdminErrorCode.DATABASE_ERROR, 'Không thể tìm kiếm nhật ký audit');
    }
};

/**
 * Export audit logs to CSV
 */
export const exportAuditLogs = async (filters: AuditLogFilters = {}): Promise<string> => {
    try {
        const { logs } = await getAuditLogs({ ...filters, limit: 10000 });

        const csvHeader = 'Thời gian,Người dùng,Email,Quyền,Hành động,Tài nguyên,ID tài nguyên,Chi tiết,IP,User Agent\n';

        const csvRows = logs.map(log => {
            const details = log.details ? JSON.stringify(log.details).replace(/"/g, '""') : '';
            return [
                log.createdAt.toISOString(),
                `"${log.user.name}"`,
                `"${log.user.email}"`,
                `"${log.user.role}"`,
                log.action,
                log.resource,
                log.resourceId || '',
                `"${details}"`,
                log.ipAddress || '',
                `"${log.userAgent || ''}"`
            ].join(',');
        }).join('\n');

        return csvHeader + csvRows;
    } catch (error) {
        console.error('Error exporting audit logs:', error);
        throw createAdminError(AdminErrorCode.DATABASE_ERROR, 'Không thể xuất nhật ký audit');
    }
};

/**
 * Get audit log retention policy
 */
export const getAuditRetentionInfo = async (): Promise<{
    totalLogs: number;
    oldestLog?: Date;
    newestLog?: Date;
    sizeEstimate: number;
    retentionDays: number;
}> => {
    try {
        const [totalLogs, oldestLog, newestLog] = await Promise.all([
            prisma.adminAuditLog.count(),
            prisma.adminAuditLog.findFirst({
                orderBy: { createdAt: 'asc' },
                select: { createdAt: true }
            }),
            prisma.adminAuditLog.findFirst({
                orderBy: { createdAt: 'desc' },
                select: { createdAt: true }
            })
        ]);

        // Estimate size (rough calculation)
        const avgRecordSize = 500; // bytes
        const sizeEstimate = totalLogs * avgRecordSize;

        return {
            totalLogs,
            oldestLog: oldestLog?.createdAt,
            newestLog: newestLog?.createdAt,
            sizeEstimate,
            retentionDays: 90 // Default retention policy
        };
    } catch (error) {
        console.error('Error getting audit retention info:', error);
        throw createAdminError(AdminErrorCode.DATABASE_ERROR, 'Không thể lấy thông tin lưu trữ audit');
    }
};