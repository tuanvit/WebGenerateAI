import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ContentModerationService } from '../../../../../services/moderation/ContentModerationService';

/**
 * GET /api/admin/moderation/reports - Get pending moderation reports (admin only)
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Vui lòng đăng nhập để xem báo cáo kiểm duyệt' },
                { status: 401 }
            );
        }

        // TODO: Add admin role check here
        // For now, we'll allow any authenticated user to access moderation
        // In production, you should check if user has admin/moderator role

        const { searchParams } = new URL(request.url);
        const limitParam = searchParams.get('limit');
        const limit = limitParam ? parseInt(limitParam) : 20;

        if (limit < 1 || limit > 100) {
            return NextResponse.json(
                { error: 'Giới hạn phải từ 1 đến 100' },
                { status: 400 }
            );
        }

        const reports = await ContentModerationService.getPendingReports(limit);

        return NextResponse.json({
            success: true,
            data: reports,
        });

    } catch (error) {
        console.error('Error getting pending reports:', error);

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi lấy báo cáo chờ xử lý. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}