import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { CommunityLibraryService } from '../../../../services/library/CommunityLibraryService';

/**
 * GET /api/community/saved - Get user's saved content from community library
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Vui lòng đăng nhập để xem nội dung đã lưu' },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const savedContent = await CommunityLibraryService.getUserSavedContent(userId);

        return NextResponse.json({
            success: true,
            data: savedContent,
        });

    } catch (error) {
        console.error('Error getting saved content:', error);

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi lấy nội dung đã lưu. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}