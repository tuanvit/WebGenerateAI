/**
 * Templates Migration API Endpoint
 * Handles template migration from SUBJECT_TEMPLATES to database
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/admin/admin-auth';
import { templatesMigration } from '@/lib/admin/migrate-templates';
import { logAdminAction } from '@/lib/admin/admin-audit';
import { handleAdminError } from '@/lib/admin/admin-errors';

export async function POST(request: NextRequest) {
    try {
        // Require admin authentication
        const user = await requireAdminRole(request);

        const body = await request.json();
        const { action, overwriteExisting = false } = body;

        let result;

        switch (action) {
            case 'migrate':
                console.log('Starting template migration via API...');
                result = await templatesMigration.migrateAllTemplates(overwriteExisting);

                // Log admin action
                await logAdminAction(user.id, 'IMPORT', 'templates', null, {
                    action: 'migrate_templates',
                    overwriteExisting,
                    migratedCount: result.migratedCount,
                    skippedCount: result.skippedCount,
                    failedCount: result.details.failed.length
                });

                break;

            case 'rollback':
                console.log('Starting template migration rollback via API...');
                result = await templatesMigration.rollbackMigration();

                // Log admin action
                await logAdminAction(user.id, 'DELETE', 'templates', null, {
                    action: 'rollback_migration',
                    removedCount: result.removedCount,
                    errorCount: result.errors.length
                });

                break;

            default:
                return NextResponse.json(
                    { error: 'Invalid action. Use "migrate" or "rollback"' },
                    { status: 400 }
                );
        }

        return NextResponse.json({
            success: true,
            result
        });

    } catch (error) {
        console.error('Template migration API error:', error);
        const adminError = handleAdminError(error);

        return NextResponse.json(
            {
                error: adminError.message,
                code: adminError.code,
                details: adminError.details
            },
            { status: adminError.statusCode }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        // Require admin authentication
        await requireAdminRole(request);

        // Get migration status
        const status = await templatesMigration.checkMigrationStatus();

        return NextResponse.json({
            success: true,
            status
        });

    } catch (error) {
        console.error('Template migration status API error:', error);
        const adminError = handleAdminError(error);

        return NextResponse.json(
            {
                error: adminError.message,
                code: adminError.code
            },
            { status: adminError.statusCode }
        );
    }
}