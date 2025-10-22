import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PersonalLibraryService } from '../../../../../services/library';

const personalLibrary = new PersonalLibraryService();

/**
 * GET /api/library/prompts/search - Search prompts in user's personal library
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
        const query = searchParams.get('q');

        if (!query) {
            return NextResponse.json(
                { error: 'Vui lòng nhập từ khóa tìm kiếm' },
                { status: 400 }
            );
        }

        const userId = session.user.id;
        const results = await personalLibrary.searchPrompts(userId, query);

        return NextResponse.json({
            success: true,
            data: results,
            query,
        });

    } catch (error) {
        console.error('Error searching prompts:', error);

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}