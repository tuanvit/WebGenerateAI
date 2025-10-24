import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

/**
 * DELETE /api/community/content/[id]/delete - Delete shared content (only by author)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Vui lòng đăng nhập để xóa nội dung' },
                { status: 401 }
            );
        }

        const { id: contentId } = await params;
        const userId = session.user.id;

        try {
            // Check if content exists and user is the author
            const content = await prisma.sharedContent.findUnique({
                where: { id: contentId },
                select: {
                    id: true,
                    title: true,
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
                    { error: 'Bạn chỉ có thể xóa nội dung của chính mình' },
                    { status: 403 }
                );
            }

            // Use transaction to delete content and related data
            await prisma.$transaction(async (tx) => {
                // Delete related ratings
                await tx.contentRating.deleteMany({
                    where: { contentId }
                });

                // Delete from user libraries
                await tx.userLibrary.deleteMany({
                    where: { contentId }
                });

                // Delete moderation reports
                await tx.moderationReport.deleteMany({
                    where: { contentId }
                });

                // Finally delete the content
                await tx.sharedContent.delete({
                    where: { id: contentId }
                });
            });

            return NextResponse.json({
                success: true,
                message: 'Nội dung đã được xóa thành công',
                data: {
                    deletedContentId: contentId,
                    title: content.title
                }
            });

        } catch (dbError) {
            console.error('Database error when deleting content:', dbError);

            return NextResponse.json(
                {
                    error: 'Lỗi database khi xóa nội dung. Vui lòng thử lại.',
                    details: dbError instanceof Error ? dbError.message : 'Unknown database error'
                },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Error deleting content:', error);

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi xóa nội dung. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}