import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole as requireAdminAuth } from '@/lib/admin/admin-auth';
import { BackupService } from '@/lib/admin/services/backup-service';
import { AdminErrorCode } from '@/lib/admin/admin-errors';
import { z } from 'zod';

const backupService = new BackupService();

// Validation schemas
const createBackupSchema = z.object({
    name: z.string().min(1, 'Tên backup không được để trống'),
    description: z.string().optional(),
    type: z.enum(['manual', 'automatic']).default('manual')
});

/**
 * GET /api/admin/backup
 * Get list of backups
 */
export async function GET(request: NextRequest) {
    try {
        const user = await requireAdminAuth(request);
        const { searchParams } = new URL(request.url);

        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        const result = await backupService.getBackups(limit, offset);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in GET /api/admin/backup:', error);

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

/**
 * POST /api/admin/backup
 * Create a new backup
 */
export async function POST(request: NextRequest) {
    try {
        const user = await requireAdminAuth(request);
        const body = await request.json();

        const validation = createBackupSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                {
                    error: 'Dữ liệu không hợp lệ',
                    code: AdminErrorCode.VALIDATION_ERROR,
                    details: validation.error.issues
                },
                { status: 400 }
            );
        }

        const { name, description, type } = validation.data;

        const backup = await backupService.createBackup(user, name, description, type);

        return NextResponse.json(backup, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/admin/backup:', error);

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