/**
 * Audit Logs Cleanup API
 * Handles cleanup of old audit logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminMiddleware } from '@/lib/admin/admin-middleware';
import { requirePermission } from '@/lib/admin/admin-auth';
import { cleanupOldAuditLogs, logAdminAction, AdminAction, AdminResource } from '@/lib/admin/admin-audit';

/**
 * POST /api/admin/audit-logs/cleanup - Clean up old audit logs
 */
export const POST = withAdminMiddleware(
    async ({ req, user }) => {
        // Check permission (only full admin can cleanup logs)
        await requirePermission('audit_logs', 'delete', req);

        try {
            const body = await req.json();
            const retentionDays = body.retentionDays || 90;

            // Validate retention days
            if (retentionDays < 30) {
                return NextResponse.json(
                    { error: 'Thời gian lưu trữ tối thiểu là 30 ngày' },
                    { status: 400 }
                );
            }

            const deletedCount = await cleanupOldAuditLogs(retentionDays);

            // Log cleanup action
            await logAdminAction(
                user,
                AdminAction.CLEANUP_AUDIT_LOGS,
                AdminResource.AUDIT_LOGS,
                undefined,
                {
                    retentionDays,
                    deletedCount,
                    success: true
                }
            );

            return NextResponse.json({
                message: `Đã xóa ${deletedCount} bản ghi audit cũ`,
                deletedCount,
                retentionDays
            });
        } catch (error) {
            console.error('Error cleaning up audit logs:', error);

            // Log failed cleanup
            try {
                await logAdminAction(
                    user,
                    AdminAction.CLEANUP_AUDIT_LOGS,
                    AdminResource.AUDIT_LOGS,
                    undefined,
                    {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    }
                );
            } catch (logError) {
                console.error('Error logging cleanup failure:', logError);
            }

            return NextResponse.json(
                { error: 'Không thể dọn dẹp nhật ký audit' },
                { status: 500 }
            );
        }
    }
);