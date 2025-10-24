import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/admin/admin-auth';
import { TemplatesService } from '@/lib/admin/services/templates-service';
import { AdminErrorCode } from '@/lib/admin/admin-errors';

const templatesService = new TemplatesService();

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // Require admin authentication
        await requireAdminRole(request);

        // Parse request body
        const { variables } = await request.json();

        if (!variables || typeof variables !== 'object') {
            return NextResponse.json(
                { error: 'Dữ liệu biến không hợp lệ' },
                { status: 400 }
            );
        }

        // Generate template preview
        const preview = await templatesService.generateTemplatePreview(id, variables);

        // Validate template variables
        const validation = await templatesService.validateTemplateVariables(
            (await templatesService.getTemplateById(id))?.templateContent || '',
            variables
        );

        return NextResponse.json({
            preview,
            validation,
            success: true
        });
    } catch (error) {
        console.error('Error in POST /api/admin/templates/[id]/preview:', error);

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