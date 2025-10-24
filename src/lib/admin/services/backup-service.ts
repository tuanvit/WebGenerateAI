/**
 * Backup and Restore Service
 * Handles data export, import, and automatic backup functionality
 */

import { AIToolsRepository, AIToolData } from '../repositories/ai-tools-repository';
import templatesRepository, { TemplateData } from '../repositories/templates-repository';
import { AdminUser } from '../admin-auth';
import { AdminErrorCode, createAdminError } from '../admin-errors';
import { logAdminAction, AdminAction, AdminResource } from '../admin-audit';
import { prisma } from '@/lib/db';
import { z } from 'zod';

export interface BackupMetadata {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    createdBy: string;
    size: number;
    type: 'manual' | 'automatic';
    status: 'creating' | 'completed' | 'failed';
    aiToolsCount: number;
    templatesCount: number;
    checksum: string;
}

export interface ExportOptions {
    format: 'json' | 'csv';
    includeAITools: boolean;
    includeTemplates: boolean;
    filters?: {
        aiToolFilters?: {
            categories?: string[];
            subjects?: string[];
            gradeLevels?: number[];
        };
        templateFilters?: {
            subjects?: string[];
            gradeLevels?: number[];
        };
    };
    compression?: boolean;
}

export interface ImportOptions {
    overwriteExisting: boolean;
    validateData: boolean;
    createBackupBeforeImport: boolean;
    dryRun?: boolean;
}

export interface ImportResult {
    success: boolean;
    aiToolsImported: number;
    templatesImported: number;
    aiToolsSkipped: number;
    templatesSkipped: number;
    errors: Array<{
        type: 'ai-tool' | 'template';
        id?: string;
        error: string;
        data?: any;
    }>;
    backupId?: string;
}

export interface BackupData {
    metadata: {
        version: string;
        exportDate: string;
        exportedBy: string;
        description?: string;
        checksum: string;
    };
    aiTools: AIToolData[];
    templates: TemplateData[];
}

// Validation schemas
const backupDataSchema = z.object({
    metadata: z.object({
        version: z.string(),
        exportDate: z.string(),
        exportedBy: z.string(),
        description: z.string().optional(),
        checksum: z.string()
    }),
    aiTools: z.array(z.any()),
    templates: z.array(z.any())
});

export class BackupService {
    private aiToolsRepository: AIToolsRepository;
    private templatesRepository = templatesRepository;

    constructor() {
        this.aiToolsRepository = new AIToolsRepository();
    }

    /**
     * Create a full system backup
     */
    async createBackup(
        user: AdminUser,
        name: string,
        description?: string,
        type: 'manual' | 'automatic' = 'manual'
    ): Promise<BackupMetadata> {
        try {
            // Create backup record
            const backup = await prisma.adminBackup.create({
                data: {
                    name,
                    description,
                    createdBy: user.id,
                    type,
                    status: 'creating',
                    aiToolsCount: 0,
                    templatesCount: 0,
                    size: 0,
                    checksum: ''
                }
            });

            try {
                // Export all data
                const exportOptions: ExportOptions = {
                    format: 'json',
                    includeAITools: true,
                    includeTemplates: true,
                    compression: true
                };

                const backupData = await this.exportData(user, exportOptions);

                // Calculate checksum
                const checksum = this.calculateChecksum(JSON.stringify(backupData));

                // Store backup data
                const backupJson = JSON.stringify(backupData, null, 2);
                const size = Buffer.byteLength(backupJson, 'utf8');

                // Update backup record
                const updatedBackup = await prisma.adminBackup.update({
                    where: { id: backup.id },
                    data: {
                        status: 'completed',
                        aiToolsCount: backupData.aiTools.length,
                        templatesCount: backupData.templates.length,
                        size,
                        checksum,
                        data: backupJson
                    }
                });

                // Log action
                await logAdminAction(
                    user,
                    AdminAction.BACKUP_DATA,
                    AdminResource.SYSTEM,
                    backup.id,
                    { name, type, size, aiToolsCount: backupData.aiTools.length, templatesCount: backupData.templates.length }
                );

                return {
                    id: updatedBackup.id,
                    name: updatedBackup.name,
                    description: updatedBackup.description || undefined,
                    createdAt: updatedBackup.createdAt,
                    createdBy: updatedBackup.createdBy,
                    size: updatedBackup.size,
                    type: updatedBackup.type as 'manual' | 'automatic',
                    status: updatedBackup.status as 'creating' | 'completed' | 'failed',
                    aiToolsCount: updatedBackup.aiToolsCount,
                    templatesCount: updatedBackup.templatesCount,
                    checksum: updatedBackup.checksum
                };
            } catch (error) {
                // Mark backup as failed
                await prisma.adminBackup.update({
                    where: { id: backup.id },
                    data: { status: 'failed' }
                });
                throw error;
            }
        } catch (error) {
            console.error('Error creating backup:', error);
            throw createAdminError(AdminErrorCode.BACKUP_FAILED, 'Không thể tạo backup');
        }
    }

