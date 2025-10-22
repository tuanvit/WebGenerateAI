import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db-utils';

/**
 * POST /api/debug/test-rating-simple - Test rating without session
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { contentId, rating } = body;

        console.log('Testing rating with:', { contentId, rating });

        // Get any user to test with
        const testUser = await prisma.user.findFirst();

        if (!testUser) {
            return NextResponse.json(
                { error: 'No users found in database' },
                { status: 404 }
            );
        }

        console.log('Using test user:', testUser.id);

        // Check if content exists
        const content = await prisma.sharedContent.findUnique({
            where: { id: contentId }
        });

        if (!content) {
            return NextResponse.json(
                { error: 'Content not found' },
                { status: 404 }
            );
        }

        console.log('Content found:', content.title);

        // Check if user can rate (not their own content)
        if (content.authorId === testUser.id) {
            // Find a different user or create one
            let ratingUser = await prisma.user.findFirst({
                where: {
                    id: { not: content.authorId }
                }
            });

            if (!ratingUser) {
                ratingUser = await prisma.user.create({
                    data: {
                        email: `rater-${Date.now()}@example.com`,
                        name: 'Rating Test User',
                        subjects: JSON.stringify(['Toán học']),
                        gradeLevel: JSON.stringify([6, 7, 8, 9])
                    }
                });
            }

            console.log('Using different user for rating:', ratingUser.id);

            // Use the different user
            const existingRating = await prisma.contentRating.findUnique({
                where: {
                    userId_contentId: {
                        userId: ratingUser.id,
                        contentId: contentId
                    }
                }
            });

            const isUpdate = !!existingRating;

            // Upsert rating
            const result = await prisma.contentRating.upsert({
                where: {
                    userId_contentId: {
                        userId: ratingUser.id,
                        contentId: contentId
                    }
                },
                update: {
                    rating: rating
                },
                create: {
                    userId: ratingUser.id,
                    contentId: contentId,
                    rating: rating
                }
            });

            // Recalculate average rating
            const ratings = await prisma.contentRating.findMany({
                where: { contentId }
            });

            const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
            const averageRating = totalRating / ratings.length;

            await prisma.sharedContent.update({
                where: { id: contentId },
                data: {
                    rating: averageRating,
                    ratingCount: ratings.length
                }
            });

            const message = isUpdate ? 'Đánh giá đã được cập nhật' : 'Đánh giá đã được ghi nhận';

            return NextResponse.json({
                success: true,
                message,
                data: {
                    result,
                    isUpdate,
                    previousRating: existingRating?.rating || 0,
                    newRating: rating,
                    userId: ratingUser.id,
                    contentId,
                    newAverageRating: averageRating,
                    totalRatings: ratings.length
                }
            });
        } else {
            // Test user is not the author, can rate directly
            console.log('Test user can rate this content directly');

            const existingRating = await prisma.contentRating.findUnique({
                where: {
                    userId_contentId: {
                        userId: testUser.id,
                        contentId: contentId
                    }
                }
            });

            const isUpdate = !!existingRating;

            // Upsert rating
            const result = await prisma.contentRating.upsert({
                where: {
                    userId_contentId: {
                        userId: testUser.id,
                        contentId: contentId
                    }
                },
                update: {
                    rating: rating
                },
                create: {
                    userId: testUser.id,
                    contentId: contentId,
                    rating: rating
                }
            });

            // Recalculate average rating
            const ratings = await prisma.contentRating.findMany({
                where: { contentId }
            });

            const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
            const averageRating = totalRating / ratings.length;

            await prisma.sharedContent.update({
                where: { id: contentId },
                data: {
                    rating: averageRating,
                    ratingCount: ratings.length
                }
            });

            const message = isUpdate ? 'Đánh giá đã được cập nhật' : 'Đánh giá đã được ghi nhận';

            return NextResponse.json({
                success: true,
                message,
                data: {
                    result,
                    isUpdate,
                    previousRating: existingRating?.rating || 0,
                    newRating: rating,
                    userId: testUser.id,
                    contentId,
                    newAverageRating: averageRating,
                    totalRatings: ratings.length
                }
            });
        }

    } catch (error) {
        console.error('Test rating simple error:', error);

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