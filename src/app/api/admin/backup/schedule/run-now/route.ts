import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole as requireAdminAuth } from '@/lib/admin/admin-auth';
import { getBackupScheduler } from '@/lib/admin/services/backup-scheduler';
import { AdminErrorCode } from '@/lib/admin/admin-errors';

const scheduler = getBackupScheduler();

/**
 * POST /api/admin/backup/schedule/run-now
 * Manually trigger a scheduled backup
 */
export async function POST(request: NextRequest) {
    try {
        const user = await requireAdminAuth(request);

        const result = await scheduler.runBackupNow(user);

        if (result.success) {
            return NextResponse.json({
                success: true,
                backupId: result.backupId,
                cleanedUpCount: result.cleanedUpCount
            });
        } else {
            return NextResponse.json(
                {
                    error: result.error || 'Backup thất bại',
                    code: AdminErrorCode.BACKUP_FAILED
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error in POST /api/admin/backup/schedule/run-now:', error);

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