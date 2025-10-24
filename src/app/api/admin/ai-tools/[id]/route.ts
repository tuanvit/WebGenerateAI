import { NextRequest, NextResponse } from 'next/server';
import { AIToolsService } from '@/lib/admin/services/ai-tools-service';
import { requireAdminAuth } from '@/lib/admin/admin-auth';
import { AdminErrorCode } from '@/lib/admin/admin-errors';
import { getCachedAIToolById, invalidateAIToolsCache } from '@/lib/admin/admin-cache';

const aiToolsService = new AIToolsService();

/**
 * GET /api/admin/ai-tools/[id]
 * Get AI tool by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Await params before using
        const { id } = await params;

        // Require admin authentication
        await requireAdminAuth(request);

        const aiTool = await getCachedAIToolById(id);

        return NextResponse.json(aiTool);
    } catch (error) {
        console.error('Error in GET /api/admin/ai-tools/[id]:', error);

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

/**
 * PUT /api/admin/ai-tools/[id]
 * Update AI tool
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Await params before using
        const { id } = await params;

        // Require admin authentication
        const user = await requireAdminAuth(request);

        const body = await request.json();

        // Update AI tool
        const aiTool = await aiToolsService.updateAITool(id, body, user);

        // Invalidate cache after update
        invalidateAIToolsCache();

        return NextResponse.json(aiTool);
    } catch (error) {
        console.error('Error in PUT /api/admin/ai-tools/[id]:', error);

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

/**
 * DELETE /api/admin/ai-tools/[id]
 * Delete AI tool
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Await params before using
        const { id } = await params;

        // Require admin authentication
        const user = await requireAdminAuth(request);

        // Delete AI tool
        await aiToolsService.deleteAITool(id, user);

        // Invalidate cache after deletion
        invalidateAIToolsCache();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /api/admin/ai-tools/[id]:', error);

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