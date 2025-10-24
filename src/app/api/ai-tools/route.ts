import { AIToolSearchFilters, AIToolsService } from '@/lib/admin/services/ai-tools-service';
import { AI_TOOLS_DATABASE } from '@/services/ai-tool-recommendation/ai-tools-data';
import { NextRequest, NextResponse } from 'next/server';

const aiToolsService = new AIToolsService();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const category = searchParams.get('category');
        const subject = searchParams.get('subject');
        const gradeLevel = searchParams.get('gradeLevel');
        const vietnameseOnly = searchParams.get('vietnameseOnly') === 'true';
        const search = searchParams.get('search');
        const limit = searchParams.get('limit');
        const offset = searchParams.get('offset');

        // Build filters for database query
        const filters: AIToolSearchFilters = {
            searchTerm: search || undefined,
            categories: category && category !== 'all' ? [category] : undefined,
            subjects: subject && subject !== 'all' ? [subject] : undefined,
            gradeLevels: gradeLevel && gradeLevel !== 'all' ? [parseInt(gradeLevel)] : undefined,
            vietnameseSupport: vietnameseOnly || undefined,
            page: offset ? Math.floor(parseInt(offset) / (parseInt(limit || '10'))) + 1 : 1,
            limit: limit ? parseInt(limit) : 100, // Default to 100 for user-facing API
            sortBy: 'name',
            sortOrder: 'asc'
        };

        // Try to get tools from database first
        let result;
        try {
            result = await aiToolsService.getAITools(filters);

            // If database has tools, use them
            if (result.data && result.data.length > 0) {
                return NextResponse.json({
                    success: true,
                    data: result.data,
                    pagination: {
                        total: result.total,
                        count: result.data.length,
                        limit: filters.limit,
                        offset: offset ? parseInt(offset) : 0,
                        page: result.page,
                        totalPages: result.totalPages
                    }
                });
            }
        } catch (dbError) {
            console.warn('Database query failed, falling back to static data:', dbError);
        }

        // Fallback to static data if database is empty or fails
        let tools = [...AI_TOOLS_DATABASE];

        // Apply filters to static data
        if (category && category !== 'all') {
            tools = tools.filter(tool => tool.category === category);
        }

        if (subject && subject !== 'all') {
            tools = tools.filter(tool => tool.subjects.includes(subject));
        }

        if (gradeLevel && gradeLevel !== 'all') {
            const grade = parseInt(gradeLevel);
            if (!isNaN(grade) && [6, 7, 8, 9].includes(grade)) {
                tools = tools.filter(tool => tool.gradeLevel.includes(grade as 6 | 7 | 8 | 9));
            }
        }

        if (vietnameseOnly) {
            tools = tools.filter(tool => tool.vietnameseSupport);
        }

        if (search && search.trim()) {
            const searchLower = search.toLowerCase();
            tools = tools.filter(tool =>
                tool.name.toLowerCase().includes(searchLower) ||
                tool.description.toLowerCase().includes(searchLower) ||
                tool.useCase.toLowerCase().includes(searchLower)
            );
        }

        // Apply pagination
        const totalCount = tools.length;
        const limitNum = limit ? parseInt(limit) : tools.length;
        const offsetNum = offset ? parseInt(offset) : 0;
        tools = tools.slice(offsetNum, offsetNum + limitNum);

        return NextResponse.json({
            success: true,
            data: tools,
            pagination: {
                total: totalCount,
                count: tools.length,
                limit: limitNum,
                offset: offsetNum
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