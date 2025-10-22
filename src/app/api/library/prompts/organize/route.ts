import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PersonalLibraryService } from '../../../../../services/library';

const personalLibrary = new PersonalLibraryService();

/**
 * GET /api/library/prompts/organize - Get prompts organized by subject or grade level
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
        const organizeBy = searchParams.get('by'); // 'subject' or 'grade'

        if (!organizeBy || !['subject', 'grade'].includes(organizeBy)) {
            return NextResponse.json(
                { error: 'Tham số "by" phải là "subject" hoặc "grade"' },
                { status: 400 }
            );
        }

        const userId = session.user.id;
        let organizedPrompts;

        if (organizeBy === 'subject') {
            organizedPrompts = await personalLibrary.getPromptsBySubject(userId);
        } else {
            organizedPrompts = await personalLibrary.getPromptsByGradeLevel(userId);
        }

        return NextResponse.json({
            success: true,
            data: organizedPrompts,
            organizedBy: organizeBy,
        });

    } catch (error) {
        console.error('Error organizing prompts:', error);

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi tổ chức prompt. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}