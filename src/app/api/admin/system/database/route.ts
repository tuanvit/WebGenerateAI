/**
 * Database Monitoring API Route
 * Provides database health, performance metrics, and optimization tools
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/admin/admin-auth';
import { AdminErrorCode } from '@/lib/admin/admin-errors';
import {
    DatabaseMonitoring,
    PerformanceMonitor,
    getCacheMetrics
} from '@/lib/admin/database-optimization';

/**
 * GET /api/admin/system/database
 * Get database health and performance metrics
 */
export async function GET(request: NextRequest) {
    try {
        // Require admin authentication
        await requireAdminRole(request);

        const [
            connectionHealth,
            queryMetrics,
            performanceStats,
            cacheMetrics
        ] = await Promise.all([
            DatabaseMonitoring.checkConnectionHealth(),
            DatabaseMonitoring.getQueryMetrics(),
            PerformanceMonitor.getPerformanceStats(),
            getCacheMetrics()
        ]);

        return NextResponse.json({
            success: true,
            data: {
                connection: connectionHealth,
                queries: queryMetrics,
                performance: performanceStats,
                cache: cacheMetrics,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error in GET /api/admin/system/database:', error);

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
 * POST /api/admin/system/database/optimize
 * Optimize database performance
 */
export async function POST(request: NextRequest) {
    try {
        // Require admin authentication
        await requireAdminRole(request);

        const optimization = await DatabaseMonitoring.optimizeDatabase();

        return NextResponse.json({
            success: optimization.success,
            data: {
                optimizations: optimization.optimizations,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error in POST /api/admin/system/database/optimize:', error);

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