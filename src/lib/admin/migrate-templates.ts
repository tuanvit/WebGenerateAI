/**
 * Template Migration Script
 * Migrates existing templates from SUBJECT_TEMPLATES to database
 */

import { prisma } from '@/lib/db';
import { SUBJECT_TEMPLATES } from '@/services/templates/SubjectTemplateService';
import templatesRepository, { TemplateData } from './repositories/templates-repository';
import { AdminErrorCode, createAdminError } from './admin-errors';

export interface MigrationResult {
    success: boolean;
    migratedCount: number;
    skippedCount: number;
    errors: string[];
    details: {
        migrated: string[];
        skipped: string[];
        failed: string[];
    };
}

export class TemplatesMigration {
    private repository: TemplatesRepository;

    constructor() {
        this.repository = templatesRepository;
    }

    /**
     * Migrate all templates from SUBJECT_TEMPLATES to database
     */
    async migrateAllTemplates(overwriteExisting: boolean = false): Promise<MigrationResult> {
        const result: MigrationResult = {
            success: true,
            migratedCount: 0,
            skippedCount: 0,
            errors: [] as string[],
            details: {
                migrated: [] as string[],
                skipped: [] as string[],
                failed: [] as string[]
            }
        };

        console.log(`Starting template migration. Total templates to migrate: ${SUBJECT_TEMPLATES.length}`);

        for (const template of SUBJECT_TEMPLATES) {
            try {
                const migrationResult = await this.migrateTemplate(template, overwriteExisting);

                if (migrationResult.success) {
                    result.migratedCount++;
                    result.details.migrated.push(template.id);
                    console.log(`✓ Migrated template: ${template.name} (${template.id})`);
                } else {
                    result.skippedCount++;
                    result.details.skipped.push(template.id);
                    console.log(`- Skipped template: ${template.name} (${template.id}) - ${migrationResult.reason}`);
                }
            } catch (error) {
                result.success = false;
                result.errors.push(`Failed to migrate ${template.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                result.details.failed.push(template.id);
                console.error(`✗ Failed to migrate template: ${template.name} (${template.id})`, error);
            }
        }

        console.log(`Migration completed. Migrated: ${result.migratedCount}, Skipped: ${result.skippedCount}, Failed: ${result.details.failed.length}`);
        return result;
    }

    /**
     * Migrate a single template
     */
    async migrateTemplate(template: any, overwriteExisting: boolean = false): Promise<{
        success: boolean;
        reason?: string;
    }> {
        try {
            // Check if template already exists
            const existing = await this.repository.getTemplateById(template.id);

            if (existing && !overwriteExisting) {
                return {
                    success: false,
                    reason: 'Template already exists'
                };
            }

            // Transform template to database format
            const templateData = this.transformTemplateToDbFormat(template);

            // Validate template data
            this.validateTemplateData(templateData);

            if (existing && overwriteExisting) {
                // Update existing template
                await this.repository.updateTemplate(template.id, templateData);
            } else {
                // Create new template
                await this.repository.createTemplate(templateData);
            }

            return { success: true };
        } catch (error) {
            console.error(`Error migrating template ${template.id}:`, error);
            throw error;
        }
    }

    /**
     * Transform template from SUBJECT_TEMPLATES format to database format
     */
    private transformTemplateToDbFormat(template: any): TemplateData {
        return {
            id: template.id,
            name: template.name,
            description: template.description,
            subject: template.subject,
            gradeLevel: template.gradeLevel,
            outputType: template.outputType,
            templateContent: template.template, // Note: 'template' field becomes 'templateContent'
            recommendedTools: template.recommendedTools || [],
            tags: template.tags || [],
            difficulty: template.difficulty,
            compliance: template.compliance || [],
            variables: template.variables ? template.variables.map((variable: any) => ({
                name: variable.name,
                label: variable.label,
                description: variable.description,
                type: variable.type,
                required: variable.required,
                placeholder: variable.placeholder,
                options: variable.options,
                defaultValue: variable.defaultValue
            })) : [],
            examples: template.examples ? template.examples.map((example: any) => ({
                title: example.title,
                description: example.description,
                sampleInput: example.sampleInput,
                expectedOutput: example.expectedOutput
            })) : []
        };
    }

    /**
     * Validate template data before migration
     */
    private validateTemplateData(templateData: TemplateData): void {
        // Basic validation
        if (!templateData.id || !templateData.name || !templateData.description) {
            throw createAdminError(AdminErrorCode.VALIDATION_ERROR, 'Template thiếu thông tin cơ bản');
        }

        if (!templateData.subject) {
            throw createAdminError(AdminErrorCode.VALIDATION_ERROR, 'Template thiếu thông tin môn học');
        }

        if (!templateData.gradeLevel || templateData.gradeLevel.length === 0) {
            throw createAdminError(AdminErrorCode.VALIDATION_ERROR, 'Template thiếu thông tin lớp học');
        }

        if (!templateData.templateContent || templateData.templateContent.length < 50) {
            throw createAdminError(AdminErrorCode.VALIDATION_ERROR, 'Nội dung template quá ngắn');
        }

        // Validate grade levels
        const validGradeLevels = [6, 7, 8, 9];
        if (!templateData.gradeLevel.every(grade => validGradeLevels.includes(grade))) {
            throw createAdminError(AdminErrorCode.VALIDATION_ERROR, 'Lớp học không hợp lệ');
        }

        // Validate output type
        const validOutputTypes = ['lesson-plan', 'presentation', 'assessment', 'interactive', 'research'];
        if (!validOutputTypes.includes(templateData.outputType)) {
            throw createAdminError(AdminErrorCode.VALIDATION_ERROR, 'Loại đầu ra không hợp lệ');
        }

        // Validate difficulty
        const validDifficulties = ['beginner', 'intermediate', 'advanced'];
        if (!validDifficulties.includes(templateData.difficulty)) {
            throw createAdminError(AdminErrorCode.VALIDATION_ERROR, 'Mức độ khó không hợp lệ');
        }

        // Validate variables
        if (templateData.variables) {
            for (const variable of templateData.variables) {
                if (!variable.name || !variable.label) {
                    throw createAdminError(AdminErrorCode.VALIDATION_ERROR, `Biến template thiếu thông tin: ${variable.name}`);
                }

                const validTypes = ['text', 'textarea', 'select', 'multiselect'];
                if (!validTypes.includes(variable.type)) {
                    throw createAdminError(AdminErrorCode.VALIDATION_ERROR, `Loại biến không hợp lệ: ${variable.type}`);
                }
            }
        }

        // Validate examples
        if (templateData.examples) {
            for (const example of templateData.examples) {
                if (!example.title || !example.description || !example.expectedOutput) {
                    throw createAdminError(AdminErrorCode.VALIDATION_ERROR, `Ví dụ template thiếu thông tin: ${example.title}`);
                }
            }
        }
    }

    /**
     * Check migration status
     */
    async checkMigrationStatus(): Promise<{
        totalTemplates: number;
        migratedTemplates: number;
        pendingTemplates: string[];
        existingTemplates: string[];
    }> {
        const totalTemplates = SUBJECT_TEMPLATES.length;
        const existingTemplates: string[] = [];
        const pendingTemplates: string[] = [];

        for (const template of SUBJECT_TEMPLATES) {
            const existing = await this.repository.getTemplateById(template.id);
            if (existing) {
                existingTemplates.push(template.id);
            } else {
                pendingTemplates.push(template.id);
            }
        }

        return {
            totalTemplates,
            migratedTemplates: existingTemplates.length,
            pendingTemplates,
            existingTemplates
        };
    }

    /**
     * Rollback migration - remove all migrated templates
     */
    async rollbackMigration(): Promise<{
        success: boolean;
        removedCount: number;
        errors: string[];
    }> {
        const result: {
            success: boolean;
            removedCount: number;
            errors: string[];
        } = {
            success: true,
            removedCount: 0,
            errors: []
        };

        console.log('Starting migration rollback...');

        for (const template of SUBJECT_TEMPLATES) {
            try {
                const templateId = String(template.id);
                const existing = await this.repository.getTemplateById(templateId);
                if (existing) {
                    await this.repository.deleteTemplate(templateId);
                    result.removedCount++;
                    console.log(`✓ Removed template: ${template.name} (${templateId})`);
                }
            } catch (error) {
                result.success = false;
                const templateId = String(template.id);
                result.errors.push(`Failed to remove ${templateId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                console.error(`✗ Failed to remove template: ${template.name} (${templateId})`, error);
            }
        }

        console.log(`Rollback completed. Removed: ${result.removedCount}, Failed: ${result.errors.length}`);
        return result;
    }

    /**
     * Validate template variables against template content
     */
    private validateTemplateVariables(templateContent: string, variables: any[]): void {
        if (!variables || variables.length === 0) {
            return;
        }

        // Extract variables from template content
        const templateVariables = this.extractTemplateVariables(templateContent);
        const definedVariables = variables.map(v => v.name);

        // Check for undefined variables in template
        const undefinedVariables = templateVariables.filter(v => !definedVariables.includes(v));
        if (undefinedVariables.length > 0) {
            throw createAdminError(
                AdminErrorCode.VALIDATION_ERROR,
                `Template chứa biến chưa được định nghĩa: ${undefinedVariables.join(', ')}`
            );
        }

        // Check for unused variable definitions
        const unusedVariables = definedVariables.filter(v => !templateVariables.includes(v));
        if (unusedVariables.length > 0) {
            console.warn(`Template có biến được định nghĩa nhưng không sử dụng: ${unusedVariables.join(', ')}`);
        }
    }

    /**
     * Extract variables from template content
     */
    private extractTemplateVariables(templateContent: string): string[] {
        const variableRegex = /{{([^}]+)}}/g;
        const variables: string[] = [];
        let match;

        while ((match = variableRegex.exec(templateContent)) !== null) {
            const variableName = match[1].trim();
            if (!variables.includes(variableName)) {
                variables.push(variableName);
            }
        }

        return variables;
    }
}

// Export singleton instance
export const templatesMigration = new TemplatesMigration();

// CLI-friendly functions
export const migrateTemplates = async (overwriteExisting: boolean = false): Promise<MigrationResult> => {
    return await templatesMigration.migrateAllTemplates(overwriteExisting);
};

export const checkMigrationStatus = async () => {
    return await templatesMigration.checkMigrationStatus();
};

export const rollbackMigration = async () => {
    return await templatesMigration.rollbackMigration();
};