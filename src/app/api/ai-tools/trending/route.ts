import { NextRequest, NextResponse } from 'next/server';
import { AI_TOOLS_DATABASE } from '@/services/ai-tool-recommendation/ai-tools-data';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '6');

        // Simulate trending logic - in real app, this would be based on usage statistics
        // For now, we'll prioritize tools with Vietnamese support and beginner difficulty
        const trendingTools = AI_TOOLS_DATABASE
            .filter(tool => tool.vietnameseSupport) // Prioritize Vietnamese support
            .sort((a, b) => {
                // Sort by difficulty (beginner first) and then by category diversity
                const difficultyOrder = { 'beginner': 0, 'intermediate': 1, 'advanced': 2 };
                const aDifficulty = difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 3;
                const bDifficulty = difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 3;

                if (aDifficulty !== bDifficulty) {
                    return aDifficulty - bDifficulty;
                }

                // Secondary sort by name for consistency
                return a.name.localeCompare(b.name);
            })
            .slice(0, limit);

        return NextResponse.json({
            success: true,
            data: trendingTools
        });

    } catch (error) {
        console.error('Error fetching trending AI tools:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Không thể tải danh sách công cụ AI thịnh hành'
            },
            { status: 500 }
        );
    }
}