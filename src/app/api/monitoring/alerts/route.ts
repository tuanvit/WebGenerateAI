import { NextRequest, NextResponse } from 'next/server';
import { monitoring } from '../../../../lib/monitoring';
import { logger } from '../../../../lib/logger';
import { getServerSession } from 'next-auth';

// Get alert status and trigger manual alert check
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Trigger manual alert check
        await monitoring.checkAlerts();

        const health = await monitoring.getSystemHealth();

        const alertStatus = {
            systemStatus: health.status,
            services: health.services,
            metrics: health.metrics,
            alertsChecked: true,
            timestamp: new Date().toISOString()
        };

        logger.info('Alert check requested', { userId: session.user?.email });

        return NextResponse.json(alertStatus);
    } catch (error) {
        logger.error('Failed to check alerts', { error: error instanceof Error ? error.message : 'Unknown error' }, error instanceof Error ? error : undefined);

        return NextResponse.json(
            { error: 'Failed to check alerts' },
            { status: 500 }
        );
    }
}

// Send test alert
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { type, message } = body;

        if (!type || !message) {
            return NextResponse.json(
                { error: 'Type and message are required' },
                { status: 400 }
            );
        }

        // Log test alert
        logger.warn(`Test alert: ${type}`, {
            message,
            testAlert: true,
            triggeredBy: session.user?.email
        });

        return NextResponse.json({
            message: 'Test alert sent successfully',
            type,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Failed to send test alert', { error: error instanceof Error ? error.message : 'Unknown error' }, error instanceof Error ? error : undefined);

        return NextResponse.json(
            { error: 'Failed to send test alert' },
            { status: 500 }
        );
    }
}