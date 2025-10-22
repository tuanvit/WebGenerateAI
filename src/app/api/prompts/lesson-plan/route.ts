import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PromptGeneratorService } from '../../../../services/prompt/PromptGeneratorService';
import { EnhancedLessonPlanInputSchema } from '@/lib/validation';
import { asyncHandler, AuthenticationError } from '@/lib/error-handling';

const promptGenerator = new PromptGeneratorService();

export const POST = asyncHandler(async (request: NextRequest) => {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        throw new AuthenticationError();
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedInput = EnhancedLessonPlanInputSchema.parse(body);

    // Generate prompt
    const generatedPrompt = await promptGenerator.generateLessonPlanPrompt(validatedInput);

    // Set user ID
    generatedPrompt.userId = session.user.id;

    return NextResponse.json({
        success: true,
        data: generatedPrompt
    });
});