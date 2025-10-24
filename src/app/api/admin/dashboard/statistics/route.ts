import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/admin/admin-auth';
import { AdminDashboardService } from '@/lib/admin/services/admin-dashboard-service';
import { AIToolsService } from '@/lib/admin/services/ai-tools-service';
import { TemplatesService } from '@/lib/admin/services/templates-service';
import { AdminErrorCode } from '@/lib/admin/admin-errors';

const dashboardService = new AdminDashboardService();
const aiToolsService = new AIToolsService();
const templatesService = new TemplatesService();

/**
 * GET /api/admin/dashboard/statistics
 * Get detailed dashboard statistics and metrics
 */
export async function GET(request: NextRequest) {
    try {
        // Require admin authentication
        await requireAdminRole(request);

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, 1y

        // Validate period
        const validPeriods = ['7d', '30d', '90d', '1y'];
        if (!validPeriods.includes(period)) {
            return NextResponse.json(
                { error: 'Khoảng thời gian không hợp lệ. Sử dụng: 7d, 30d, 90d, 1y' },
                { status: 400 }
            );
        }

        // Get comprehensive statistics
        const [
            aiToolsStats,
            templatesStats,
            dashboardStats,
            contentStats
        ] = await Promise.all([
            aiToolsService.getAIToolsStatistics(),
            templatesService.getTemplatesStatistics(),
            dashboardService.getDashboardStats(),
            dashboardService.getContentStats()
        ]);

        // Calculate growth metrics based on period
        const growthMetrics = await calculateGrowthMetrics(period);

        return NextResponse.json({
            success: true,
            statistics: {
                aiTools: aiToolsStats,
                templates: templatesStats,
                dashboard: dashboardStats,
                content: contentStats,
                growth: growthMetrics
            },
            period,
            generatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in GET /api/admin/dashboard/statistics:', error);

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
 * Calculate growth metrics for the specified period
 */
async function calculateGrowthMetrics(period: string): Promise<{
    aiToolsGrowth: number;
    templatesGrowth: number;
    activityGrowth: number;
}> {
    // Calculate date range based on period
    const now = new Date();
    const periodStart = new Date();

    switch (period) {
        case '7d':
            periodStart.setDate(now.getDate() - 7);
            break;
        case '30d':
            periodStart.setDate(now.getDate() - 30);
            break;
        case '90d':
            periodStart.setDate(now.getDate() - 90);
            break;
        case '1y':
            periodStart.setFullYear(now.getFullYear() - 1);
            break;
    }

    // For now, return mock growth data
    // In a real implementation, you would query the database for historical data
    return {
        aiToolsGrowth: Math.floor(Math.random() * 20) - 10, // -10% to +10%
        templatesGrowth: Math.floor(Math.random() * 30) - 15, // -15% to +15%
        activityGrowth: Math.floor(Math.random() * 40) - 20 // -20% to +20%
    };
}