import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ContentModerationService } from '../../../../../../../services/moderation/ContentModerationService';
import { z } from 'zod';

const ReviewSchema = z.object({
    action: z.enum(['approve', 'dismiss']),
    moderatorNotes: z.string().optional(),
});

/**
 * POST /api/admin/moderation/reports/[id]/review - Review a moderation report (admin only)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Vui lòng đăng nhập để xem xét báo cáo' },
                { status: 401 }
            );
        }

        // TODO: Add admin role check here
        // For now, we'll allow any authenticated user to review reports
        // In production, you should check if user has admin/moderator role

        const reportId = params.id;
        const reviewerId = session.user.id;
        const body = await request.json();

        const { action, moderatorNotes } = ReviewSchema.parse(body);

        await ContentModerationService.reviewReport(
            reportId,
            reviewerId,
            action,
            moderatorNotes
        );

        const actionMessage = action === 'approve'
            ? 'Báo cáo đã được phê duyệt và hành động đã được thực hiện'
            : 'Báo cáo đã được bác bỏ';

        return NextResponse.json({
            success: true,
            message: actionMessage,
        });

    } catch (error) {
        console.error('Error reviewing report:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: 'Dữ liệu xem xét không hợp lệ',
                    details: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi xem xét báo cáo. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}