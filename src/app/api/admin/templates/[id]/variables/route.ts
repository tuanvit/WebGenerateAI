import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/admin/admin-auth';
import { TemplatesService } from '@/lib/admin/services/templates-service';
import { AdminErrorCode } from '@/lib/admin/admin-errors';

const templatesService = new TemplatesService();

/**
 * GET /api/admin/templates/[id]/variables
 * Get template variables
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // Require admin authentication
        await requireAdminRole(request);

        // Get template
        const template = await templatesService.getTemplateById(id);
        if (!template) {
            return NextResponse.json(
                { error: 'Template không tồn tại' },
                { status: 404 }
            );
        }

        // Return template variables
        return NextResponse.json({
            variables: template.variables || [],
            templateId: id
        });
    } catch (error) {
        console.error('Error in GET /api/admin/templates/[id]/variables:', error);

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

/**
 * PUT /api/admin/templates/[id]/variables
 * Update template variables
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // Require admin authentication
        const user = await requireAdminRole(request);

        // Parse request body
        const { variables } = await request.json();

        if (!Array.isArray(variables)) {
            return NextResponse.json(
                { error: 'Dữ liệu biến không hợp lệ' },
                { status: 400 }
            );
        }

        // Update template with new variables
        const updatedTemplate = await templatesService.updateTemplate(
            id,
            { variables },
            user.id
        );

        return NextResponse.json({
            success: true,
            variables: updatedTemplate.variables || [],
            message: 'Đã cập nhật biến template thành công'
        });
    } catch (error) {
        console.error('Error in PUT /api/admin/templates/[id]/variables:', error);

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