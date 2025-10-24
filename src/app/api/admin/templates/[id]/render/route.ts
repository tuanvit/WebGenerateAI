import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/admin/admin-auth';
import { TemplatesService } from '@/lib/admin/services/templates-service';
import { AdminErrorCode } from '@/lib/admin/admin-errors';

const templatesService = new TemplatesService();

/**
 * POST /api/admin/templates/[id]/render
 * Render template with provided variables for testing
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // Require admin authentication
        await requireAdminRole(request);

        // Parse request body
        const { variables, testMode } = await request.json();

        if (!variables || typeof variables !== 'object') {
            return NextResponse.json(
                { error: 'Dữ liệu biến không hợp lệ' },
                { status: 400 }
            );
        }

        // Get template
        const template = await templatesService.getTemplateById(id);
        if (!template) {
            return NextResponse.json(
                { error: 'Template không tồn tại' },
                { status: 404 }
            );
        }

        // Validate variables
        const validation = await templatesService.validateTemplateVariables(
            template.templateContent,
            variables
        );

        // Generate rendered output
        const renderedContent = await templatesService.generateTemplatePreview(
            id,
            variables
        );

        return NextResponse.json({
            success: true,
            renderedContent,
            validation,
            templateInfo: {
                id: template.id,
                name: template.name,
                subject: template.subject,
                outputType: template.outputType
            },
            testMode: testMode || false
        });
    } catch (error) {
        console.error('Error in POST /api/admin/templates/[id]/render:', error);

        if (error instanceof Error && 'statusCode' in error) {
            return NextResponse.json(
                { error: error.message, code: (error as any).code },
                { status: (error as any).statusCode }
            );
        }

        return NextResponse.json(
            { error: 'Lỗi server nội bộ', code: AdminErrorCode.INTERNAL_SERVER_ERROR },
            { status: 500 }
        );
    }
}