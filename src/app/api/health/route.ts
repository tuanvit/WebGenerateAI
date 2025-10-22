import { NextResponse } from 'next/server';
import { monitoring } from '../../../lib/monitoring';
import { logger } from '../../../lib/logger';

export async function GET() {
    try {
        const health = await monitoring.getSystemHealth();

        const statusCode = health.status === 'healthy' ? 200 :
            health.status === 'degraded' ? 200 : 500;

        logger.info('Health check requested', { status: health.status });

        return NextResponse.json({
            status: health.status,
            timestamp: health.timestamp,
            version: process.env.npm_package_version || '0.1.0',
            environment: process.env.NODE_ENV || 'development',
            services: health.services,
            metrics: health.metrics
        }, { status: statusCode });
    } catch (error) {
        logger.error('Health check failed', { error: error instanceof Error ? error.message : 'Unknown error' }, error instanceof Error ? error : undefined);

        return NextResponse.json(
            {
                status: 'unhealthy',
                error: 'Health check failed',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}