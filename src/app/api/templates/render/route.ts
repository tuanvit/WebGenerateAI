import { NextRequest, NextResponse } from 'next/server';
import { subjectTemplateService } from '@/services/templates/SubjectTemplateService';
import { TemplatesService } from '@/lib/admin/services/templates-service';

export async function POST(request: NextRequest) {
    try {
        const { templateId, variables, preview } = await request.json();

        if (!templateId) {
            return NextResponse.json(
                { error: 'Template ID là bắt buộc' },
                { status: 400 }
            );
        }

        if (!variables || typeof variables !== 'object') {
            return NextResponse.json(
                { error: 'Variables phải là object' },
                { status: 400 }
            );
        }

        let renderedPrompt;

        // Try hardcoded templates first (more reliable)
        try {
            console.log(`Trying to render template ${templateId} from hardcoded templates...`);

            if (preview) {
                renderedPrompt = await subjectTemplateService.getTemplatePreview(templateId, variables);
            } else {
                renderedPrompt = await subjectTemplateService.renderTemplate(templateId, variables);
            }

            console.log(`Successfully rendered template from hardcoded templates`);
        } catch (hardcodedError) {
            console.log('Template not found in hardcoded templates, trying database...');

            // Fallback to database templates
            try {
                const templatesService = new TemplatesService();

                if (preview) {
                    renderedPrompt = await templatesService.generateTemplatePreview(templateId, variables);
                    // Limit preview to 500 characters
                    if (renderedPrompt.length > 500) {
                        renderedPrompt = renderedPrompt.substring(0, 500) + '...';
                    }
                } else {
                    // Get full template from database and render it
                    const template = await templatesService.getTemplateById(templateId);
                    if (!template) {
                        throw new Error(`Template with ID ${templateId} not found in database`);
                    }

                    console.log(`Found template in database: ${template.name}`);

                    // Render template content with variables
                    renderedPrompt = template.templateContent;
                    for (const [key, value] of Object.entries(variables)) {
                        const regex = new RegExp(`{{${key}}}`, 'g');
                        renderedPrompt = renderedPrompt.replace(regex, String(value || ''));
                    }
                    // Clean up any remaining unreplaced variables
                    renderedPrompt = renderedPrompt.replace(/{{[^}]+}}/g, '[Chưa điền]');
                }
            } catch (dbError) {
                console.error('Template not found in either hardcoded templates or database');
                console.error('Database error:', dbError);
                console.error('Hardcoded error:', hardcodedError);
                throw new Error(`Template với ID ${templateId} không tìm thấy trong hệ thống`);
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                templateId,
                renderedPrompt,
                variables,
                isPreview: !!preview
            }
        });
    } catch (error) {
        console.error('Error rendering template:', error);

        if (error instanceof Error && error.message.includes('không tìm thấy')) {
            return NextResponse.json(
                { error: error.message },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Lỗi hệ thống khi render template' },
            { status: 500 }
        );
    }
}