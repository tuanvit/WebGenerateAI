import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PromptEditor } from '../../../../../../services/library';
import { ValidationError, NotFoundError, UnauthorizedError } from '../../../../../../types/services';

const promptEditor = new PromptEditor();

/**
 * PUT /api/library/prompts/[id]/edit - Edit prompt content
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Chưa đăng nhập' },
                { status: 401 }
            );
        }

        const userId = (session.user as any).id || session.user.email!;
        const promptId = params.id;
        const body = await request.json();

        const { content, createVersion = true } = body;

        if (!content) {
            return NextResponse.json(
                { success: false, error: 'Nội dung không được để trống' },
                { status: 400 }
            );
        }

        const updatedPrompt = await promptEditor.editPromptContent(
            promptId,
            userId,
            content,
            createVersion
        );

        return NextResponse.json({
            success: true,
            data: updatedPrompt,
            message: 'Nội dung prompt đã được cập nhật',
        });
    } catch (error) {
        console.error('Failed to edit prompt content:', error);

        if (error instanceof NotFoundError) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 404 }
            );
        }

        if (error instanceof UnauthorizedError) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 403 }
            );
        }

        if (error instanceof ValidationError) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Không thể chỉnh sửa prompt' },
            { status: 500 }
        );
    }
}