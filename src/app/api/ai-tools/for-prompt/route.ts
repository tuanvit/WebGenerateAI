import { NextRequest, NextResponse } from 'next/server';
import { aiToolRecommendationService } from '@/services/ai-tool-recommendation';

export async function POST(request: NextRequest) {
    try {
        const { promptType, subject, gradeLevel } = await request.json();

        // Validate required fields
        if (!promptType || !subject || !gradeLevel) {
            return NextResponse.json(
                { error: 'Thiếu thông tin bắt buộc: promptType, subject, gradeLevel' },
                { status: 400 }
            );
        }

        // Validate grade level
        if (![6, 7, 8, 9].includes(gradeLevel)) {
            return NextResponse.json(
                { error: 'Lớp học phải từ 6 đến 9' },
                { status: 400 }
            );
        }

        // Validate prompt type
        const validPromptTypes = ['lesson-plan', 'presentation', 'assessment', 'interactive', 'research', 'video'];
        if (!validPromptTypes.includes(promptType)) {
            return NextResponse.json(
                { error: `Loại prompt không hợp lệ. Phải là một trong: ${validPromptTypes.join(', ')}` },
                { status: 400 }
            );
        }

        const recommendedTools = await aiToolRecommendationService.getToolRecommendationsForPrompt(
            promptType,
            subject,
            gradeLevel
        );

        return NextResponse.json({
            success: true,
            data: recommendedTools,
            meta: {
                promptType,
                subject,
                gradeLevel,
                count: recommendedTools.length
            }
        });
    } catch (error) {
        console.error('Error getting AI tool recommendations for prompt:', error);
        return NextResponse.json(
            { error: 'Lỗi hệ thống khi lấy gợi ý công cụ AI cho prompt' },
            { status: 500 }
        );
    }
}