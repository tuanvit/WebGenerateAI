import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ContentModerationService } from '../../../../../services/moderation/ContentModerationService';

/**
 * GET /api/admin/moderation/stats - Get moderation statistics (admin only)
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Vui lòng đăng nhập để xem thống kê kiểm duyệt' },
                { status: 401 }
            );
        }

        // TODO: Add admin role check here
        // For now, we'll allow any authenticated user to access moderation stats
        // In production, you should check if user has admin/moderator role

        const stats = await ContentModerationService.getModerationStats();

        return NextResponse.json({
            success: true,
            data: stats,
        });

    } catch (error) {
        console.error('Error getting moderation stats:', error);

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi lấy thống kê kiểm duyệt. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}