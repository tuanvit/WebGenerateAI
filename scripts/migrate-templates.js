/**
 * Template Migration CLI Script
 * Usage: node scripts/migrate-templates.js [--overwrite] [--status] [--rollback]
 */

const { PrismaClient } = require('@prisma/client');

// Mock the database connection for the migration
global.prisma = new PrismaClient();

async function runMigration() {
    try {
        // Import the migration functions
        const { migrateTemplates, checkMigrationStatus, rollbackMigration } = require('../src/lib/admin/migrate-templates.ts');

        const args = process.argv.slice(2);
        const overwrite = args.includes('--overwrite');
        const statusOnly = args.includes('--status');
        const rollback = args.includes('--rollback');

        if (statusOnly) {
            console.log('Checking migration status...');
            const status = await checkMigrationStatus();
            console.log('\n=== Migration Status ===');
            console.log(`Total templates: ${status.totalTemplates}`);
            console.log(`Migrated templates: ${status.migratedTemplates}`);
            console.log(`Pending templates: ${status.pendingTemplates.length}`);

            if (status.pendingTemplates.length > 0) {
                console.log('\nPending templates:');
                status.pendingTemplates.forEach(id => console.log(`  - ${id}`));
            }

            if (status.existingTemplates.length > 0) {
                console.log('\nExisting templates:');
                status.existingTemplates.forEach(id => console.log(`  - ${id}`));
            }
            return;
        }

        if (rollback) {
            console.log('Rolling back template migration...');
            const result = await rollbackMigration();

            console.log('\n=== Rollback Results ===');
            console.log(`Success: ${result.success}`);
            console.log(`Removed templates: ${result.removedCount}`);

            if (result.errors.length > 0) {
                console.log('\nErrors:');
                result.errors.forEach(error => console.log(`  - ${error}`));
            }
            return;
        }

        console.log('Starting template migration...');
        console.log(`Overwrite existing: ${overwrite}`);

        const result = await migrateTemplates(overwrite);

        console.log('\n=== Migration Results ===');
        console.log(`Success: ${result.success}`);
        console.log(`Migrated: ${result.migratedCount}`);
        console.log(`Skipped: ${result.skippedCount}`);
        console.log(`Failed: ${result.details.failed.length}`);

        if (result.details.migrated.length > 0) {
            console.log('\nMigrated templates:');
            result.details.migrated.forEach(id => console.log(`  ✓ ${id}`));
        }

        if (result.details.skipped.length > 0) {
            console.log('\nSkipped templates:');
            result.details.skipped.forEach(id => console.log(`  - ${id}`));
        }

        if (result.details.failed.length > 0) {
            console.log('\nFailed templates:');
            result.details.failed.forEach(id => console.log(`  ✗ ${id}`));
        }

        if (result.errors.length > 0) {
            console.log('\nErrors:');
            result.errors.forEach(error => console.log(`  ${error}`));
        }

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await global.prisma.$disconnect();
    }
}

// Show usage if no arguments
if (process.argv.length === 2) {
    console.log('Template Migration CLI');
    console.log('Usage:');
    console.log('  node scripts/migrate-templates.js                 # Migrate templates (skip existing)');
    console.log('  node scripts/migrate-templates.js --overwrite     # Migrate templates (overwrite existing)');
    console.log('  node scripts/migrate-templates.js --status        # Check migration status');
    console.log('  node scripts/migrate-templates.js --rollback      # Rollback migration');
    process.exit(0);
}

runMigration();