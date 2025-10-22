import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const RatingSchema = z.object({
    rating: z.number().min(1).max(5),
});

// In-memory storage for testing (replace with database in production)
const userRatings: Record<string, Record<string, number>> = {};

/**
 * POST /api/community/content/[id]/rating-simple - Simple rating endpoint for testing
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Vui lòng đăng nhập để đánh giá' },
                { status: 401 }
            );
        }

        const contentId = params.id;
        const userId = session.user.id;
        const body = await request.json();

        const { rating } = RatingSchema.parse(body);

        // Check if user already rated this content
        const previousRating = userRatings[userId]?.[contentId] || 0;
        const isUpdate = previousRating > 0;

        // Store rating in memory
        if (!userRatings[userId]) {
            userRatings[userId] = {};
        }
        userRatings[userId][contentId] = rating;

        const message = isUpdate ? 'Đánh giá đã được cập nhật' : 'Đánh giá đã được ghi nhận';
        console.log(`User ${userId} ${isUpdate ? 'updated' : 'rated'} content ${contentId} with ${rating} stars (previous: ${previousRating})`);

        return NextResponse.json({
            success: true,
            message,
            data: {
                userId,
                contentId,
                rating,
                previousRating,
                isUpdate
            }
        });

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
 * GET /api/community/content/[id]/rating-simple - Get user's rating
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Vui lòng đăng nhập để xem đánh giá' },
                { status: 401 }
            );
        }

        const contentId = params.id;
        const userId = session.user.id;

        const userRating = userRatings[userId]?.[contentId] || 0;

        return NextResponse.json({
            success: true,
            data: {
                userRating,
                canRate: true,
            },
        });

    } catch (error) {
        console.error('Error getting user rating:', error);

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi lấy đánh giá. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}