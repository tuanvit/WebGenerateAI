import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { CommunityLibraryService } from '../../../../../services/library/CommunityLibraryService';
import { z } from 'zod';

const BulkActionSchema = z.object({
    action: z.enum(['save', 'unsave', 'rate']),
    contentIds: z.array(z.string()).min(1, 'Phải có ít nhất một nội dung').max(10, 'Tối đa 10 nội dung'),
    rating: z.number().min(1).max(5).optional(), // Required for rate action
});

/**
 * POST /api/community/content/bulk - Perform bulk actions on multiple content items
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Vui lòng đăng nhập để thực hiện hành động hàng loạt' },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const body = await request.json();
        const { action, contentIds, rating } = BulkActionSchema.parse(body);

        // Validate rating for rate action
        if (action === 'rate' && !rating) {
            return NextResponse.json(
                { error: 'Vui lòng cung cấp điểm đánh giá cho hành động đánh giá' },
                { status: 400 }
            );
        }

        const results = {
            successful: [] as string[],
            failed: [] as Array<{ contentId: string; error: string }>
        };

        // Process each content item
        for (const contentId of contentIds) {
            try {
                switch (action) {
                    case 'save':
                        await CommunityLibraryService.saveToPersonalLibrary(userId, contentId);
                        results.successful.push(contentId);
                        break;

                    case 'unsave':
                        await CommunityLibraryService.removeFromPersonalLibrary(userId, contentId);
                        results.successful.push(contentId);
                        break;

                    case 'rate':
                        if (rating) {
                            await CommunityLibraryService.rateContent(userId, contentId, rating);
                            results.successful.push(contentId);
                        }
                        break;
                }
            } catch (error) {
                results.failed.push({
                    contentId,
                    error: error instanceof Error ? error.message : 'Lỗi không xác định'
                });
            }
        }

        const actionMessages = {
            save: 'lưu',
            unsave: 'bỏ lưu',
            rate: 'đánh giá'
        };

        return NextResponse.json({
            success: true,
            data: results,
            message: `Đã ${actionMessages[action]} ${results.successful.length}/${contentIds.length} nội dung thành công`,
        });

    } catch (error) {
        console.error('Error performing bulk action:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: 'Dữ liệu hành động hàng loạt không hợp lệ',
                    details: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi thực hiện hành động hàng loạt. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}