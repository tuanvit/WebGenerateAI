import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/admin/admin-auth';
import { TemplatesService } from '@/lib/admin/services/templates-service';
import { AdminErrorCode } from '@/lib/admin/admin-errors';

const templatesService = new TemplatesService();

/**
 * GET /api/admin/templates/[id]/examples
 * Get template examples
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

        // Return template examples
        return NextResponse.json({
            examples: template.examples || [],
            templateId: id
        });
    } catch (error) {
        console.error('Error in GET /api/admin/templates/[id]/examples:', error);

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
 * PUT /api/admin/templates/[id]/examples
 * Update template examples
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
        const { examples } = await request.json();

        if (!Array.isArray(examples)) {
            return NextResponse.json(
                { error: 'Dữ liệu ví dụ không hợp lệ' },
                { status: 400 }
            );
        }

        // Update template with new examples
        const updatedTemplate = await templatesService.updateTemplate(
            id,
            { examples },
            user.id
        );

        return NextResponse.json({
            success: true,
            examples: updatedTemplate.examples || [],
            message: 'Đã cập nhật ví dụ template thành công'
        });
    } catch (error) {
        console.error('Error in PUT /api/admin/templates/[id]/examples:', error);

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
 * POST /api/admin/templates/[id]/examples
 * Add new template example
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // Require admin authentication
        const user = await requireAdminRole(request);

        // Parse request body
        const exampleData = await request.json();

        // Get current template
        const template = await templatesService.getTemplateById(id);
        if (!template) {
            return NextResponse.json(
                { error: 'Template không tồn tại' },
                { status: 404 }
            );
        }

        // Add new example to existing examples
        const currentExamples = template.examples || [];
        const newExamples = [...currentExamples, exampleData];

        // Update template with new examples
        const updatedTemplate = await templatesService.updateTemplate(
            id,
            { examples: newExamples },
            user.id
        );

        return NextResponse.json({
            success: true,
            examples: updatedTemplate.examples || [],
            message: 'Đã thêm ví dụ mới thành công'
        }, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/admin/templates/[id]/examples:', error);

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