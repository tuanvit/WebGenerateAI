import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/community/user/ratings - Get current user's ratings
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Vui lòng đăng nhập để xem đánh giá' },
                { status: 401 }
            );
        }

        // For now, return empty ratings object
        // In production, this would fetch from database
        const userRatings = {};

        return NextResponse.json({
            success: true,
            data: userRatings,
        });

    } catch (error) {
        console.error('Error getting user ratings:', error);

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi lấy đánh giá người dùng. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}