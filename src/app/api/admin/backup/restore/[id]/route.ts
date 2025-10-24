import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole as requireAdminAuth } from '@/lib/admin/admin-auth';
import { BackupService, ImportOptions } from '@/lib/admin/services/backup-service';
import { AdminErrorCode } from '@/lib/admin/admin-errors';
import { z } from 'zod';

const backupService = new BackupService();

// Validation schema for restore options
const restoreOptionsSchema = z.object({
    overwriteExisting: z.boolean().default(false),
    validateData: z.boolean().default(true),
    createBackupBeforeRestore: z.boolean().default(true),
    dryRun: z.boolean().default(false)
});

/**
 * POST /api/admin/backup/restore/[id]
 * Restore data from a specific backup
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await requireAdminAuth(request);
        const backupId = id;
        const body = await request.json();

        const validation = restoreOptionsSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                {
                    error: 'Tùy chọn khôi phục không hợp lệ',
                    code: AdminErrorCode.VALIDATION_ERROR,
                    details: validation.error.issues
                },
                { status: 400 }
            );
        }

        const options: ImportOptions = {
            ...validation.data,
            createBackupBeforeImport: validation.data.createBackupBeforeRestore
        };

        // Get backup data
        const backupData = await backupService.getBackupData(backupId);

        // Restore data
        const result = await backupService.importData(user, backupData, options);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in POST /api/admin/backup/restore/[id]:', error);

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