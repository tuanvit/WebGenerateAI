import { NextRequest, NextResponse } from 'next/server';
import { aiToolRecommendationService } from '@/services/ai-tool-recommendation';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        if (limit < 1 || limit > 50) {
            return NextResponse.json(
                { error: 'Limit phải từ 1 đến 50' },
                { status: 400 }
            );
        }

        const trendingTools = await aiToolRecommendationService.getTrendingTools(limit);

        return NextResponse.json({
            success: true,
            data: trendingTools,
            meta: {
                count: trendingTools.length,
                limit: limit
            }
        });
    } catch (error) {
        console.error('Error fetching trending AI tools:', error);
        return NextResponse.json(
            { error: 'Lỗi hệ thống khi lấy danh sách công cụ AI thịnh hành' },
            { status: 500 }
        );
    }
}