/**
 * User-specific Audit Logs API
 * Provides audit logs for a specific user
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminMiddleware } from '@/lib/admin/admin-middleware';
import { requirePermission } from '@/lib/admin/admin-auth';
import { getUserActivitySummary, AdminAction, AdminResource } from '@/lib/admin/admin-audit';

/**
 * GET /api/admin/audit-logs/users/[userId] - Get user activity summary
 */
export const GET = withAdminMiddleware(
    async ({ req }, { params }: { params: { userId: string } }) => {
        // Check permission
        await requirePermission('audit_logs', 'read', req);

        const url = new URL(req.url);
        const days = parseInt(url.searchParams.get('days') || '30');

        try {
            const activitySummary = await getUserActivitySummary(params.userId, days);

            return NextResponse.json({
                userId: params.userId,
                activitySummary,
                period: `${days} days`
            });
        } catch (error) {
            console.error('Error fetching user activity summary:', error);
            return NextResponse.json(
                { error: 'Không thể lấy tóm tắt hoạt động người dùng' },
                { status: 500 }
            );
        }
    },
    {
        logAction: AdminAction.READ,
        logResource: AdminResource.AUDIT_LOGS
    }
);