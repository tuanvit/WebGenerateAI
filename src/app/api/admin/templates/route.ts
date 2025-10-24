import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/admin/admin-auth';
import { TemplatesService } from '@/lib/admin/services/templates-service';
import { TemplateFilters } from '@/lib/admin/repositories/templates-repository';
import { AdminErrorCode, createAdminError } from '@/lib/admin/admin-errors';
import { getCachedTemplates, invalidateTemplatesCache } from '@/lib/admin/admin-cache';

const templatesService = new TemplatesService();

export async function GET(request: NextRequest) {
    try {
        // Require admin authentication - TEMPORARILY BYPASSED FOR TESTING
        // const user = await requireAdminRole(request);

        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '25');
        const sortBy = searchParams.get('sortBy') || 'updatedAt';
        const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
        const search = searchParams.get('search') || undefined;
        const subject = searchParams.get('subject') || undefined;
        const gradeLevel = searchParams.get('gradeLevel') ? parseInt(searchParams.get('gradeLevel')!) : undefined;
        const outputType = searchParams.get('outputType') || undefined;
        const difficulty = searchParams.get('difficulty') || undefined;

        // Validate pagination parameters
        if (page < 1) {
            throw createAdminError(AdminErrorCode.INVALID_INPUT, 'Số trang phải lớn hơn 0');
        }

        if (limit < 1 || limit > 100) {
            throw createAdminError(AdminErrorCode.INVALID_INPUT, 'Kích thước trang phải từ 1 đến 100');
        }

        // Build filters
        const filters: TemplateFilters = {
            page,
            limit,
            sortBy,
            sortOrder,
            search,
            subject,
            gradeLevel: gradeLevel ? [gradeLevel] : undefined,
            outputType,
            difficulty
        };

        // Get templates using cache
        const result = await getCachedTemplates(filters);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in GET /api/admin/templates:', error);

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

export async function POST(request: NextRequest) {
    try {
        // TEMPORARILY BYPASS ADMIN AUTH FOR TESTING
        // const user = await requireAdminRole(request);
        const user = { id: 'test-admin' };

        // Parse request body
        const templateData = await request.json();

        console.log('Received template data:', JSON.stringify(templateData, null, 2));

        // Create template
        const template = await templatesService.createTemplate(templateData, user.id);

        // Invalidate cache after creation
        invalidateTemplatesCache();

        return NextResponse.json(template, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/admin/templates:', error);

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