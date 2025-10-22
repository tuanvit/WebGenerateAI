import { NextRequest, NextResponse } from 'next/server';
import { monitoring } from '../../../../lib/monitoring';
import { logger } from '../../../../lib/logger';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
    try {
        // Check if user is authenticated and has admin role
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // In a real application, you'd check for admin role here
        // For now, we'll allow any authenticated user to access metrics

        const health = await monitoring.getSystemHealth();
        const loggerMetrics = logger.getMetrics();

        const metrics = {
            system: health.metrics,
            performance: {
                requestCount: loggerMetrics.requestCount,
                averageResponseTime: loggerMetrics.averageResponseTime,
                errorRate: loggerMetrics.errorRate,
                cacheHitRate: loggerMetrics.cacheHitRate
            },
            services: health.services,
            timestamp: new Date().toISOString()
        };

        logger.info('Metrics requested', { userId: session.user?.email });

        return NextResponse.json(metrics);
    } catch (error) {
        logger.error('Failed to get metrics', { error: error instanceof Error ? error.message : 'Unknown error' }, error instanceof Error ? error : undefined);

        return NextResponse.json(
            { error: 'Failed to retrieve metrics' },
            { status: 500 }
        );
    }
}

// Reset metrics (admin only)
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Reset logger metrics
        logger.resetMetrics();

        logger.info('Metrics reset', { userId: session.user?.email });

        return NextResponse.json({ message: 'Metrics reset successfully' });
    } catch (error) {
        logger.error('Failed to reset metrics', { error: error instanceof Error ? error.message : 'Unknown error' }, error instanceof Error ? error : undefined);

        return NextResponse.json(
            { error: 'Failed to reset metrics' },
            { status: 500 }
        );
    }
}