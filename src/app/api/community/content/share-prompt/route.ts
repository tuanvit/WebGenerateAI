import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { CommunityLibraryService } from '../../../../../services/library/CommunityLibraryService';
import { z } from 'zod';

const SharePromptSchema = z.object({
    promptId: z.string().min(1, 'ID prompt không được để trống'),
    title: z.string().min(1, 'Tiêu đề không được để trống').max(200, 'Tiêu đề quá dài'),
    description: z.string().min(1, 'Mô tả không được để trống').max(1000, 'Mô tả quá dài'),
    tags: z.array(z.string()).min(1, 'Phải có ít nhất một thẻ tag'),
});

/**
 * POST /api/community/content/share-prompt - Share a generated prompt to community
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Vui lòng đăng nhập để chia sẻ prompt' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { promptId, title, description, tags } = SharePromptSchema.parse(body);

        const userId = session.user.id;

        const sharedContent = await CommunityLibraryService.shareGeneratedPrompt(
            promptId,
            userId,
            { title, description, tags }
        );

        return NextResponse.json({
            success: true,
            data: sharedContent,
            message: 'Prompt đã được chia sẻ thành công',
        });

    } catch (error) {
        console.error('Error sharing prompt:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: 'Dữ liệu chia sẻ không hợp lệ',
                    details: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi chia sẻ prompt. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}