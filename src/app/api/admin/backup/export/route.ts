import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole as requireAdminAuth } from '@/lib/admin/admin-auth';
import { BackupService, ExportOptions } from '@/lib/admin/services/backup-service';
import { AdminErrorCode } from '@/lib/admin/admin-errors';
import { z } from 'zod';

const backupService = new BackupService();

// Validation schema for export options
const exportOptionsSchema = z.object({
    format: z.enum(['json', 'csv']).default('json'),
    includeAITools: z.boolean().default(true),
    includeTemplates: z.boolean().default(true),
    filters: z.object({
        aiToolFilters: z.object({
            categories: z.array(z.string()).optional(),
            subjects: z.array(z.string()).optional(),
            gradeLevels: z.array(z.number()).optional()
        }).optional(),
        templateFilters: z.object({
            subjects: z.array(z.string()).optional(),
            gradeLevels: z.array(z.number()).optional()
        }).optional()
    }).optional(),
    compression: z.boolean().default(false)
});

/**
 * POST /api/admin/backup/export
 * Export data with custom options
 */
export async function POST(request: NextRequest) {
    try {
        const user = await requireAdminAuth(request);
        const body = await request.json();

        const validation = exportOptionsSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                {
                    error: 'Tùy chọn xuất dữ liệu không hợp lệ',
                    code: AdminErrorCode.VALIDATION_ERROR,
                    details: validation.error.issues
                },
                { status: 400 }
            );
        }

        const options: ExportOptions = validation.data;
        const backupData = await backupService.exportData(user, options);

        if (options.format === 'json') {
            return new NextResponse(JSON.stringify(backupData, null, 2), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename="export-${new Date().toISOString().split('T')[0]}.json"`
                }
            });
        }

        // For CSV format (future implementation)
        return NextResponse.json(
            { error: 'Định dạng CSV chưa được hỗ trợ', code: AdminErrorCode.INVALID_INPUT },
            { status: 400 }
        );
    } catch (error) {
        console.error('Error in POST /api/admin/backup/export:', error);

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