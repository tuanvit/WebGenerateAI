import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole as requireAdminAuth } from '@/lib/admin/admin-auth';
import { BackupService, ImportOptions, BackupData } from '@/lib/admin/services/backup-service';
import { AdminErrorCode } from '@/lib/admin/admin-errors';
import { z } from 'zod';

const backupService = new BackupService();

// Validation schema for import options
const importOptionsSchema = z.object({
    overwriteExisting: z.boolean().default(false),
    validateData: z.boolean().default(true),
    createBackupBeforeImport: z.boolean().default(true),
    dryRun: z.boolean().default(false)
});

/**
 * POST /api/admin/backup/import
 * Import data from backup file
 */
export async function POST(request: NextRequest) {
    try {
        const user = await requireAdminAuth(request);

        // Parse multipart form data
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const optionsJson = formData.get('options') as string;

        if (!file) {
            return NextResponse.json(
                { error: 'Không có file được tải lên', code: AdminErrorCode.INVALID_INPUT },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.name.endsWith('.json')) {
            return NextResponse.json(
                { error: 'Chỉ hỗ trợ file JSON', code: AdminErrorCode.INVALID_FILE_TYPE },
                { status: 400 }
            );
        }

        // Validate file size (max 50MB)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File quá lớn (tối đa 50MB)', code: AdminErrorCode.FILE_TOO_LARGE },
                { status: 400 }
            );
        }

        // Parse import options
        let options: ImportOptions = {
            overwriteExisting: false,
            validateData: true,
            createBackupBeforeImport: true
        };

        if (optionsJson) {
            try {
                const parsedOptions = JSON.parse(optionsJson);
                const validation = importOptionsSchema.safeParse(parsedOptions);
                if (validation.success) {
                    options = validation.data;
                }
            } catch (error) {
                console.warn('Invalid options JSON, using defaults');
            }
        }

        // Parse backup data
        let backupData: BackupData;
        try {
            const fileContent = await file.text();
            backupData = JSON.parse(fileContent);
        } catch (error) {
            return NextResponse.json(
                { error: 'File JSON không hợp lệ', code: AdminErrorCode.INVALID_BACKUP_DATA },
                { status: 400 }
            );
        }

        // Import data
        const result = await backupService.importData(user, backupData, options);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in POST /api/admin/backup/import:', error);

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