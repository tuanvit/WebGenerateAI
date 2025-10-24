import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole as requireAdminAuth } from '@/lib/admin/admin-auth';
import { BackupService } from '@/lib/admin/services/backup-service';
import { AdminErrorCode } from '@/lib/admin/admin-errors';

const backupService = new BackupService();

/**
 * POST /api/admin/backup/[id]/verify
 * Verify backup integrity
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAdminAuth(request);
        const backupId = params.id;

        const verification = await backupService.verifyBackup(backupId);

        return NextResponse.json(verification);
    } catch (error) {
        console.error('Error in POST /api/admin/backup/[id]/verify:', error);

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