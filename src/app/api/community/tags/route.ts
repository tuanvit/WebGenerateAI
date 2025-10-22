import { NextRequest, NextResponse } from 'next/server';
import { CommunityLibraryService, getAllTags } from '../../../../services/library/CommunityLibraryService';

/**
 * GET /api/community/tags - Get available tags and trending tags
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // 'all', 'trending', or 'suggested'

        if (type === 'trending') {
            const limitParam = searchParams.get('limit');
            const limit = limitParam ? parseInt(limitParam) : 10;

            if (limit < 1 || limit > 50) {
                return NextResponse.json(
                    { error: 'Giới hạn phải từ 1 đến 50' },
                    { status: 400 }
                );
            }

            const trendingTags = await CommunityLibraryService.getTrendingTags(limit);

            return NextResponse.json({
                success: true,
                data: trendingTags,
                type: 'trending',
            });
        }

        if (type === 'suggested') {
            const content = searchParams.get('content');
            const subject = searchParams.get('subject');

            if (!content) {
                return NextResponse.json(
                    { error: 'Nội dung không được để trống để gợi ý thẻ tag' },
                    { status: 400 }
                );
            }

            const suggestedTags = await CommunityLibraryService.getSuggestedTags(content, subject || undefined);

            return NextResponse.json({
                success: true,
                data: suggestedTags,
                type: 'suggested',
            });
        }

        // Default: return all available tags
        const allTags = getAllTags();

        return NextResponse.json({
            success: true,
            data: allTags,
            type: 'all',
        });

    } catch (error) {
        console.error('Error getting tags:', error);

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi lấy thẻ tag. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}