    /**
     * Export data with filtering options
     */
    async exportData(user: AdminUser, options: ExportOptions): Promise<BackupData> {
        try {
            let aiTools: AIToolData[] = [];
            let templates: TemplateData[] = [];

            // Export AI Tools
            if (options.includeAITools) {
                const filters = options.filters?.aiToolFilters;
                const result = await this.aiToolsRepository.getAITools({
                    category: filters?.categories?.[0],
                    subject: filters?.subjects?.[0],
                    gradeLevel: filters?.gradeLevels?.[0],
                    limit: 10000 // Get all
                });
                aiTools = result.data;
            }

            // Export Templates
            if (options.includeTemplates) {
                const filters = options.filters?.templateFilters;
                const result = await this.templatesRepository.getTemplates({
                    subject: filters?.subjects?.[0],
                    gradeLevel: filters?.gradeLevels?.[0],
                    limit: 10000 // Get all
                });
                templates = result.data;
            }

            // Create backup data structure
            const backupData: BackupData = {
                metadata: {
                    version: '1.0',
                    exportDate: new Date().toISOString(),
                    exportedBy: user.id,
                    description: `Export created by ${user.name}`,
                    checksum: ''
                },
                aiTools,
                templates
            };

            // Calculate checksum
            backupData.metadata.checksum = this.calculateChecksum(JSON.stringify({
                aiTools: backupData.aiTools,
                templates: backupData.templates
            }));

            // Log export action
            await logAdminAction(
                user,
                AdminAction.EXPORT_AI_TOOLS,
                AdminResource.SYSTEM,
                undefined,
                {
                    format: options.format,
                    aiToolsCount: aiTools.length,
                    templatesCount: templates.length,
                    filters: options.filters
                }
            );

            return backupData;
        } catch (error) {
            console.error('Error exporting data:', error);
            throw createAdminError(AdminErrorCode.EXPORT_FAILED, 'Không thể xuất dữ liệu');
        }
    }

    /**
     * Import data from backup
     */
    async importData(
        user: AdminUser,
        backupData: BackupData,
        options: ImportOptions
    ): Promise<ImportResult> {
        try {
            // Validate backup data
            if (options.validateData) {
                this.validateBackupData(backupData);
            }

            let backupId: string | undefined;

            // Create backup before import if requested
            if (options.createBackupBeforeImport) {
                const backup = await this.createBackup(
                    user,
                    `Pre-import backup ${new Date().toISOString()}`,
                    'Automatic backup created before data import',
                    'automatic'
                );
                backupId = backup.id;
            }

            const result: ImportResult = {
                success: true,
                aiToolsImported: 0,
                templatesImported: 0,
                aiToolsSkipped: 0,
                templatesSkipped: 0,
                errors: [],
                backupId
            };

            // Import AI Tools
            if (backupData.aiTools.length > 0) {
                const aiToolResult = await this.importAITools(
                    user,
                    backupData.aiTools,
                    options
                );
                result.aiToolsImported = aiToolResult.imported;
                result.aiToolsSkipped = aiToolResult.skipped;
                result.errors.push(...aiToolResult.errors);
            }

            // Import Templates
            if (backupData.templates.length > 0) {
                const templateResult = await this.importTemplates(
                    user,
                    backupData.templates,
                    options
                );
                result.templatesImported = templateResult.imported;
                result.templatesSkipped = templateResult.skipped;
                result.errors.push(...templateResult.errors);
            }

            // Log import action
            await logAdminAction(
                user,
                AdminAction.RESTORE_DATA,
                AdminResource.SYSTEM,
                backupId,
                {
                    aiToolsImported: result.aiToolsImported,
                    templatesImported: result.templatesImported,
                    aiToolsSkipped: result.aiToolsSkipped,
                    templatesSkipped: result.templatesSkipped,
                    errorCount: result.errors.length,
                    options
                }
            );

            return result;
        } catch (error) {
            console.error('Error importing data:', error);
            throw createAdminError(AdminErrorCode.IMPORT_FAILED, 'Không thể nhập dữ liệu');
        }
    }

