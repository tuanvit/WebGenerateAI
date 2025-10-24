import { NextRequest, NextResponse } from 'next/server';
import { AIToolsService, AIToolSearchFilters } from '@/lib/admin/services/ai-tools-service';
import { requireAdminAuth } from '@/lib/admin/admin-auth';
import { AdminErrorCode } from '@/lib/admin/admin-errors';

const aiToolsService = new AIToolsService();

/**
 * GET /api/admin/ai-tools/export
 * Export AI tools data
 */
export async function GET(request: NextRequest) {
    try {
        // Require admin authentication
        const user = await requireAdminAuth(request);

        const { searchParams } = new URL(request.url);

        // Check if specific IDs are requested
        const ids = searchParams.getAll('ids');

        let aiTools;

        if (ids.length > 0) {
            // Export specific tools by IDs
            aiTools = await Promise.all(
                ids.map(id => aiToolsService.getAIToolById(id))
            );
            // Filter out null results
            aiTools = aiTools.filter(tool => tool !== null);
        } else {
            // Export all tools with filters
            const filters: AIToolSearchFilters = {
                searchTerm: searchParams.get('search') || undefined,
                categories: searchParams.get('category') ? [searchParams.get('category')!] : undefined,
                subjects: searchParams.get('subject') ? [searchParams.get('subject')!] : undefined,
                gradeLevels: searchParams.get('gradeLevel') ? [parseInt(searchParams.get('gradeLevel')!)] : undefined,
                difficulties: searchParams.get('difficulty') ? [searchParams.get('difficulty')!] : undefined,
                pricingModels: searchParams.get('pricingModel') ? [searchParams.get('pricingModel')!] : undefined,
                vietnameseSupport: searchParams.get('vietnameseSupport') ? searchParams.get('vietnameseSupport') === 'true' : undefined
            };

            aiTools = await aiToolsService.exportAITools(filters, user);
        }

        // Prepare export data
        const exportData = {
            exportDate: new Date().toISOString(),
            totalItems: aiTools.length,
            data: aiTools
        };

        // Return JSON file
        const response = new NextResponse(JSON.stringify(exportData, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="ai-tools-export-${new Date().toISOString().split('T')[0]}.json"`
            }
        });

        return response;
    } catch (error) {
        console.error('Error in GET /api/admin/ai-tools/export:', error);

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