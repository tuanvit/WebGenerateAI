import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const UpdateContentSchema = z.object({
    title: z.string().min(1, 'Tiêu đề không được để trống'),
    description: z.string().min(1, 'Mô tả không được để trống'),
    content: z.string().min(1, 'Nội dung không được để trống'),
    subject: z.string().min(1, 'Môn học không được để trống'),
    gradeLevel: z.number().min(6).max(9, 'Khối lớp phải từ 6-9'),
    tags: z.array(z.string()).optional()
});

/**
 * PUT /api/community/content/[id]/update - Update shared content (only by author)
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Vui lòng đăng nhập để cập nhật nội dung' },
                { status: 401 }
            );
        }

        const { id: contentId } = await params;
        const userId = session.user.id;
        const body = await request.json();

        const validatedData = UpdateContentSchema.parse(body);

        try {
            // Check if content exists and user is the author
            const content = await prisma.sharedContent.findUnique({
                where: { id: contentId },
                select: {
                    id: true,
                    authorId: true
                }
            });

            if (!content) {
                return NextResponse.json(
                    { error: 'Nội dung không tồn tại' },
                    { status: 404 }
                );
            }

            // Check if user is the author
            if (content.authorId !== userId) {
                return NextResponse.json(
                    { error: 'Bạn chỉ có thể cập nhật nội dung của chính mình' },
                    { status: 403 }
                );
            }

            // Update the content
            const updatedContent = await prisma.sharedContent.update({
                where: { id: contentId },
                data: {
                    title: validatedData.title,
                    description: validatedData.description,
                    content: validatedData.content,
                    subject: validatedData.subject,
                    gradeLevel: validatedData.gradeLevel,
                    tags: JSON.stringify(validatedData.tags || []),
                    updatedAt: new Date()
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            school: true
                        }
                    }
                }
            });

            const processedContent = {
                id: updatedContent.id,
                title: updatedContent.title,
                description: updatedContent.description,
                content: updatedContent.content,
                subject: updatedContent.subject,
                gradeLevel: updatedContent.gradeLevel,
                tags: Array.isArray(updatedContent.tags) ? updatedContent.tags : JSON.parse(updatedContent.tags || '[]'),
                rating: updatedContent.rating,
                ratingCount: updatedContent.ratingCount,
                author: {
                    id: updatedContent.author?.id,
                    name: updatedContent.author?.name || 'Ẩn danh',
                    school: updatedContent.author?.school || ''
                },
                createdAt: updatedContent.createdAt,
                updatedAt: updatedContent.updatedAt
            };

            return NextResponse.json({
                success: true,
                message: 'Nội dung đã được cập nhật thành công',
                data: processedContent
            });

        } catch (dbError) {
            console.error('Database error when updating content:', dbError);

            return NextResponse.json(
                {
                    error: 'Lỗi database khi cập nhật nội dung. Vui lòng thử lại.',
                    details: dbError instanceof Error ? dbError.message : 'Unknown database error'
                },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Error updating content:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: 'Dữ liệu không hợp lệ',
                    details: error.issues.map((err: any) => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi cập nhật nội dung. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}