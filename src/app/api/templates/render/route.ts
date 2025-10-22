import { NextRequest, NextResponse } from 'next/server';
import { subjectTemplateService } from '@/services/templates/SubjectTemplateService';

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

        if (preview) {
            // Return preview (first 500 characters)
            renderedPrompt = await subjectTemplateService.getTemplatePreview(templateId, variables);
        } else {
            // Return full rendered template
            renderedPrompt = await subjectTemplateService.renderTemplate(templateId, variables);
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

        if (error instanceof Error && error.message.includes('not found')) {
            return NextResponse.json(
                { error: 'Không tìm thấy template với ID này' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Lỗi hệ thống khi render template' },
            { status: 500 }
        );
    }
}