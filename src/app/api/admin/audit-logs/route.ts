/**
 * Admin Audit Logs API
 * Provides access to audit logs for admin users
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminMiddleware, withSearchValidation } from '@/lib/admin/admin-middleware';
import { requirePermission } from '@/lib/admin/admin-auth';
import {
    getAuditLogs,
    exportAuditLogs,
    searchAuditLogs,
    getSecurityAlerts,
    getAuditRetentionInfo,
    AdminAction,
    AdminResource,
    logAdminAction
} from '@/lib/admin/admin-audit';

/**
 * GET /api/admin/audit-logs - Get audit logs with filtering and search
 */
export const GET = withSearchValidation(
    async ({ req, user, searchParams }) => {
        // Check permission
        await requirePermission('audit_logs', 'read', req);

        const {
            page = '1',
            limit = '50',
            userId,
            action,
            resource,
            startDate,
            endDate,
            export: exportFormat,
            query,
            ipAddress,
            alerts
        } = searchParams;

        try {
            // Handle security alerts request
            if (alerts === 'true') {
                const securityAlerts = await getSecurityAlerts(24);
                return NextResponse.json({ alerts: securityAlerts });
            }

            // Handle retention info request
            if (query === 'retention-info') {
                const retentionInfo = await getAuditRetentionInfo();
                return NextResponse.json({ retentionInfo });
            }

            // Handle CSV export
            if (exportFormat === 'csv') {
                const csvData = await exportAuditLogs({
                    userId,
                    action: action as AdminAction,
                    resource: resource as AdminResource,
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined
                });

                // Log export action
                await logAdminAction(
                    user,
                    AdminAction.EXPORT_AUDIT_LOGS,
                    AdminResource.AUDIT_LOGS,
                    undefined,
                    {
                        filters: { userId, action, resource, startDate, endDate },
                        exportFormat: 'csv'
                    }
                );

                return new NextResponse(csvData, {
                    headers: {
                        'Content-Type': 'text/csv',
                        'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`
                    }
                });
            }

            // Handle search request
            if (query) {
                const result = await searchAuditLogs({
                    query,
                    userId,
                    action,
                    resource,
                    startDate,
                    endDate,
                    ipAddress,
                    page: parseInt(page),
                    limit: parseInt(limit)
                });

                return NextResponse.json({
                    logs: result.logs,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: result.total,
                        totalPages: result.totalPages
                    }
                });
            }

            // Handle regular audit logs request
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const result = await getAuditLogs({
                userId,
                action: action as AdminAction,
                resource: resource as AdminResource,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                limit: parseInt(limit),
                offset
            });

            // Log view action
            await logAdminAction(
                user,
                AdminAction.VIEW_AUDIT_LOGS,
                AdminResource.AUDIT_LOGS,
                undefined,
                {
                    filters: { userId, action, resource, startDate, endDate },
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            );

            return NextResponse.json({
                logs: result.logs,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: result.total,
                    totalPages: Math.ceil(result.total / parseInt(limit))
                }
            });
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            return NextResponse.json(
                { error: 'Không thể lấy nhật ký audit' },
                { status: 500 }
            );
        }
    }
);