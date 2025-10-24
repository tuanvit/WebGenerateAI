import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Helper function to ensure user exists in database
async function ensureUserExists(userId: string, session: any) {
    // First try to find by ID
    let user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user && session.user.email) {
        // Try to find by email
        user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (user && user.id !== userId) {
            // Update the user ID to match session
            user = await prisma.user.update({
                where: { email: session.user.email },
                data: {
                    id: userId,
                    lastLoginAt: new Date()
                }
            });
        }
    }

    if (!user) {
        // Create user if doesn't exist
        try {
            user = await prisma.user.create({
                data: {
                    id: userId,
                    email: session.user.email || '',
                    name: session.user.name || '',
                    subjects: JSON.stringify([]),
                    gradeLevel: JSON.stringify([]),
                    lastLoginAt: new Date()
                }
            });
        } catch (createError: any) {
            // If email constraint fails, try to find existing user
            if (createError.code === 'P2002' && session.user.email) {
                user = await prisma.user.findUnique({
                    where: { email: session.user.email }
                });
                if (!user) {
                    throw createError;
                }
            } else {
                throw createError;
            }
        }
    }

    return user;
}

const RatingSchema = z.object({
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
});

/**
 * GET /api/community/content/[id]/rating - Get user's rating for content
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Vui lòng đăng nhập để xem đánh giá' },
                { status: 401 }
            );
        }

        const { id: contentId } = await params;
        const userId = session.user.id;

        try {
            // Ensure user exists in database
            const user = await ensureUserExists(userId, session);

            // Check if user rating exists in database
            const userRating = await prisma.contentRating.findUnique({
                where: {
                    userId_contentId: {
                        userId: user.id,
                        contentId
                    }
                }
            });

            // Check if user can rate this content (not their own content)
            const content = await prisma.sharedContent.findUnique({
                where: { id: contentId },
                select: { authorId: true }
            });

            const canRate = content ? content.authorId !== user.id : false;

            return NextResponse.json({
                success: true,
                data: {
                    userRating: userRating?.rating || 0,
                    canRate,
                },
            });

        } catch (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json(
                {
                    error: 'Lỗi database khi lấy đánh giá. Vui lòng thử lại.',
                    details: dbError instanceof Error ? dbError.message : 'Unknown database error'
                },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Error getting user rating:', error);
        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi lấy đánh giá. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/community/content/[id]/rating - Rate content
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Vui lòng đăng nhập để đánh giá' },
                { status: 401 }
            );
        }

        const { id: contentId } = await params;
        const userId = session.user.id;
        const body = await request.json();

        const { rating, comment } = RatingSchema.parse(body);

        try {
            // Ensure user exists in database
            const user = await ensureUserExists(userId, session);

            // Check if content exists and user can rate it
            const content = await prisma.sharedContent.findUnique({
                where: { id: contentId }
            });

            if (!content) {
                return NextResponse.json(
                    { error: 'Nội dung không tồn tại' },
                    { status: 404 }
                );
            }

            // Check if user can rate this content (not their own content)
            if (content.authorId === user.id) {
                return NextResponse.json(
                    { error: 'Bạn không thể đánh giá nội dung của chính mình' },
                    { status: 403 }
                );
            }

            // Check if user already rated this content
            const existingRating = await prisma.contentRating.findUnique({
                where: {
                    userId_contentId: {
                        userId: user.id,
                        contentId
                    }
                }
            });

            const isUpdate = !!existingRating;

            // Use transaction to update rating
            await prisma.$transaction(async (tx) => {
                // Upsert rating (create or update)
                await tx.contentRating.upsert({
                    where: {
                        userId_contentId: {
                            userId: user.id,
                            contentId
                        }
                    },
                    update: {
                        rating: rating,
                        comment: comment || null
                    },
                    create: {
                        userId: user.id,
                        contentId,
                        rating: rating,
                        comment: comment || null
                    }
                });

                // Recalculate average rating
                const ratings = await tx.contentRating.findMany({
                    where: { contentId }
                });

                const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
                const averageRating = totalRating / ratings.length;

                // Update shared content with new rating
                await tx.sharedContent.update({
                    where: { id: contentId },
                    data: {
                        rating: averageRating,
                        ratingCount: ratings.length
                    }
                });
            });

            const message = isUpdate ? 'Đánh giá đã được cập nhật' : 'Đánh giá đã được ghi nhận';

            return NextResponse.json({
                success: true,
                message,
                data: {
                    isUpdate,
                    previousRating: existingRating?.rating || 0,
                    newRating: rating
                }
            });

        } catch (dbError) {
            console.error('Database error when rating:', dbError);
            console.error('Error details:', {
                contentId,
                userId,
                rating,
                error: dbError instanceof Error ? dbError.message : dbError
            });

            return NextResponse.json(
                {
                    error: 'Lỗi database khi lưu đánh giá. Vui lòng thử lại.',
                    details: dbError instanceof Error ? dbError.message : 'Unknown database error',
                    debug: {
                        contentId,
                        userId,
                        rating
                    }
                },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Error rating content:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: 'Đánh giá không hợp lệ (phải từ 1-5 sao)',
                    details: error.issues.map((err: any) => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi đánh giá. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/community/content/[id]/rating - Remove user's rating
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Vui lòng đăng nhập để xóa đánh giá' },
                { status: 401 }
            );
        }

        const { id: contentId } = await params;
        const userId = session.user.id;

        try {
            // Ensure user exists in database
            const user = await ensureUserExists(userId, session);

            // Check if rating exists
            const existingRating = await prisma.contentRating.findUnique({
                where: {
                    userId_contentId: {
                        userId: user.id,
                        contentId
                    }
                }
            });

            if (!existingRating) {
                return NextResponse.json(
                    { error: 'Đánh giá không tồn tại' },
                    { status: 404 }
                );
            }

            // Use transaction to remove rating and update content
            await prisma.$transaction(async (tx) => {
                // Remove the rating
                await tx.contentRating.delete({
                    where: {
                        userId_contentId: {
                            userId: user.id,
                            contentId
                        }
                    }
                });

                // Recalculate average rating
                const remainingRatings = await tx.contentRating.findMany({
                    where: { contentId }
                });

                let averageRating = 0;
                if (remainingRatings.length > 0) {
                    const totalRating = remainingRatings.reduce((sum, r) => sum + r.rating, 0);
                    averageRating = totalRating / remainingRatings.length;
                }

                // Update shared content
                await tx.sharedContent.update({
                    where: { id: contentId },
                    data: {
                        rating: averageRating,
                        ratingCount: remainingRatings.length
                    }
                });
            });

            return NextResponse.json({
                success: true,
                message: 'Đánh giá đã được xóa',
            });

        } catch (dbError) {
            console.error('Database error when removing rating:', dbError);

            return NextResponse.json(
                {
                    error: 'Lỗi database khi xóa đánh giá. Vui lòng thử lại.',
                    details: dbError instanceof Error ? dbError.message : 'Unknown database error'
                },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Error removing rating:', error);

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi xóa đánh giá. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}