/**
 * Admin User Management API
 * Handles individual user operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminMiddleware } from '@/lib/admin/admin-middleware';
import { requirePermission, updateUserRole } from '@/lib/admin/admin-auth';
import { AdminAction, AdminResource } from '@/lib/admin/admin-audit';
import { prisma } from '@/lib/db';
import { adminUserUpdateSchema } from '@/lib/admin/admin-validation';

/**
 * GET /api/admin/users/[id] - Get user by ID
 */
export const GET = withAdminMiddleware(
    async ({ req }, { params }: { params: Promise<{ id: string }> }) => {
        await requirePermission('users', 'read', req);

        try {
            const user = await prisma.user.findUnique({
                where: { id: id },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    school: true,
                    subjects: true,
                    gradeLevel: true,
                    createdAt: true,
                    lastLoginAt: true,
                    _count: {
                        select: {
                            generatedPrompts: true,
                            sharedContent: true,
                            contentRatings: true
                        }
                    }
                }
            });

            if (!user) {
                return NextResponse.json(
                    { error: 'Người dùng không tồn tại' },
                    { status: 404 }
                );
            }

            return NextResponse.json({ user });
        } catch (error) {
            console.error('Error fetching user:', error);
            return NextResponse.json(
                { error: 'Không thể lấy thông tin người dùng' },
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
 * PUT /api/admin/users/[id] - Update user
 */
export const PUT = withAdminMiddleware(
    async ({ req }, { params }: { params: Promise<{ id: string }> }) => {
        await requirePermission('users', 'update', req);

        try {
            const body = await req.json();
            const validatedData = adminUserUpdateSchema.parse(body);

            const updatedUser = await prisma.user.update({
                where: { id: id },
                data: validatedData,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    school: true,
                    subjects: true,
                    gradeLevel: true,
                    lastLoginAt: true
                }
            });

            return NextResponse.json({
                user: updatedUser,
                message: 'Cập nhật thông tin người dùng thành công'
            });
        } catch (error) {
            console.error('Error updating user:', error);
            return NextResponse.json(
                { error: 'Không thể cập nhật thông tin người dùng' },
                { status: 500 }
            );
        }
    },
    {
        logAction: AdminAction.UPDATE,
        logResource: AdminResource.USERS
    }
);

/**
 * DELETE /api/admin/users/[id] - Delete user
 */
export const DELETE = withAdminMiddleware(
    async ({ req }, { params }: { params: Promise<{ id: string }> }) => {
        await requirePermission('users', 'delete', req);

        try {
            // Check if user exists
            const user = await prisma.user.findUnique({
                where: { id: id },
                select: { id: true, email: true, role: true }
            });

            if (!user) {
                return NextResponse.json(
                    { error: 'Người dùng không tồn tại' },
                    { status: 404 }
                );
            }

            // Prevent deleting admin users (safety check)
            if (user.role === 'admin') {
                return NextResponse.json(
                    { error: 'Không thể xóa tài khoản admin' },
                    { status: 403 }
                );
            }

            await prisma.user.delete({
                where: { id: id }
            });

            return NextResponse.json({
                message: 'Xóa người dùng thành công'
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            return NextResponse.json(
                { error: 'Không thể xóa người dùng' },
                { status: 500 }
            );
        }
    },
    {
        logAction: AdminAction.DELETE,
        logResource: AdminResource.USERS
    }
);