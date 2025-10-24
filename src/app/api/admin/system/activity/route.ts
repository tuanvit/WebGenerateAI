import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/admin/admin-auth';
import { AdminDashboardService } from '@/lib/admin/services/admin-dashboard-service';
import { AdminErrorCode } from '@/lib/admin/admin-errors';

const dashboardService = new AdminDashboardService();

/**
 * GET /api/admin/system/activity
 * Get recent system activity and monitoring data
 */
export async function GET(request: NextRequest) {
    try {
        // Require admin authentication
        await requireAdminRole(request);

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const hours = parseInt(searchParams.get('hours') || '24');

        // Validate parameters
        if (limit < 1 || limit > 1000) {
            return NextResponse.json(
                { error: 'Limit phải từ 1 đến 1000' },
                { status: 400 }
            );
        }

        if (hours < 1 || hours > 168) { // Max 1 week
            return NextResponse.json(
                { error: 'Thời gian phải từ 1 đến 168 giờ' },
                { status: 400 }
            );
        }

        // Get recent activity data from audit logs
        const activityData = await getRecentActivityFromAuditLogs(limit, hours);

        return NextResponse.json({
            success: true,
            activity: activityData,
            filters: {
                limit,
                hours
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in GET /api/admin/system/activity:', error);

        if (error instanceof Error && 'statusCode' in error) {
            return NextResponse.json(
                { error: error.message, code: (error as any).code },
                { status: (error as any).statusCode }
            );
        }

        return NextResponse.json(
            { error: 'Lỗi server nội bộ', code: AdminErrorCode.INTERNAL_SERVER_ERROR },
            { status: 500 }
        );
    }
}
/**

 * Get recent activity from audit logs
 */
async function getRecentActivityFromAuditLogs(limit: number, hours: number): Promise<Array<{
    id: string;
    action: string;
    resource: string;
    userName: string;
    timestamp: Date;
    details?: any;
}>> {
    const { prisma } = await import('@/lib/db');

    const hoursAgo = new Date();
    hoursAgo.setHours(hoursAgo.getHours() - hours);

    const recentLogs = await prisma.adminAuditLog.findMany({
        where: {
            createdAt: { gte: hoursAgo }
        },
        include: {
            user: {
                select: { name: true }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
    });

    return recentLogs.map(log => ({
        id: log.id,
        action: log.action,
        resource: log.resource,
        userName: log.user.name || 'Unknown',
        timestamp: log.createdAt,
        details: log.details ? JSON.parse(log.details) : null
    }));
}