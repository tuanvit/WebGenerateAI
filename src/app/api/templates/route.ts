import { NextRequest, NextResponse } from 'next/server';
import { TemplatesService } from '@/lib/admin/services/templates-service';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const subject = searchParams.get('subject');
        const outputType = searchParams.get('outputType');
        const gradeLevel = searchParams.get('gradeLevel');
        const query = searchParams.get('q');

        // Map curriculum-creation to lesson-plan for backward compatibility
        let mappedOutputType = outputType;
        if (outputType === 'curriculum-creation') {
            mappedOutputType = 'lesson-plan';
        }

        const templatesService = new TemplatesService();
        let result;

        if (query) {
            // Search templates
            result = await templatesService.searchTemplates(query);
            return NextResponse.json({
                success: true,
                templates: result.data,
                meta: {
                    count: result.data.length,
                    total: result.total,
                    filters: { subject, outputType, gradeLevel, query }
                }
            });
        } else {
            // Build filters for admin service
            const filters: any = {
                limit: 100 // Get more templates for user selection
            };

            if (subject) {
                filters.subject = subject;
            }

            if (mappedOutputType) {
                filters.outputType = mappedOutputType;
            }

            if (gradeLevel) {
                filters.gradeLevel = [parseInt(gradeLevel)];
            }

            // Get templates from admin service (database)
            result = await templatesService.getTemplates(filters);

            // Transform admin template format to user template format
            const transformedTemplates = result.data.map(adminTemplate => ({
                id: adminTemplate.id,
                name: adminTemplate.name,
                description: adminTemplate.description,
                subject: adminTemplate.subject,
                gradeLevel: adminTemplate.gradeLevel,
                outputType: adminTemplate.outputType,
                template: adminTemplate.templateContent,
                variables: adminTemplate.variables || [],
                examples: adminTemplate.examples || [],
                tags: adminTemplate.tags || [],
                difficulty: adminTemplate.difficulty,
                compliance: adminTemplate.compliance || [],
                recommendedTools: adminTemplate.recommendedTools || []
            }));

            return NextResponse.json({
                success: true,
                templates: transformedTemplates,
                meta: {
                    count: transformedTemplates.length,
                    total: result.total,
                    filters: { subject, outputType: mappedOutputType, gradeLevel, query }
                }
            });
        }
    } catch (error) {
        console.error('Error fetching templates:', error);
        return NextResponse.json(
            { error: 'Lỗi hệ thống khi lấy danh sách template' },
            { status: 500 }
        );
    }
}