    /**
     * Get list of available backups
     */
    async getBackups(limit: number = 50, offset: number = 0): Promise<{
        backups: BackupMetadata[];
        total: number;
    }> {
        try {
            const [backups, total] = await Promise.all([
                prisma.adminBackup.findMany({
                    orderBy: { createdAt: 'desc' },
                    take: limit,
                    skip: offset,
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        createdAt: true,
                        createdBy: true,
                        size: true,
                        type: true,
                        status: true,
                        aiToolsCount: true,
                        templatesCount: true,
                        checksum: true
                    }
                }),
                prisma.adminBackup.count()
            ]);

            return {
                backups: backups.map(backup => ({
                    id: backup.id,
                    name: backup.name,
                    description: backup.description || undefined,
                    createdAt: backup.createdAt,
                    createdBy: backup.createdBy,
                    size: backup.size,
                    type: backup.type as 'manual' | 'automatic',
                    status: backup.status as 'creating' | 'completed' | 'failed',
                    aiToolsCount: backup.aiToolsCount,
                    templatesCount: backup.templatesCount,
                    checksum: backup.checksum
                })),
                total
            };
        } catch (error) {
            console.error('Error getting backups:', error);
            throw createAdminError(AdminErrorCode.DATABASE_ERROR, 'Không thể lấy danh sách backup');
        }
    }

    /**
     * Get backup data by ID
     */
    async getBackupData(backupId: string): Promise<BackupData> {
        try {
            const backup = await prisma.adminBackup.findUnique({
                where: { id: backupId },
                select: { data: true, status: true }
            });

            if (!backup) {
                throw createAdminError(AdminErrorCode.NOT_FOUND, 'Không tìm thấy backup');
            }

            if (backup.status !== 'completed') {
                throw createAdminError(AdminErrorCode.BACKUP_INCOMPLETE, 'Backup chưa hoàn thành');
            }

            if (!backup.data) {
                throw createAdminError(AdminErrorCode.BACKUP_CORRUPTED, 'Dữ liệu backup bị lỗi');
            }

            return JSON.parse(backup.data);
        } catch (error) {
            console.error('Error getting backup data:', error);
            if (error instanceof Error && 'code' in error) {
                throw error;
            }
            throw createAdminError(AdminErrorCode.DATABASE_ERROR, 'Không thể lấy dữ liệu backup');
        }
    }

    /**
     * Delete backup
     */
    async deleteBackup(user: AdminUser, backupId: string): Promise<void> {
        try {
            const backup = await prisma.adminBackup.findUnique({
                where: { id: backupId }
            });

            if (!backup) {
                throw createAdminError(AdminErrorCode.NOT_FOUND, 'Không tìm thấy backup');
            }

            await prisma.adminBackup.delete({
                where: { id: backupId }
            });

            // Log action
            await logAdminAction(
                user,
                AdminAction.BACKUP_DATA,
                AdminResource.SYSTEM,
                backupId,
                { action: 'delete', name: backup.name }
            );
        } catch (error) {
            console.error('Error deleting backup:', error);
            if (error instanceof Error && 'code' in error) {
                throw error;
            }
            throw createAdminError(AdminErrorCode.DATABASE_ERROR, 'Không thể xóa backup');
        }
    }

    /**
     * Verify backup integrity
     */
    async verifyBackup(backupId: string): Promise<{
        valid: boolean;
        checksumMatch: boolean;
        dataIntegrity: boolean;
        errors: string[];
    }> {
        try {
            const backup = await prisma.adminBackup.findUnique({
                where: { id: backupId }
            });

            if (!backup) {
                return {
                    valid: false,
                    checksumMatch: false,
                    dataIntegrity: false,
                    errors: ['Backup không tồn tại']
                };
            }

            const errors: string[] = [];
            let checksumMatch = false;
            let dataIntegrity = false;

            if (backup.data) {
                try {
                    const backupData = JSON.parse(backup.data);

                    // Verify checksum
                    const calculatedChecksum = this.calculateChecksum(JSON.stringify({
                        aiTools: backupData.aiTools,
                        templates: backupData.templates
                    }));

                    checksumMatch = calculatedChecksum === backup.checksum;
                    if (!checksumMatch) {
                        errors.push('Checksum không khớp');
                    }

                    // Verify data structure
                    const validation = backupDataSchema.safeParse(backupData);
                    dataIntegrity = validation.success;
                    if (!dataIntegrity) {
                        errors.push('Cấu trúc dữ liệu không hợp lệ');
                    }
                } catch (parseError) {
                    errors.push('Không thể parse dữ liệu backup');
                }
            } else {
                errors.push('Không có dữ liệu backup');
            }

            return {
                valid: errors.length === 0,
                checksumMatch,
                dataIntegrity,
                errors
            };
        } catch (error) {
            console.error('Error verifying backup:', error);
            return {
                valid: false,
                checksumMatch: false,
                dataIntegrity: false,
                errors: ['Lỗi khi kiểm tra backup']
            };
        }
    }

    /**
     * Clean up old backups based on retention policy
     */
    async cleanupOldBackups(retentionDays: number = 30): Promise<number> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

            const result = await prisma.adminBackup.deleteMany({
                where: {
                    createdAt: {
                        lt: cutoffDate
                    },
                    type: 'automatic' // Only delete automatic backups
                }
            });

            return result.count;
        } catch (error) {
            console.error('Error cleaning up old backups:', error);
            throw createAdminError(AdminErrorCode.DATABASE_ERROR, 'Không thể dọn dẹp backup cũ');
        }
    }

    // Private helper methods

    private validateBackupData(backupData: BackupData): void {
        const validation = backupDataSchema.safeParse(backupData);
        if (!validation.success) {
            throw createAdminError(
                AdminErrorCode.INVALID_BACKUP_DATA,
                'Dữ liệu backup không hợp lệ: ' + validation.error.message
            );
        }

        // Verify checksum
        const calculatedChecksum = this.calculateChecksum(JSON.stringify({
            aiTools: backupData.aiTools,
            templates: backupData.templates
        }));

        if (calculatedChecksum !== backupData.metadata.checksum) {
            throw createAdminError(
                AdminErrorCode.BACKUP_CORRUPTED,
                'Checksum không khớp - dữ liệu có thể bị hỏng'
            );
        }
    }

    private calculateChecksum(data: string): string {
        // Simple checksum calculation - in production, use a proper hash function
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }

    private async importAITools(
        user: AdminUser,
        aiTools: AIToolData[],
        options: ImportOptions
    ): Promise<{
        imported: number;
        skipped: number;
        errors: Array<{ type: 'ai-tool'; id?: string; error: string; data?: any }>;
    }> {
        let imported = 0;
        let skipped = 0;
        const errors: Array<{ type: 'ai-tool'; id?: string; error: string; data?: any }> = [];

        for (const toolData of aiTools) {
            try {
                if (options.dryRun) {
                    // Just validate, don't actually import
                    imported++;
                    continue;
                }

                if (!toolData.id) {
                    errors.push({
                        type: 'ai-tool',
                        error: 'Missing ID',
                        data: toolData
                    });
                    continue;
                }

                // Check if tool already exists
                const existing = await this.aiToolsRepository.getAIToolById(toolData.id);

                if (existing && !options.overwriteExisting) {
                    skipped++;
                    continue;
                }

                if (existing) {
                    // Update existing
                    await this.aiToolsRepository.updateAITool(toolData.id, toolData);
                } else {
                    // Create new
                    await this.aiToolsRepository.createAITool(toolData);
                }

                imported++;
            } catch (error) {
                errors.push({
                    type: 'ai-tool',
                    id: toolData.id,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    data: toolData
                });
            }
        }

        return { imported, skipped, errors };
    }

    private async importTemplates(
        user: AdminUser,
        templates: TemplateData[],
        options: ImportOptions
    ): Promise<{
        imported: number;
        skipped: number;
        errors: Array<{ type: 'template'; id?: string; error: string; data?: any }>;
    }> {
        let imported = 0;
        let skipped = 0;
        const errors: Array<{ type: 'template'; id?: string; error: string; data?: any }> = [];

        for (const templateData of templates) {
            try {
                if (options.dryRun) {
                    // Just validate, don't actually import
                    imported++;
                    continue;
                }

                if (!templateData.id) {
                    errors.push({
                        type: 'template',
                        error: 'Missing ID',
                        data: templateData
                    });
                    continue;
                }

                // Check if template already exists
                const existing = await this.templatesRepository.getTemplateById(templateData.id);

                if (existing && !options.overwriteExisting) {
                    skipped++;
                    continue;
                }

                if (existing) {
                    // Update existing
                    await this.templatesRepository.updateTemplate(templateData.id, templateData);
                } else {
                    // Create new
                    await this.templatesRepository.createTemplate(templateData);
                }

                imported++;
            } catch (error) {
                errors.push({
                    type: 'template',
                    id: templateData.id,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    data: templateData
                });
            }
        }

        return { imported, skipped, errors };
    }
}