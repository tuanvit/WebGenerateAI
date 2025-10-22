import { NextRequest, NextResponse } from 'next/server';
import { aiToolRecommendationService, RecommendationCriteria } from '@/services/ai-tool-recommendation';

export async function POST(request: NextRequest) {
    try {
        const criteria: RecommendationCriteria = await request.json();

        // Validate required fields
        if (!criteria.subject || !criteria.gradeLevel || !criteria.teachingObjective || !criteria.outputType) {
            return NextResponse.json(
                { error: 'Thiếu thông tin bắt buộc: subject, gradeLevel, teachingObjective, outputType' },
                { status: 400 }
            );
        }

        // Validate grade level
        if (![6, 7, 8, 9].includes(criteria.gradeLevel)) {
            return NextResponse.json(
                { error: 'Lớp học phải từ 6 đến 9' },
                { status: 400 }
            );
        }

        const recommendedTools = await aiToolRecommendationService.getRecommendedTools(criteria);

        return NextResponse.json({
            success: true,
            data: recommendedTools,
            criteria: criteria
        });
    } catch (error) {
        console.error('Error getting AI tool recommendations:', error);
        return NextResponse.json(
            { error: 'Lỗi hệ thống khi lấy gợi ý công cụ AI' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const subject = searchParams.get('subject');
        const query = searchParams.get('q');

        let tools;

        if (query && query.trim() !== '') {
            // Search tools
            tools = await aiToolRecommendationService.searchTools(query);
        } else if (category) {
            // Get tools by category
            tools = await aiToolRecommendationService.getToolsByCategory(category as any);
        } else if (subject) {
            // Get subject-specific tools
            tools = await aiToolRecommendationService.getSubjectSpecificTools(subject);
        } else {
            // Return all tools if no specific criteria
            tools = await aiToolRecommendationService.getTrendingTools(20);
        }

        return NextResponse.json({
            success: true,
            data: tools
        });
    } catch (error) {
        console.error('Error fetching AI tools:', error);
        return NextResponse.json(
            { error: 'Lỗi hệ thống khi lấy danh sách công cụ AI' },
            { status: 500 }
        );
    }
}