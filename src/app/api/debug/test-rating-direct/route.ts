import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db-utils';

/**
 * POST /api/debug/test-rating-direct - Test rating directly with debug info
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        console.log('Session:', session);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'No session or user ID' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { contentId, rating } = body;

        console.log('Request data:', { contentId, rating, userId: session.user.id });

        // Check if content exists
        const content = await prisma.sharedContent.findUnique({
            where: { id: contentId }
        });

        console.log('Content found:', content ? 'Yes' : 'No');

        if (!content) {
            return NextResponse.json(
                { error: 'Content not found' },
                { status: 404 }
            );
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Try to create/update rating
        const result = await prisma.contentRating.upsert({
            where: {
                userId_contentId: {
                    userId: session.user.id,
                    contentId: contentId
                }
            },
            update: {
                rating: rating
            },
            create: {
                userId: session.user.id,
                contentId: contentId,
                rating: rating
            }
        });

        console.log('Rating upsert result:', result);

        return NextResponse.json({
            success: true,
            message: 'Rating test successful',
            data: {
                result,
                contentId,
                userId: session.user.id,
                rating
            }
        });

    } catch (error) {
        console.error('Test rating error:', error);

        return NextResponse.json(
            {
                error: 'Test rating failed',
                details: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}