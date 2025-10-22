import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { CommunityLibraryService } from '../../../../../../services/library/CommunityLibraryService';
import { z } from 'zod';

const AdaptationSchema = z.object({
    subject: z.string().optional(),
    gradeLevel: z.union([z.literal(6), z.literal(7), z.literal(8), z.literal(9)]).optional(),
    customizations: z.string().optional(),
});

/**
 * POST /api/community/content/[id]/adapt - Adapt community content for personal use
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Vui lòng đăng nhập để tùy chỉnh nội dung' },
                { status: 401 }
            );
        }

        const contentId = params.id;
        const userId = session.user.id;
        const body = await request.json();

        const adaptationData = AdaptationSchema.parse(body);

        const adaptedPromptId = await CommunityLibraryService.adaptContentForPersonalUse(
            userId,
            contentId,
            adaptationData
        );

        return NextResponse.json({
            success: true,
            data: { adaptedPromptId },
            message: 'Nội dung đã được tùy chỉnh và lưu vào thư viện cá nhân',
        });

    } catch (error) {
        console.error('Error adapting content:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: 'Dữ liệu tùy chỉnh không hợp lệ',
                    details: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi tùy chỉnh nội dung. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}