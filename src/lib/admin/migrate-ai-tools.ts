/**
 * Migration script to populate ai_tools table with current 40+ tools from AI_TOOLS_DATABASE
 * Ensures all tool properties are properly mapped and validated
 * Includes data integrity checks and rollback capabilities
 */

import { prisma } from '@/lib/db';
import { AI_TOOLS_DATABASE } from '@/services/ai-tool-recommendation/ai-tools-data';
import { validateAITool } from './admin-validation';
import { AdminErrorCode, createAdminError } from './admin-errors';

export interface MigrationResult {
    success: boolean;
    migratedCount: number;
    skippedCount: number;
    errors: Array<{ toolId: string; error: string }>;
    rollbackData?: any[];
}

/**
 * Migrate AI tools from existing data to database
 */
export const migrateAIToolsToDatabase = async (options: {
    dryRun?: boolean;
    overwrite?: boolean;
    validateOnly?: boolean;
} = {}): Promise<MigrationResult> => {
    const { dryRun = false, overwrite = false, validateOnly = false } = options;

    console.log(`Starting AI tools migration (dryRun: ${dryRun}, overwrite: ${overwrite}, validateOnly: ${validateOnly})`);

    const result: MigrationResult = {
        success: false,
        migratedCount: 0,
        skippedCount: 0,
        errors: []
    };

    try {
        // Step 1: Validate all AI tools data
        console.log('Step 1: Validating AI tools data...');
        const validationErrors: Array<{ toolId: string; error: string }> = [];

        for (const tool of AI_TOOLS_DATABASE) {
            try {
                // Transform the tool data to match our database schema
                const transformedTool = {
                    id: tool.id,
                    name: tool.name,
                    description: tool.description,
                    url: tool.url,
                    category: tool.category,
                    subjects: tool.subjects,
                    gradeLevel: tool.gradeLevel,
                    useCase: tool.useCase,
                    vietnameseSupport: tool.vietnameseSupport,
                    difficulty: tool.difficulty,
                    features: tool.features,
                    pricingModel: tool.pricingModel,
                    integrationInstructions: tool.integrationInstructions,
                    samplePrompts: tool.samplePrompts || [],
                    relatedTools: tool.relatedTools || []
                };

                // Validate using our validation schema
                validateAITool(transformedTool);
            } catch (error) {
                validationErrors.push({
                    toolId: tool.id,
                    error: error instanceof Error ? error.message : 'Unknown validation error'
                });
            }
        }

        if (validationErrors.length > 0) {
            console.error(`Validation failed for ${validationErrors.length} tools:`);
            validationErrors.forEach(({ toolId, error }) => {
                console.error(`- ${toolId}: ${error}`);
            });
            result.errors = validationErrors;

            if (validateOnly) {
                return result;
            }

            throw createAdminError(
                AdminErrorCode.BULK_VALIDATION_ERROR,
                `${validationErrors.length} công cụ AI có lỗi validation`
            );
        }

        console.log(`✓ All ${AI_TOOLS_DATABASE.length} AI tools passed validation`);

        if (validateOnly) {
            result.success = true;
            return result;
        }

        // Step 2: Check existing data
        console.log('Step 2: Checking existing data...');
        const existingTools = await prisma.aITool.findMany({
            select: { id: true, name: true }
        });

        const existingIds = new Set(existingTools.map(tool => tool.id));
        const existingNames = new Set(existingTools.map(tool => tool.name));

        console.log(`Found ${existingTools.length} existing AI tools in database`);

        // Step 3: Prepare migration data
        console.log('Step 3: Preparing migration data...');
        const toolsToMigrate = [];
        const toolsToSkip = [];

        for (const tool of AI_TOOLS_DATABASE) {
            const exists = existingIds.has(tool.id) || existingNames.has(tool.name);

            if (exists && !overwrite) {
                toolsToSkip.push(tool);
                continue;
            }

            toolsToMigrate.push({
                id: tool.id,
                name: tool.name,
                description: tool.description,
                url: tool.url,
                category: tool.category,
                subjects: JSON.stringify(tool.subjects),
                gradeLevel: JSON.stringify(tool.gradeLevel),
                useCase: tool.useCase,
                vietnameseSupport: tool.vietnameseSupport,
                difficulty: tool.difficulty,
                features: JSON.stringify(tool.features),
                pricingModel: tool.pricingModel,
                integrationInstructions: tool.integrationInstructions || null,
                samplePrompts: tool.samplePrompts ? JSON.stringify(tool.samplePrompts) : null,
                relatedTools: tool.relatedTools ? JSON.stringify(tool.relatedTools) : null
            });
        }

        console.log(`Tools to migrate: ${toolsToMigrate.length}`);
        console.log(`Tools to skip: ${toolsToSkip.length}`);

        result.skippedCount = toolsToSkip.length;

        if (dryRun) {
            console.log('DRY RUN: Migration would proceed with the following actions:');
            console.log(`- Migrate ${toolsToMigrate.length} tools`);
            console.log(`- Skip ${toolsToSkip.length} existing tools`);
            result.success = true;
            result.migratedCount = toolsToMigrate.length;
            return result;
        }

        // Step 4: Backup existing data for rollback
        if (overwrite && existingTools.length > 0) {
            console.log('Step 4: Creating backup for rollback...');
            const backupData = await prisma.aITool.findMany();
            result.rollbackData = backupData;
            console.log(`✓ Backed up ${backupData.length} existing tools`);
        }

        // Step 5: Perform migration
        console.log('Step 5: Performing migration...');

        if (overwrite) {
            // Delete existing tools that will be replaced
            const toolIdsToReplace = toolsToMigrate.map(tool => tool.id);
            const deleteResult = await prisma.aITool.deleteMany({
                where: {
                    OR: [
                        { id: { in: toolIdsToReplace } },
                        { name: { in: toolsToMigrate.map(tool => tool.name) } }
                    ]
                }
            });
            console.log(`Deleted ${deleteResult.count} existing tools for replacement`);
        }

        // Insert new tools
        if (toolsToMigrate.length > 0) {
            await prisma.aITool.createMany({
                data: toolsToMigrate
            });
            console.log(`✓ Migrated ${toolsToMigrate.length} AI tools`);
        }

        result.success = true;
        result.migratedCount = toolsToMigrate.length;

        // Step 6: Verify migration
        console.log('Step 6: Verifying migration...');
        const finalCount = await prisma.aITool.count();
        console.log(`✓ Database now contains ${finalCount} AI tools`);

        // Step 7: Data integrity checks
        console.log('Step 7: Running data integrity checks...');
        const integrityErrors = await runDataIntegrityChecks();

        if (integrityErrors.length > 0) {
            console.warn(`Found ${integrityErrors.length} data integrity issues:`);
            integrityErrors.forEach(error => console.warn(`- ${error}`));
            result.errors.push(...integrityErrors.map(error => ({ toolId: 'unknown', error })));
        } else {
            console.log('✓ All data integrity checks passed');
        }

        console.log('Migration completed successfully!');
        return result;

    } catch (error) {
        console.error('Migration failed:', error);
        result.success = false;
        result.errors.push({
            toolId: 'migration',
            error: error instanceof Error ? error.message : 'Unknown migration error'
        });
        return result;
    }
};

