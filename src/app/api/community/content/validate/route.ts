import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ContentModerationService } from '../../../../../services/moderation/ContentModerationService';
import { z } from 'zod';

const ValidationSchema = z.object({
    content: z.string().min(1, 'Nội dung không được để trống'),
    subject: z.string().optional(),
});

/**
 * POST /api/community/content/validate - Validate content before sharing
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Vui lòng đăng nhập để kiểm tra nội dung' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { content, subject } = ValidationSchema.parse(body);

        const validation = ContentModerationService.validateEducationalContent(content, subject);

        return NextResponse.json({
            success: true,
            data: {
                isValid: validation.isValid,
                issues: validation.issues,
                recommendations: validation.isValid
                    ? ['Nội dung phù hợp để chia sẻ']
                    : [
                        'Vui lòng xem xét các vấn đề được chỉ ra',
                        'Chỉnh sửa nội dung để phù hợp với tiêu chuẩn giáo dục',
                        'Đảm bảo nội dung có tính giáo dục và phù hợp với độ tuổi'
                    ]
            },
        });

    } catch (error) {
        console.error('Error validating content:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: 'Dữ liệu kiểm tra không hợp lệ',
                    details: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi kiểm tra nội dung. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}