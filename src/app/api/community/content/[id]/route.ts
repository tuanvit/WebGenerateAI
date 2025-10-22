import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { CommunityLibraryService } from '../../../../../services/library/CommunityLibraryService';

/**
 * GET /api/community/content/[id] - Get specific shared content by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const contentId = params.id;
        const content = await CommunityLibraryService.getContentById(contentId);

        if (!content) {
            return NextResponse.json(
                { error: 'Không tìm thấy nội dung' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: content,
        });

    } catch (error) {
        console.error('Error getting content by ID:', error);

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi lấy nội dung. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}