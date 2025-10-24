import { NextRequest, NextResponse } from 'next/server';
import { AIToolsService, BulkUpdateData } from '@/lib/admin/services/ai-tools-service';
import { requireAdminAuth } from '@/lib/admin/admin-auth';
import { AdminErrorCode, createAdminError } from '@/lib/admin/admin-errors';
import { invalidateAIToolsCache } from '@/lib/admin/admin-cache';

const aiToolsService = new AIToolsService();

/**
 * POST /api/admin/ai-tools/bulk-update
 * Bulk update AI tools
 */
export async function POST(request: NextRequest) {
    try {
        // Require admin authentication
        const user = await requireAdminAuth(request);

        const body = await request.json();
        const { ids, updates } = body;

        // Validate input
        if (!Array.isArray(ids) || ids.length === 0) {
            throw createAdminError(AdminErrorCode.INVALID_INPUT, 'Phải cung cấp danh sách ID hợp lệ');
        }

        if (ids.some(id => typeof id !== 'string' || !id.trim())) {
            throw createAdminError(AdminErrorCode.INVALID_INPUT, 'Tất cả ID phải là chuỗi không rỗng');
        }

        if (!updates || typeof updates !== 'object') {
            throw createAdminError(AdminErrorCode.INVALID_INPUT, 'Phải cung cấp dữ liệu cập nhật hợp lệ');
        }

        const bulkUpdateData: BulkUpdateData = { ids, updates };

        // Perform bulk update
        const updatedCount = await aiToolsService.bulkUpdateAITools(bulkUpdateData, user);

        // Invalidate cache after bulk update
        invalidateAIToolsCache();

        return NextResponse.json({
            success: true,
            updatedCount,
            message: `Đã cập nhật ${updatedCount} công cụ AI`
        });
    } catch (error) {
        console.error('Error in POST /api/admin/ai-tools/bulk-update:', error);

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