/**
 * Rollback migration using backup data
 */
export const rollbackAIToolsMigration = async (backupData: any[]): Promise<boolean> => {
    console.log('Starting rollback...');

    try {
        // Clear current data
        await prisma.aITool.deleteMany();
        console.log('Cleared current AI tools data');

        // Restore backup data
        if (backupData.length > 0) {
            await prisma.aITool.createMany({
                data: backupData
            });
            console.log(`✓ Restored ${backupData.length} AI tools from backup`);
        }

        console.log('Rollback completed successfully');
        return true;
    } catch (error) {
        console.error('Rollback failed:', error);
        return false;
    }
};

/**
 * Run data integrity checks
 */
const runDataIntegrityChecks = async (): Promise<string[]> => {
    const errors: string[] = [];

    try {
        // Check for duplicate names
        const duplicateNames = await prisma.aITool.groupBy({
            by: ['name'],
            having: {
                name: {
                    _count: {
                        gt: 1
                    }
                }
            }
        });

        if (duplicateNames.length > 0) {
            errors.push(`Found duplicate tool names: ${duplicateNames.map(d => d.name).join(', ')}`);
        }

        // Check for duplicate URLs
        const duplicateUrls = await prisma.aITool.groupBy({
            by: ['url'],
            having: {
                url: {
                    _count: {
                        gt: 1
                    }
                }
            }
        });

        if (duplicateUrls.length > 0) {
            errors.push(`Found duplicate URLs: ${duplicateUrls.map(d => d.url).join(', ')}`);
        }

        // Check for invalid JSON in array fields
        const allTools = await prisma.aITool.findMany({
            select: { id: true, name: true, subjects: true, gradeLevel: true, features: true, samplePrompts: true, relatedTools: true }
        });

        for (const tool of allTools) {
            try {
                JSON.parse(tool.subjects);
                JSON.parse(tool.gradeLevel);
                JSON.parse(tool.features);
                if (tool.samplePrompts) JSON.parse(tool.samplePrompts);
                if (tool.relatedTools) JSON.parse(tool.relatedTools);
            } catch (jsonError) {
                errors.push(`Invalid JSON in tool "${tool.name}" (${tool.id})`);
            }
        }

        // Check for required fields
        const toolsWithMissingFields = await prisma.aITool.findMany({
            where: {
                OR: [
                    { name: { equals: '' } },
                    { description: { equals: '' } },
                    { url: { equals: '' } },
                    { category: { equals: '' } },
                    { useCase: { equals: '' } }
                ]
            },
            select: { id: true, name: true }
        });

        if (toolsWithMissingFields.length > 0) {
            errors.push(`Found tools with missing required fields: ${toolsWithMissingFields.map(t => t.name).join(', ')}`);
        }

    } catch (error) {
        errors.push(`Error during integrity checks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return errors;
};

/**
 * Get migration status
 */
export const getMigrationStatus = async (): Promise<{
    databaseCount: number;
    sourceCount: number;
    needsMigration: boolean;
    lastMigration?: Date;
}> => {
    try {
        const [databaseCount, firstTool] = await Promise.all([
            prisma.aITool.count(),
            prisma.aITool.findFirst({
                orderBy: { createdAt: 'asc' },
                select: { createdAt: true }
            })
        ]);

        return {
            databaseCount,
            sourceCount: AI_TOOLS_DATABASE.length,
            needsMigration: databaseCount === 0 || databaseCount < AI_TOOLS_DATABASE.length,
            lastMigration: firstTool?.createdAt
        };
    } catch (error) {
        console.error('Error getting migration status:', error);
        return {
            databaseCount: 0,
            sourceCount: AI_TOOLS_DATABASE.length,
            needsMigration: true
        };
    }
};