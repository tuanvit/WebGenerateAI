import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/community/content/[id]/save - Check if content is saved
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Vui lòng đăng nhập để kiểm tra trạng thái lưu' },
                { status: 401 }
            );
        }

        const contentId = params.id;
        const userId = session.user.id;

        // Mock check - in production, check database
        const isSaved = false;

        return NextResponse.json({
            success: true,
            data: { isSaved },
        });

    } catch (error) {
        console.error('Error checking save status:', error);

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi kiểm tra trạng thái lưu. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/community/content/[id]/save - Save content to personal library
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Vui lòng đăng nhập để lưu nội dung' },
                { status: 401 }
            );
        }

        const contentId = params.id;
        const userId = session.user.id;

        // Mock save - in production, save to database
        console.log(`User ${userId} saving content ${contentId}`);

        return NextResponse.json({
            success: true,
            message: 'Nội dung đã được lưu vào thư viện cá nhân',
        });

    } catch (error) {
        console.error('Error saving content:', error);

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi lưu nội dung. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/community/content/[id]/save - Remove content from personal library
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Vui lòng đăng nhập để xóa nội dung đã lưu' },
                { status: 401 }
            );
        }

        const contentId = params.id;
        const userId = session.user.id;

        // Mock delete - in production, delete from database
        console.log(`User ${userId} removing content ${contentId}`);

        return NextResponse.json({
            success: true,
            message: 'Nội dung đã được xóa khỏi thư viện cá nhân',
        });

    } catch (error) {
        console.error('Error removing saved content:', error);

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi xóa nội dung đã lưu. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}