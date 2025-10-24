/**
 * Admin Users Management API
 * Handles CRUD operations for user management
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminMiddleware } from '@/lib/admin/admin-middleware';
import { requirePermission, getAllUsers } from '@/lib/admin/admin-auth';
import { AdminAction, AdminResource } from '@/lib/admin/admin-audit';

/**
 * GET /api/admin/users - Get all users with pagination
 */
export const GET = withAdminMiddleware(
    async ({ req }) => {
        // Check permission
        await requirePermission('users', 'read', req);

        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const search = url.searchParams.get('search') || '';

        try {
            const result = await getAllUsers(page, limit);

            // Filter by search if provided
            let filteredUsers = result.users;
            if (search) {
                const searchLower = search.toLowerCase();
                filteredUsers = result.users.filter(user =>
                    user.name.toLowerCase().includes(searchLower) ||
                    user.email.toLowerCase().includes(searchLower)
                );
            }

            return NextResponse.json({
                users: filteredUsers,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    totalPages: result.totalPages
                }
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            return NextResponse.json(
                { error: 'Không thể lấy danh sách người dùng' },
                { status: 500 }
            );
        }
    },
    {
        logAction: AdminAction.READ,
        logResource: AdminResource.USERS
    }
);