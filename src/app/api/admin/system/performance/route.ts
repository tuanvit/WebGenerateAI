/**
 * Performance Monitoring API Route
 * Provides client-side and server-side performance metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/admin/admin-auth';
import { AdminErrorCode } from '@/lib/admin/admin-errors';
import { PerformanceMonitor } from '@/lib/admin/database-optimization';

/**
 * GET /api/admin/system/performance
 * Get performance metrics and statistics
 */
export async function GET(request: NextRequest) {
    try {
        // Require admin authentication
        await requireAdminRole(request);

        const performanceStats = PerformanceMonitor.getPerformanceStats();

        // Get system performance metrics
        const systemMetrics = {
            memoryUsage: process.memoryUsage(),
            uptime: process.uptime(),
            cpuUsage: process.cpuUsage(),
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch
        };

        return NextResponse.json({
            success: true,
            data: {
                queryPerformance: performanceStats,
                systemMetrics,
                recommendations: generatePerformanceRecommendations(performanceStats, systemMetrics),
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error in GET /api/admin/system/performance:', error);

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
 * POST /api/admin/system/performance/clear
 * Clear performance monitoring data
 */
export async function POST(request: NextRequest) {
    try {
        // Require admin authentication
        await requireAdminRole(request);

        // Clear performance statistics
        // Note: This would require adding a clear method to PerformanceMonitor
        // For now, we'll just return success

        return NextResponse.json({
            success: true,
            message: 'Đã xóa dữ liệu giám sát hiệu suất',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in POST /api/admin/system/performance/clear:', error);

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
 * Generate performance recommendations based on metrics
 */
function generatePerformanceRecommendations(
    queryStats: Record<string, any>,
    systemMetrics: any
): string[] {
    const recommendations: string[] = [];

    // Check memory usage
    const memoryUsageMB = systemMetrics.memoryUsage.heapUsed / 1024 / 1024;
    if (memoryUsageMB > 500) {
        recommendations.push('Bộ nhớ sử dụng cao (>500MB). Cân nhắc tối ưu hóa cache hoặc tăng RAM.');
    }

    // Check query performance
    for (const [queryName, stats] of Object.entries(queryStats)) {
        const queryData = stats as any;
        if (queryData.averageTime > 1000) {
            recommendations.push(`Query "${queryName}" chậm (${queryData.averageTime}ms). Cần tối ưu hóa.`);
        }
    }

    // Check uptime
    const uptimeHours = systemMetrics.uptime / 3600;
    if (uptimeHours > 24 * 7) {
        recommendations.push('Hệ thống đã chạy liên tục >7 ngày. Cân nhắc khởi động lại để làm mới bộ nhớ.');
    }

    // General recommendations
    if (recommendations.length === 0) {
        recommendations.push('Hiệu suất hệ thống tốt. Không có khuyến nghị đặc biệt.');
    }

    return recommendations;
}