/**
 * Admin User Roles Management API
 * Handles role updates and bulk operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminMiddleware } from '@/lib/admin/admin-middleware';
import { requirePermission, updateUserRole, bulkUpdateUserRoles, getAvailableRoles } from '@/lib/admin/admin-auth';
import { AdminAction, AdminResource } from '@/lib/admin/admin-audit';
import { adminBulkRoleUpdateSchema } from '@/lib/admin/admin-validation';

/**
 * GET /api/admin/users/roles - Get available roles
 */
export const GET = withAdminMiddleware(
    async ({ req }) => {
        await requirePermission('users', 'read', req);

        try {
            const roles = getAvailableRoles();
            return NextResponse.json({ roles });
        } catch (error) {
            console.error('Error fetching roles:', error);
            return NextResponse.json(
                { error: 'Không thể lấy danh sách quyền' },
                { status: 500 }
            );
        }
    },
    {
        logAction: AdminAction.READ,
        logResource: AdminResource.USERS
    }
);

/**
 * PUT /api/admin/users/roles - Bulk update user roles
 */
export const PUT = withAdminMiddleware(
    async ({ req }) => {
        await requirePermission('users', 'manage_roles', req);

        try {
            const body = await req.json();
            const validatedData = adminBulkRoleUpdateSchema.parse(body);

            await bulkUpdateUserRoles(validatedData.updates);

            return NextResponse.json({
                message: `Cập nhật quyền cho ${validatedData.updates.length} người dùng thành công`
            });
        } catch (error) {
            console.error('Error bulk updating user roles:', error);
            return NextResponse.json(
                { error: 'Không thể cập nhật quyền người dùng hàng loạt' },
                { status: 500 }
            );
        }
    },
    {
        logAction: AdminAction.BULK_UPDATE,
        logResource: AdminResource.USERS
    }
);