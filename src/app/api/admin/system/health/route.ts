import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/admin/admin-auth';
import { AdminDashboardService } from '@/lib/admin/services/admin-dashboard-service';
import { AdminErrorCode } from '@/lib/admin/admin-errors';

const dashboardService = new AdminDashboardService();

/**
 * GET /api/admin/system/health
 * Get system health status and metrics
 */
export async function GET(request: NextRequest) {
    try {
        // Require admin authentication
        await requireAdminRole(request);

        // Get system health information
        const healthData = await dashboardService.getSystemHealth();

        return NextResponse.json({
            success: true,
            health: healthData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in GET /api/admin/system/health:', error);

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