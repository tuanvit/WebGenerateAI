import { NextRequest, NextResponse } from 'next/server';
import { AI_TOOLS_DATABASE, getToolsByCategory, getToolsBySubject, getToolsByGradeLevel, getVietnameseSupportedTools, searchTools } from '@/services/ai-tool-recommendation/ai-tools-data';
import { AIToolCategory } from '@/services/ai-tool-recommendation';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const category = searchParams.get('category') as AIToolCategory | null;
        const subject = searchParams.get('subject');
        const gradeLevel = searchParams.get('gradeLevel');
        const vietnameseOnly = searchParams.get('vietnameseOnly') === 'true';
        const search = searchParams.get('search');
        const limit = searchParams.get('limit');
        const offset = searchParams.get('offset');

        let tools = [...AI_TOOLS_DATABASE];

        // Apply filters
        if (category && category !== 'all') {
            tools = getToolsByCategory(category);
        }

        if (subject && subject !== 'all') {
            tools = tools.filter(tool => tool.subjects.includes(subject));
        }

        if (gradeLevel && gradeLevel !== 'all') {
            const grade = parseInt(gradeLevel);
            if (!isNaN(grade)) {
                tools = tools.filter(tool => tool.gradeLevel.includes(grade));
            }
        }

        if (vietnameseOnly) {
            tools = tools.filter(tool => tool.vietnameseSupport);
        }

        if (search && search.trim()) {
            const searchResults = searchTools(search);
            tools = tools.filter(tool => searchResults.some(result => result.id === tool.id));
        }

        // Apply pagination
        const totalCount = tools.length;

        if (limit) {
            const limitNum = parseInt(limit);
            const offsetNum = offset ? parseInt(offset) : 0;

            if (!isNaN(limitNum)) {
                tools = tools.slice(offsetNum, offsetNum + limitNum);
            }
        }

        return NextResponse.json({
            success: true,
            data: tools,
            pagination: {
                total: totalCount,
                count: tools.length,
                limit: limit ? parseInt(limit) : null,
                offset: offset ? parseInt(offset) : 0
            }
        });

    } catch (error) {
        console.error('Error fetching AI tools:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Không thể tải danh sách công cụ AI'
            },
            { status: 500 }
        );
    }
}