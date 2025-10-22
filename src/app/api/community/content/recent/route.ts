import { NextRequest, NextResponse } from 'next/server';
import { CommunityLibraryService } from '../../../../../services/library/CommunityLibraryService';

/**
 * GET /api/community/content/recent - Get recent content
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limitParam = searchParams.get('limit');
        const limit = limitParam ? parseInt(limitParam) : 10;

        if (limit < 1 || limit > 50) {
            return NextResponse.json(
                { error: 'Giới hạn phải từ 1 đến 50' },
                { status: 400 }
            );
        }

        const recentContent = await CommunityLibraryService.getRecentContent(limit);

        return NextResponse.json({
            success: true,
            data: recentContent,
        });

    } catch (error) {
        console.error('Error getting recent content:', error);

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi lấy nội dung mới. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}