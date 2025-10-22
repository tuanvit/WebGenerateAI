import { NextRequest, NextResponse } from 'next/server';
import { CommunityLibraryService } from '../../../../../services/library/CommunityLibraryService';

/**
 * GET /api/community/content/top-rated - Get top rated content by time period
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limitParam = searchParams.get('limit');
        const periodParam = searchParams.get('period');

        const limit = limitParam ? parseInt(limitParam) : 10;
        const period = (periodParam as 'week' | 'month' | 'year' | 'all') || 'month';

        if (limit < 1 || limit > 50) {
            return NextResponse.json(
                { error: 'Giới hạn phải từ 1 đến 50' },
                { status: 400 }
            );
        }

        if (!['week', 'month', 'year', 'all'].includes(period)) {
            return NextResponse.json(
                { error: 'Khoảng thời gian phải là: week, month, year, hoặc all' },
                { status: 400 }
            );
        }

        const topRatedContent = await CommunityLibraryService.getTopRatedContent(period, limit);

        return NextResponse.json({
            success: true,
            data: topRatedContent,
            period,
        });

    } catch (error) {
        console.error('Error getting top rated content:', error);

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi lấy nội dung được đánh giá cao. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}