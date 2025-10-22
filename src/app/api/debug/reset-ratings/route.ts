import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db-utils';

/**
 * POST /api/debug/reset-ratings - Reset all ratings for testing
 */
export async function POST(request: NextRequest) {
    try {
        // Delete all ratings
        await prisma.contentRating.deleteMany({});

        // Reset all content ratings to 0
        await prisma.sharedContent.updateMany({
            data: {
                rating: 0,
                ratingCount: 0
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Đã reset tất cả đánh giá'
        });

    } catch (error) {
        console.error('Error resetting ratings:', error);
        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi reset đánh giá' },
            { status: 500 }
        );
    }
}