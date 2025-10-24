import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/admin/admin-auth';
import { TemplatesService } from '@/lib/admin/services/templates-service';
import { AdminErrorCode } from '@/lib/admin/admin-errors';

const templatesService = new TemplatesService();

export async function GET(request: NextRequest) {
    try {
        // Require admin authentication
        const user = await requireAdminRole(request);

        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const ids = searchParams.getAll('ids');
        const format = searchParams.get('format') || 'json';

        let templates;

        if (ids.length > 0) {
            // Export specific templates
            templates = [];
            for (const id of ids) {
                const template = await templatesService.getTemplateById(id);
                if (template) {
                    templates.push(template);
                }
            }
        } else {
            // Export all templates
            const result = await templatesService.getTemplates({ limit: 1000 }); // Get all templates
            templates = result.data;
        }

        // Prepare export data
        const exportData = {
            exportDate: new Date().toISOString(),
            exportedBy: user.id,
            totalTemplates: templates.length,
            templates: templates
        };

        if (format === 'json') {
            return new NextResponse(JSON.stringify(exportData, null, 2), {
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename="templates-export-${new Date().toISOString().split('T')[0]}.json"`
                }
            });
        }

        // For future: Add CSV export support
        return NextResponse.json(
            { error: 'Định dạng xuất không được hỗ trợ' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Error in GET /api/admin/templates/export:', error);

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