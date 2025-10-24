import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PersonalLibraryService, PromptEditor } from '../../../../../services/library';
import { ValidationError, NotFoundError, UnauthorizedError } from '../../../../../types/services';

const personalLibrary = new PersonalLibraryService();
const promptEditor = new PromptEditor();

// Helper function to get user ID from session
function getUserId(session: any): string {
    return session.user?.id || session.user?.email!;
}

/**
 * GET /api/library/prompts/[id] - Get a specific prompt
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Chưa đăng nhập' },
                { status: 401 }
            );
        }

        const userId = getUserId(session);
        const promptId = id;

        // Get all user's prompts and find the specific one
        const prompts = await personalLibrary.getPrompts(userId);
        const prompt = prompts.find(p => p.id === promptId);

        if (!prompt) {
            return NextResponse.json(
                { success: false, error: 'Không tìm thấy prompt' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: prompt,
        });
    } catch (error) {
        console.error('Failed to get prompt:', error);

        if (error instanceof NotFoundError) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Không thể lấy thông tin prompt' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/library/prompts/[id] - Update a prompt
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Chưa đăng nhập' },
                { status: 401 }
            );
        }

        const userId = getUserId(session);
        const promptId = id;
        const body = await request.json();

        const updatedPrompt = await personalLibrary.updatePrompt(promptId, body);

        return NextResponse.json({
            success: true,
            data: updatedPrompt,
            message: 'Prompt đã được cập nhật',
        });
    } catch (error) {
        console.error('Failed to update prompt:', error);

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
            { success: false, error: 'Không thể cập nhật prompt' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/library/prompts/[id] - Delete a prompt
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Chưa đăng nhập' },
                { status: 401 }
            );
        }

        const userId = getUserId(session);
        const promptId = id;

        await personalLibrary.deletePrompt(promptId, userId);

        return NextResponse.json({
            success: true,
            message: 'Prompt đã được xóa',
        });
    } catch (error) {
        console.error('Failed to delete prompt:', error);

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

        return NextResponse.json(
            { success: false, error: 'Không thể xóa prompt' },
            { status: 500 }
        );
    }
}