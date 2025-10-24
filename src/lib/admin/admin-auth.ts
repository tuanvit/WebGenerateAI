/**
 * Admin authentication and authorization middleware
 * Provides role-based access control for admin operations
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { AdminErrorCode, createAdminError } from './admin-errors';
import { prisma } from '@/lib/db';

export interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: string;
    lastLoginAt: Date;
}

export interface AdminPermission {
    resource: string;
    actions: readonly string[];
}

export interface AdminRole {
    name: string;
    permissions: AdminPermission[];
}

// Define admin permissions
export const ADMIN_PERMISSIONS = {
    AI_TOOLS: {
        resource: 'ai_tools',
        actions: ['read', 'create', 'update', 'delete', 'bulk_update', 'bulk_delete', 'import', 'export']
    },
    TEMPLATES: {
        resource: 'templates',
        actions: ['read', 'create', 'update', 'delete', 'bulk_update', 'bulk_delete', 'import', 'export']
    },
    USERS: {
        resource: 'users',
        actions: ['read', 'create', 'update', 'delete', 'manage_roles']
    },
    AUDIT_LOGS: {
        resource: 'audit_logs',
        actions: ['read', 'export']
    },
    BACKUPS: {
        resource: 'backups',
        actions: ['read', 'create', 'restore', 'delete']
    },
    SETTINGS: {
        resource: 'settings',
        actions: ['read', 'update']
    }
} as const;

// Define admin roles
export const ADMIN_ROLES: Record<string, AdminRole> = {
    admin: {
        name: 'admin',
        permissions: [
            ADMIN_PERMISSIONS.AI_TOOLS,
            ADMIN_PERMISSIONS.TEMPLATES,
            ADMIN_PERMISSIONS.USERS,
            ADMIN_PERMISSIONS.AUDIT_LOGS,
            ADMIN_PERMISSIONS.BACKUPS,
            ADMIN_PERMISSIONS.SETTINGS
        ]
    },
    moderator: {
        name: 'moderator',
        permissions: [
            {
                resource: 'ai_tools',
                actions: ['read', 'update']
            },
            {
                resource: 'templates',
                actions: ['read', 'update']
            },
            ADMIN_PERMISSIONS.AUDIT_LOGS
        ]
    },
    viewer: {
        name: 'viewer',
        permissions: [
            {
                resource: 'ai_tools',
                actions: ['read']
            },
            {
                resource: 'templates',
                actions: ['read']
            },
            {
                resource: 'audit_logs',
                actions: ['read']
            }
        ]
    }
};

/**
 * Middleware to require admin role for API routes
 */
export const requireAdminRole = async (req?: NextRequest): Promise<AdminUser> => {
    let user: any = null;

    try {
        // First, try to get from simple-auth session (for demo login)
        if (req) {
            const simpleAuthCookie = req.cookies.get('simple-auth-session')?.value;

            if (simpleAuthCookie) {
                // Import simple-auth functions
                const { getSessionUser } = await import('@/lib/simple-auth');
                const simpleUser = getSessionUser(simpleAuthCookie);

                if (simpleUser && simpleUser.role === 'admin') {
                    return {
                        id: simpleUser.id,
                        email: simpleUser.email,
                        name: simpleUser.name,
                        role: simpleUser.role,
                        lastLoginAt: new Date()
                    } as AdminUser;
                }
            }
        }

        // Try to get session from NextAuth
        const session = await getServerSession(authOptions);

        if (session?.user?.email) {
            user = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { id: true, email: true, name: true, role: true, lastLoginAt: true }
            });
        }

        // If no session from NextAuth, try to get from cookie directly (for demo login)
        if (!user && req) {
            const cookieName = process.env.NODE_ENV === 'production'
                ? '__Secure-next-auth.session-token'
                : 'next-auth.session-token';

            const sessionToken = req.cookies.get(cookieName)?.value;

            if (sessionToken) {
                const session = await prisma.session.findUnique({
                    where: { sessionToken },
                    include: {
                        user: {
                            select: { id: true, email: true, name: true, role: true, lastLoginAt: true }
                        }
                    }
                });

                if (session && session.expires > new Date()) {
                    user = session.user;
                }
            }
        }
    } catch (error) {
        console.error('Error in requireAdminRole:', error);
    }

    if (!user) {
        throw createAdminError(AdminErrorCode.UNAUTHORIZED);
    }

    if (!isAdminRole(user.role)) {
        throw createAdminError(AdminErrorCode.INVALID_ADMIN_ROLE);
    }

    return user as AdminUser;
};

