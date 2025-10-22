import { NextRequest, NextResponse } from 'next/server';
import { CommunityLibraryService } from '../../../../../../services/library/CommunityLibraryService';

/**
 * GET /api/community/content/[id]/stats - Get statistics for specific content
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const contentId = params.id;

        // Get various statistics for the content
        const [
            ratingStats,
            saveStats,
            ratings
        ] = await Promise.all([
            CommunityLibraryService.getRatingStatistics(contentId),
            CommunityLibraryService.getContentSaveStatistics(contentId),
            CommunityLibraryService.getContentRatings(contentId)
        ]);

        return NextResponse.json({
            success: true,
            data: {
                rating: ratingStats,
                saves: saveStats,
                recentRatings: ratings.slice(0, 5), // Show only recent 5 ratings
                totalInteractions: ratingStats.totalRatings + saveStats.totalSaves
            },
        });

    } catch (error) {
        console.error('Error getting content statistics:', error);

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi lấy thống kê nội dung. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}