import { NextRequest, NextResponse } from 'next/server';
import { subjectTemplateService } from '@/services/templates/SubjectTemplateService';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const subject = searchParams.get('subject');
        const outputType = searchParams.get('outputType');
        const gradeLevel = searchParams.get('gradeLevel');
        const query = searchParams.get('q');

        let templates;

        if (query) {
            // Search templates
            templates = await subjectTemplateService.searchTemplates(query);
        } else if (subject && gradeLevel && outputType) {
            // Get recommended templates
            templates = await subjectTemplateService.getRecommendedTemplates(
                subject,
                parseInt(gradeLevel),
                outputType
            );
        } else if (subject) {
            // Get templates by subject
            templates = await subjectTemplateService.getTemplatesBySubject(subject);
        } else if (outputType) {
            // Get templates by output type
            templates = await subjectTemplateService.getTemplatesByOutputType(outputType);
        } else {
            return NextResponse.json(
                { error: 'Cần cung cấp subject, outputType, gradeLevel hoặc query parameter' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: templates,
            meta: {
                count: templates.length,
                filters: { subject, outputType, gradeLevel, query }
            }
        });
    } catch (error) {
        console.error('Error fetching templates:', error);
        return NextResponse.json(
            { error: 'Lỗi hệ thống khi lấy danh sách template' },
            { status: 500 }
        );
    }
}