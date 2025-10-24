/**
 * Admin Audit Logs Statistics API
 * Provides audit log statistics and analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminMiddleware } from '@/lib/admin/admin-middleware';
import { requirePermission } from '@/lib/admin/admin-auth';
import { getAuditLogStats, AdminAction, AdminResource } from '@/lib/admin/admin-audit';

/**
 * GET /api/admin/audit-logs/stats - Get audit log statistics
 */
export const GET = withAdminMiddleware(
    async ({ req }) => {
        // Check permission
        await requirePermission('audit_logs', 'read', req);

        const url = new URL(req.url);
        const days = parseInt(url.searchParams.get('days') || '30');

        try {
            const stats = await getAuditLogStats(days);

            return NextResponse.json({
                stats,
                period: `${days} days`
            });
        } catch (error) {
            console.error('Error fetching audit log stats:', error);
            return NextResponse.json(
                { error: 'Không thể lấy thống kê nhật ký audit' },
                { status: 500 }
            );
        }
    },
    {
        logAction: AdminAction.READ,
        logResource: AdminResource.AUDIT_LOGS
    }
);