/**
 * Check if a role is an admin role
 */
export const isAdminRole = (role: string): boolean => {
    return Object.keys(ADMIN_ROLES).includes(role);
};

/**
 * Require specific permission for an action
 */
export const requirePermission = async (
    resource: string,
    action: string,
    req?: NextRequest
): Promise<AdminUser> => {
    const user = await requireAdminRole(req);

    if (!hasPermission(user.role, resource, action)) {
        throw createAdminError(AdminErrorCode.FORBIDDEN,
            `Không có quyền ${action} trên ${resource}`);
    }

    return user;
};

/**
 * Check if a role has specific permission
 */
export const hasPermission = (role: string, resource: string, action: string): boolean => {
    const adminRole = ADMIN_ROLES[role];
    if (!adminRole) return false;

    return adminRole.permissions.some(permission =>
        permission.resource === resource && permission.actions.includes(action)
    );
};

/**
 * Check if current user has admin role (for client-side checks)
 */
export const checkAdminRole = async (): Promise<boolean> => {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return false;
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true }
        });

        return user ? isAdminRole(user.role) : false;
    } catch (error) {
        console.error('Error checking admin role:', error);
        return false;
    }
};

/**
 * Check if current user has specific permission
 */
export const checkPermission = async (resource: string, action: string): Promise<boolean> => {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return false;
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true }
        });

        return user ? hasPermission(user.role, resource, action) : false;
    } catch (error) {
        console.error('Error checking permission:', error);
        return false;
    }
};

/**
 * Get current admin user info
 */
export const getCurrentAdminUser = async (): Promise<AdminUser | null> => {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return null;
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, email: true, name: true, role: true, lastLoginAt: true }
        });

        if (!user || !isAdminRole(user.role)) {
            return null;
        }

        return user as AdminUser;
    } catch (error) {
        console.error('Error getting current admin user:', error);
        return null;
    }
};

/**
 * Get user permissions
 */
export const getUserPermissions = async (userId?: string): Promise<AdminPermission[]> => {
    try {
        let user;

        if (userId) {
            user = await prisma.user.findUnique({
                where: { id: userId },
                select: { role: true }
            });
        } else {
            const session = await getServerSession(authOptions);
            if (!session?.user?.email) {
                return [];
            }

            user = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { role: true }
            });
        }

        if (!user || !isAdminRole(user.role)) {
            return [];
        }

        const adminRole = ADMIN_ROLES[user.role];
        return adminRole ? adminRole.permissions : [];
    } catch (error) {
        console.error('Error getting user permissions:', error);
        return [];
    }
};

/**
 * Middleware wrapper for API routes that require admin access
 */
export const withAdminAuth = (handler: (req: NextRequest, user: AdminUser) => Promise<Response>) => {
    return async (req: NextRequest): Promise<Response> => {
        try {
            const user = await requireAdminRole(req);
            return await handler(req, user);
        } catch (error) {
            console.error('Admin auth error:', error);

            if (error instanceof Error && 'code' in error && 'statusCode' in error) {
                return Response.json(
                    {
                        error: error.message,
                        code: (error as any).code
                    },
                    { status: (error as any).statusCode }
                );
            }

            return Response.json(
                {
                    error: 'Lỗi server nội bộ',
                    code: AdminErrorCode.INTERNAL_SERVER_ERROR
                },
                { status: 500 }
            );
        }
    };
};

/**
 * Create admin user (for initial setup)
 */
export const createAdminUser = async (email: string, name: string): Promise<void> => {
    try {
        await prisma.user.upsert({
            where: { email },
            update: { role: 'admin' },
            create: {
                email,
                name,
                role: 'admin'
            }
        });
    } catch (error) {
        console.error('Error creating admin user:', error);
        throw createAdminError(AdminErrorCode.DATABASE_ERROR, 'Không thể tạo tài khoản admin');
    }
};

