import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ContentModerationService } from '../../../../../../services/moderation/ContentModerationService';
import { ModerationFlag } from '../../../../../../types/moderation';
import { z } from 'zod';

const ReportSchema = z.object({
    flag: z.nativeEnum(ModerationFlag),
    reason: z.string().min(10, 'Lý do phải có ít nhất 10 ký tự').max(500, 'Lý do không được quá 500 ký tự'),
});

/**
 * POST /api/community/content/[id]/report - Report content for moderation
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Vui lòng đăng nhập để báo cáo nội dung' },
                { status: 401 }
            );
        }

        const contentId = params.id;
        const userId = session.user.id;
        const body = await request.json();

        const { flag, reason } = ReportSchema.parse(body);

        const report = await ContentModerationService.reportContent(
            contentId,
            userId,
            flag,
            reason
        );

        return NextResponse.json({
            success: true,
            data: report,
            message: 'Báo cáo đã được gửi thành công. Chúng tôi sẽ xem xét trong thời gian sớm nhất.',
        });

    } catch (error) {
        console.error('Error reporting content:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: 'Dữ liệu báo cáo không hợp lệ',
                    details: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi báo cáo nội dung. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/community/content/[id]/report - Get reports for specific content (admin only)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Vui lòng đăng nhập để xem báo cáo' },
                { status: 401 }
            );
        }

        // TODO: Add admin role check here
        // For now, we'll allow any authenticated user to see reports
        // In production, you should check if user has admin/moderator role

        const contentId = params.id;
        const reports = await ContentModerationService.getContentReports(contentId);

        return NextResponse.json({
            success: true,
            data: reports,
        });

    } catch (error) {
        console.error('Error getting content reports:', error);

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi lấy báo cáo. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}