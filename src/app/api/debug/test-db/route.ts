import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db-utils';

/**
 * GET /api/debug/test-db - Test database connection
 */
export async function GET(request: NextRequest) {
    try {
        // Test basic connection
        const userCount = await prisma.user.count();
        const contentCount = await prisma.sharedContent.count();
        const ratingCount = await prisma.contentRating.count();

        // Test a simple query
        const sampleUser = await prisma.user.findFirst({
            select: {
                id: true,
                name: true,
                email: true
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Database connection successful',
            data: {
                userCount,
                contentCount,
                ratingCount,
                sampleUser,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Database connection error:', error);

        return NextResponse.json(
            {
                error: 'Database connection failed',
                details: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}