/**
 * List all admin users
 */
export const getAdminUsers = async (): Promise<AdminUser[]> => {
    try {
        const users = await prisma.user.findMany({
            where: {
                role: {
                    in: Object.keys(ADMIN_ROLES)
                }
            },
            select: { id: true, email: true, name: true, role: true, lastLoginAt: true },
            orderBy: { lastLoginAt: 'desc' }
        });

        return users as AdminUser[];
    } catch (error) {
        console.error('Error getting admin users:', error);
        throw createAdminError(AdminErrorCode.DATABASE_ERROR, 'Không thể lấy danh sách admin');
    }
};

/**
 * Get all users (for admin user management)
 */
export const getAllUsers = async (page = 1, limit = 50): Promise<{
    users: AdminUser[];
    total: number;
    totalPages: number;
}> => {
    try {
        const offset = (page - 1) * limit;

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                select: { id: true, email: true, name: true, role: true, lastLoginAt: true },
                orderBy: { lastLoginAt: 'desc' },
                skip: offset,
                take: limit
            }),
            prisma.user.count()
        ]);

        return {
            users: users as AdminUser[],
            total,
            totalPages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error('Error getting all users:', error);
        throw createAdminError(AdminErrorCode.DATABASE_ERROR, 'Không thể lấy danh sách người dùng');
    }
};

/**
 * Update user role
 */
export const updateUserRole = async (userId: string, role: string): Promise<void> => {
    try {
        // Validate role
        const validRoles = ['user', ...Object.keys(ADMIN_ROLES)];
        if (!validRoles.includes(role)) {
            throw createAdminError(AdminErrorCode.VALIDATION_ERROR, 'Quyền không hợp lệ');
        }

        await prisma.user.update({
            where: { id: userId },
            data: { role }
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        if (error instanceof Error && 'code' in error) {
            throw error;
        }
        throw createAdminError(AdminErrorCode.DATABASE_ERROR, 'Không thể cập nhật quyền người dùng');
    }
};

/**
 * Bulk update user roles
 */
export const bulkUpdateUserRoles = async (updates: Array<{ userId: string; role: string }>): Promise<void> => {
    try {
        // Validate all roles first
        const validRoles = ['user', ...Object.keys(ADMIN_ROLES)];
        for (const update of updates) {
            if (!validRoles.includes(update.role)) {
                throw createAdminError(AdminErrorCode.VALIDATION_ERROR, `Quyền không hợp lệ: ${update.role}`);
            }
        }

        // Perform bulk update in transaction
        await prisma.$transaction(
            updates.map(update =>
                prisma.user.update({
                    where: { id: update.userId },
                    data: { role: update.role }
                })
            )
        );
    } catch (error) {
        console.error('Error bulk updating user roles:', error);
        if (error instanceof Error && 'code' in error) {
            throw error;
        }
        throw createAdminError(AdminErrorCode.DATABASE_ERROR, 'Không thể cập nhật quyền người dùng hàng loạt');
    }
};

/**
 * Session validation for admin routes
 */
export const validateAdminSession = async (req?: NextRequest): Promise<{
    isValid: boolean;
    user?: AdminUser;
    error?: string;
}> => {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return { isValid: false, error: 'Chưa đăng nhập' };
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, email: true, name: true, role: true, lastLoginAt: true }
        });

        if (!user) {
            return { isValid: false, error: 'Người dùng không tồn tại' };
        }

        if (!isAdminRole(user.role)) {
            return { isValid: false, error: 'Không có quyền truy cập admin' };
        }

        // Update last login time
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        });

        return { isValid: true, user: user as AdminUser };
    } catch (error) {
        console.error('Error validating admin session:', error);
        return { isValid: false, error: 'Lỗi xác thực phiên đăng nhập' };
    }
};

/**
 * Get available admin roles
 */
export const getAvailableRoles = (): Array<{ name: string; permissions: AdminPermission[] }> => {
    return Object.values(ADMIN_ROLES);
};

// Export alias for backward compatibility
export const requireAdminAuth = requireAdminRole;