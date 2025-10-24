import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole as requireAdminAuth } from '@/lib/admin/admin-auth';
import { getBackupScheduler, BackupScheduleConfig } from '@/lib/admin/services/backup-scheduler';
import { AdminErrorCode } from '@/lib/admin/admin-errors';
import { z } from 'zod';

const scheduler = getBackupScheduler();

// Validation schema for schedule config
const scheduleConfigSchema = z.object({
    enabled: z.boolean(),
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    retentionDays: z.number().min(1).max(365),
    maxBackups: z.number().min(1).max(100),
    includeAITools: z.boolean(),
    includeTemplates: z.boolean()
});

/**
 * GET /api/admin/backup/schedule
 * Get backup schedule configuration
 */
export async function GET(request: NextRequest) {
    try {
        const user = await requireAdminAuth(request);

        const config = await scheduler.getScheduleConfig();
        const stats = await scheduler.getBackupStats();

        return NextResponse.json({
            config,
            stats
        });
    } catch (error) {
        console.error('Error in GET /api/admin/backup/schedule:', error);

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
 * PUT /api/admin/backup/schedule
 * Update backup schedule configuration
 */
export async function PUT(request: NextRequest) {
    try {
        const user = await requireAdminAuth(request);
        const body = await request.json();

        const validation = scheduleConfigSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                {
                    error: 'Cấu hình lịch backup không hợp lệ',
                    code: AdminErrorCode.VALIDATION_ERROR,
                    details: validation.error.issues
                },
                { status: 400 }
            );
        }

        const config: BackupScheduleConfig = validation.data;

        await scheduler.updateScheduleConfig(user, config);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in PUT /api/admin/backup/schedule:', error);

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