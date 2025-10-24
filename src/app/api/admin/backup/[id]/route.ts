import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole as requireAdminAuth } from '@/lib/admin/admin-auth';
import { BackupService } from '@/lib/admin/services/backup-service';
import { AdminErrorCode } from '@/lib/admin/admin-errors';

const backupService = new BackupService();

/**
 * GET /api/admin/backup/[id]
 * Get backup data for download
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await requireAdminAuth(request);
        const backupId = id;

        const backupData = await backupService.getBackupData(backupId);

        // Return as downloadable JSON file
        const response = new NextResponse(JSON.stringify(backupData, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="backup-${backupId}-${new Date().toISOString().split('T')[0]}.json"`
            }
        });

        return response;
    } catch (error) {
        console.error('Error in GET /api/admin/backup/[id]:', error);

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
 * DELETE /api/admin/backup/[id]
 * Delete a backup
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await requireAdminAuth(request);
        const backupId = id;

        await backupService.deleteBackup(user, backupId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /api/admin/backup/[id]:', error);

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