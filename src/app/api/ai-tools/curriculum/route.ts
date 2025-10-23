import { NextRequest, NextResponse } from 'next/server';
import { getCurriculumCreationTools } from '@/services/ai-tool-recommendation/ai-tools-data';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const subject = searchParams.get('subject');
        const gradeLevel = searchParams.get('gradeLevel');
        const limit = searchParams.get('limit');
        const offset = searchParams.get('offset');

        // Get curriculum-specific tools
        const parsedGradeLevel = gradeLevel ? parseInt(gradeLevel) : undefined;
        const validGradeLevel = parsedGradeLevel && [6, 7, 8, 9].includes(parsedGradeLevel)
            ? parsedGradeLevel as 6 | 7 | 8 | 9
            : undefined;

        let tools = getCurriculumCreationTools(
            subject || undefined,
            validGradeLevel
        );

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
        console.error('Error fetching curriculum creation tools:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Không thể tải danh sách công cụ AI cho tạo giáo trình'
            },
            { status: 500 }
        );
    }
}