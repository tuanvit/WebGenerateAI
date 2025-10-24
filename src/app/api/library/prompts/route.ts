import { ensureUserExists } from '@/lib/user-utils';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { PersonalLibraryService } from '../../../../services/library';
import { CreateGeneratedPromptSchema } from '../../../../types/prompt';
import { ValidationError } from '../../../../types/services';

const personalLibrary = new PersonalLibraryService();

/**
 * GET /api/library/prompts - Get user's saved prompts with optional filtering
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Chưa đăng nhập' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);

        // Parse filters from query parameters
        const filters: any = {};

        if (searchParams.get('subject')) {
            filters.subject = searchParams.get('subject');
        }

        if (searchParams.get('gradeLevel')) {
            const gradeLevel = parseInt(searchParams.get('gradeLevel')!);
            if ([6, 7, 8, 9].includes(gradeLevel)) {
                filters.gradeLevel = gradeLevel as 6 | 7 | 8 | 9;
            }
        }

        if (searchParams.get('tags')) {
            filters.tags = searchParams.get('tags')!.split(',');
        }

        if (searchParams.get('dateFrom')) {
            filters.dateFrom = new Date(searchParams.get('dateFrom')!);
        }

        if (searchParams.get('dateTo')) {
            filters.dateTo = new Date(searchParams.get('dateTo')!);
        }

        // Validate filters - skip validation for now and cast types
        const validatedFilters = filters as any;

        // Get or create user from session
        const user = await ensureUserExists(session.user.email!, session.user.name || undefined);

        const prompts = await personalLibrary.getPrompts(user.id, validatedFilters);

        return NextResponse.json({
            success: true,
            data: prompts,
        });
    } catch (error) {
        console.error('Failed to get prompts:', error);

        if (error instanceof ValidationError) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Không thể lấy danh sách prompt' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/library/prompts - Save a new prompt to personal library
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Chưa đăng nhập' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Get or create user from session
        const user = await ensureUserExists(session.user.email!, session.user.name || undefined);

        // Map the body fields to match schema
        const promptData = {
            userId: user.id,
            inputParameters: body.inputParameters || {},
            generatedText: body.generatedText || body.content || '',
            targetTool: body.targetTool || 'chatgpt',
            isShared: body.isShared || false,
            tags: body.tags || [],
        };

        // Validate the prompt data
        const validatedData = CreateGeneratedPromptSchema.parse(promptData);

        const savedPrompt = await personalLibrary.savePrompt(validatedData);

        return NextResponse.json({
            success: true,
            data: savedPrompt,
            message: 'Prompt đã được lưu vào thư viện cá nhân',
        });
    } catch (error) {
        console.error('Failed to save prompt:', error);

        if (error instanceof ValidationError) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Không thể lưu prompt' },
            { status: 500 }
        );
    }
}