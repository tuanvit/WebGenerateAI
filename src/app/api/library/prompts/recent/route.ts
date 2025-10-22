import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PersonalLibraryService } from '../../../../../services/library';

const personalLibrary = new PersonalLibraryService();

/**
 * GET /api/library/prompts/recent - Get user's recent prompts
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Vui lòng đăng nhập để sử dụng tính năng này' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const limitParam = searchParams.get('limit');
        const limit = limitParam ? parseInt(limitParam) : 10;

        if (limit < 1 || limit > 50) {
            return NextResponse.json(
                { error: 'Giới hạn phải từ 1 đến 50' },
                { status: 400 }
            );
        }

        const userId = session.user.id;
        const recentPrompts = await personalLibrary.getRecentPrompts(userId, limit);

        return NextResponse.json({
            success: true,
            data: recentPrompts,
        });

    } catch (error) {
        console.error('Error getting recent prompts:', error);

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi lấy prompt gần đây. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}