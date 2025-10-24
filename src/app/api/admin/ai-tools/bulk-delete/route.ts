import { NextRequest, NextResponse } from 'next/server';
import { AIToolsService } from '@/lib/admin/services/ai-tools-service';
import { requireAdminAuth } from '@/lib/admin/admin-auth';
import { AdminErrorCode, createAdminError } from '@/lib/admin/admin-errors';

const aiToolsService = new AIToolsService();

/**
 * POST /api/admin/ai-tools/bulk-delete
 * Bulk delete AI tools
 */
export async function POST(request: NextRequest) {
    try {
        // Require admin authentication
        const user = await requireAdminAuth(request);

        const body = await request.json();
        const { ids } = body;

        // Validate input
        if (!Array.isArray(ids) || ids.length === 0) {
            throw createAdminError(AdminErrorCode.INVALID_INPUT, 'Phải cung cấp danh sách ID hợp lệ');
        }

        if (ids.some(id => typeof id !== 'string' || !id.trim())) {
            throw createAdminError(AdminErrorCode.INVALID_INPUT, 'Tất cả ID phải là chuỗi không rỗng');
        }

        // Perform bulk delete
        const deletedCount = await aiToolsService.bulkDeleteAITools(ids, user);

        return NextResponse.json({
            success: true,
            deletedCount,
            message: `Đã xóa ${deletedCount} công cụ AI`
        });
    } catch (error) {
        console.error('Error in POST /api/admin/ai-tools/bulk-delete:', error);

        if (error instanceof Error && 'statusCode' in error) {
            return NextResponse.json(
                { error: error.message, code: (error as any).code },
                { status: (error as any).statusCode }
            );
        }

        return NextResponse.json(
            { error: 'Lỗi server nội bộ', code: AdminErrorCode.INTERNAL_ERROR },
            { status: 500 }
        );
    }
}