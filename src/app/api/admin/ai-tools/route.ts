import { NextRequest, NextResponse } from 'next/server';
import { AIToolsService, AIToolSearchFilters } from '@/lib/admin/services/ai-tools-service';
import { requireAdminAuth } from '@/lib/admin/admin-auth';
import { AdminErrorCode, createAdminError } from '@/lib/admin/admin-errors';
import { getCachedAITools, invalidateAIToolsCache } from '@/lib/admin/admin-cache';

const aiToolsService = new AIToolsService();

/**
 * GET /api/admin/ai-tools
 * Get AI tools with filtering, sorting, and pagination
 */
export async function GET(request: NextRequest) {
    try {
        // Require admin authentication - TEMPORARILY BYPASSED FOR TESTING
        // const user = await requireAdminAuth(request);

        const { searchParams } = new URL(request.url);

        // Parse query parameters
        const filters: AIToolSearchFilters = {
            searchTerm: searchParams.get('search') || undefined,
            categories: searchParams.get('category') ? [searchParams.get('category')!] : undefined,
            subjects: searchParams.get('subject') ? [searchParams.get('subject')!] : undefined,
            gradeLevels: searchParams.get('gradeLevel') ? [parseInt(searchParams.get('gradeLevel')!)] : undefined,
            difficulties: searchParams.get('difficulty') ? [searchParams.get('difficulty')!] : undefined,
            pricingModels: searchParams.get('pricingModel') ? [searchParams.get('pricingModel')!] : undefined,
            vietnameseSupport: searchParams.get('vietnameseSupport') ? searchParams.get('vietnameseSupport') === 'true' : undefined,
            page: parseInt(searchParams.get('page') || '1'),
            limit: parseInt(searchParams.get('limit') || '25'),
            sortBy: searchParams.get('sortBy') || 'updatedAt',
            sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
        };

        // Validate pagination parameters
        if (filters.page < 1) {
            throw createAdminError(AdminErrorCode.INVALID_INPUT, 'Số trang phải lớn hơn 0');
        }

        if (filters.limit < 1 || filters.limit > 100) {
            throw createAdminError(AdminErrorCode.INVALID_INPUT, 'Kích thước trang phải từ 1 đến 100');
        }

        // Get AI tools using cache
        const result = await getCachedAITools(filters);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in GET /api/admin/ai-tools:', error);

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
 * POST /api/admin/ai-tools
 * Create new AI tool
 */
export async function POST(request: NextRequest) {
    try {
        // Require admin authentication
        const user = await requireAdminAuth(request);

        const body = await request.json();

        // Create AI tool
        const aiTool = await aiToolsService.createAITool(body, user);

        // Invalidate cache after creation
        invalidateAIToolsCache();

        return NextResponse.json(aiTool, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/admin/ai-tools:', error);

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