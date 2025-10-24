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
 * GET /api/admin/dashboard/export
 * Export dashboard data and metrics
 */
export async function GET(request: NextRequest) {
    try {
        // Require admin authentication
        const user = await requireAdminRole(request);

        const { searchParams } = new URL(request.url);
        const format = searchParams.get('format') || 'json';
        const includeAuditLogs = searchParams.get('includeAuditLogs') === 'true';

        // Validate format
        if (!['json', 'csv'].includes(format)) {
            return NextResponse.json(
                { error: 'Định dạng không hợp lệ. Sử dụng: json, csv' },
                { status: 400 }
            );
        }

        // Gather all dashboard data
        const [
            dashboardStats,
            systemHealth,
            contentStats,
            aiToolsStats,
            templatesStats,
            recentActivity
        ] = await Promise.all([
            dashboardService.getDashboardStats(),
            dashboardService.getSystemHealth(),
            dashboardService.getContentStats(),
            aiToolsService.getAIToolsStatistics(),
            templatesService.getTemplatesStatistics(),
            getRecentActivityForExport()
        ]);

        // Prepare export data
        const exportData = {
            exportInfo: {
                exportedAt: new Date().toISOString(),
                exportedBy: user.id,
                format,
                includeAuditLogs
            },
            dashboard: {
                stats: dashboardStats,
                health: systemHealth,
                content: contentStats
            },
            aiTools: aiToolsStats,
            templates: templatesStats,
            recentActivity
        };

        if (format === 'json') {
            return new NextResponse(JSON.stringify(exportData, null, 2), {
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename="dashboard-export-${new Date().toISOString().split('T')[0]}.json"`
                }
            });
        } else if (format === 'csv') {
            // Convert to CSV format (simplified)
            const csvData = convertDashboardDataToCSV(exportData);
            return new NextResponse(csvData, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="dashboard-export-${new Date().toISOString().split('T')[0]}.csv"`
                }
            });
        }

        return NextResponse.json(
            { error: 'Định dạng không được hỗ trợ' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Error in GET /api/admin/dashboard/export:', error);

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
}/**
 
* Convert dashboard data to CSV format
 */
function convertDashboardDataToCSV(data: any): string {
    const lines: string[] = [];

    // Add header
    lines.push('Metric,Value,Category,Timestamp');

    // Add dashboard stats
    if (data.dashboard?.stats) {
        Object.entries(data.dashboard.stats).forEach(([key, value]) => {
            lines.push(`${key},${value},Dashboard Stats,${data.exportInfo.exportedAt}`);
        });
    }

    // Add AI tools stats
    if (data.aiTools) {
        lines.push(`Total AI Tools,${data.aiTools.total},AI Tools,${data.exportInfo.exportedAt}`);
        lines.push(`Vietnamese Support Count,${data.aiTools.vietnameseSupportCount},AI Tools,${data.exportInfo.exportedAt}`);

        // Add category breakdown
        Object.entries(data.aiTools.byCategory || {}).forEach(([category, count]) => {
            lines.push(`${category} Tools,${count},AI Tools Category,${data.exportInfo.exportedAt}`);
        });
    }

    // Add templates stats
    if (data.templates) {
        lines.push(`Total Templates,${data.templates.total},Templates,${data.exportInfo.exportedAt}`);

        // Add subject breakdown
        Object.entries(data.templates.bySubject || {}).forEach(([subject, count]) => {
            lines.push(`${subject} Templates,${count},Templates Subject,${data.exportInfo.exportedAt}`);
        });
    }

    return lines.join('\n');
}/**
 * Get 
recent activity for export
 */
async function getRecentActivityForExport(): Promise<Array<{
    id: string;
    action: string;
    resource: string;
    userName: string;
    timestamp: Date;
}>> {
    const { prisma } = await import('@/lib/db');

    const recentLogs = await prisma.adminAuditLog.findMany({
        include: {
            user: {
                select: { name: true }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 100
    });

    return recentLogs.map(log => ({
        id: log.id,
        action: log.action,
        resource: log.resource,
        userName: log.user.name || 'Unknown',
        timestamp: log.createdAt
    }));
}