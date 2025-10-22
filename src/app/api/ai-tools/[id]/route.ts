import { NextRequest, NextResponse } from 'next/server';
import { aiToolRecommendationService } from '@/services/ai-tool-recommendation';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const toolId = params.id;

        if (!toolId) {
            return NextResponse.json(
                { error: 'Tool ID là bắt buộc' },
                { status: 400 }
            );
        }

        const toolDetails = await aiToolRecommendationService.getToolDetails(toolId);

        if (!toolDetails) {
            return NextResponse.json(
                { error: 'Không tìm thấy công cụ AI với ID này' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: toolDetails
        });
    } catch (error) {
        console.error('Error fetching AI tool details:', error);
        return NextResponse.json(
            { error: 'Lỗi hệ thống khi lấy thông tin chi tiết công cụ AI' },
            { status: 500 }
        );
    }
}