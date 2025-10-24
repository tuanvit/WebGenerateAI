/**
 * Test Template Migration
 * Simple test to verify migration functionality
 */

import { templatesMigration } from './migrate-templates';

export async function testTemplateMigration() {
    try {
        console.log('Testing template migration...');

        // Check migration status
        const status = await templatesMigration.checkMigrationStatus();
        console.log('Migration Status:', status);

        // If no templates are migrated, run a test migration
        if (status.migratedTemplates === 0) {
            console.log('Running test migration...');
            const result = await templatesMigration.migrateAllTemplates(false);
            console.log('Migration Result:', result);
            return result;
        } else {
            console.log('Templates already migrated. Skipping migration.');
            return { success: true, message: 'Templates already exist' };
        }

    } catch (error) {
        console.error('Migration test failed:', error);
        throw error;
    }
}