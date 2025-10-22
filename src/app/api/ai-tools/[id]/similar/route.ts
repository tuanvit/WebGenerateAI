import { NextRequest, NextResponse } from 'next/server';
import { aiToolRecommendationService } from '@/services/ai-tool-recommendation';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const toolId = params.id;
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '5');

        if (!toolId) {
            return NextResponse.json(
                { error: 'Tool ID là bắt buộc' },
                { status: 400 }
            );
        }

        if (limit < 1 || limit > 20) {
            return NextResponse.json(
                { error: 'Limit phải từ 1 đến 20' },
                { status: 400 }
            );
        }

        const similarTools = await aiToolRecommendationService.getSimilarTools(toolId, limit);

        return NextResponse.json({
            success: true,
            data: similarTools,
            meta: {
                count: similarTools.length,
                limit: limit,
                baseTool: toolId
            }
        });
    } catch (error) {
        console.error('Error fetching similar AI tools:', error);
        return NextResponse.json(
            { error: 'Lỗi hệ thống khi lấy danh sách công cụ AI tương tự' },
            { status: 500 }
        );
    }
}