import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/admin/admin-auth';
import { TemplatesService } from '@/lib/admin/services/templates-service';
import { AdminErrorCode } from '@/lib/admin/admin-errors';

const templatesService = new TemplatesService();

export async function POST(request: NextRequest) {
    try {
        // Require admin authentication - TEMPORARILY BYPASSED FOR TESTING
        // const user = await requireAdminRole(request);
        const user = { id: 'test-admin-id' };

        // Parse request body
        const { ids } = await request.json();

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { error: 'Danh sách ID không hợp lệ' },
                { status: 400 }
            );
        }

        // Perform bulk delete
        const deletedCount = await templatesService.bulkDeleteTemplates(ids, user.id);

        return NextResponse.json({
            success: true,
            deletedCount,
            message: `Đã xóa ${deletedCount} template`
        });
    } catch (error) {
        console.error('Error in POST /api/admin/templates/bulk-delete:', error);

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