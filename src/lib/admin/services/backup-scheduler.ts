/**
 * Automatic Backup Scheduler Service
 * Handles scheduled backups with configurable retention
 */

import { BackupService } from './backup-service';
import { AdminUser } from '../admin-auth';
import { AdminErrorCode, createAdminError } from '../admin-errors';
import { logAdminAction, AdminAction, AdminResource } from '../admin-audit';
import { prisma } from '@/lib/db';

export interface BackupScheduleConfig {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // HH:MM format
    retentionDays: number;
    maxBackups: number;
    includeAITools: boolean;
    includeTemplates: boolean;
}

export interface ScheduledBackupResult {
    success: boolean;
    backupId?: string;
    error?: string;
    cleanedUpCount?: number;
}

export class BackupScheduler {
    private backupService: BackupService;
    private isRunning: boolean = false;
    private intervalId: NodeJS.Timeout | null = null;

    constructor() {
        this.backupService = new BackupService();
    }

    /**
     * Start the backup scheduler
     */
    async start(config: BackupScheduleConfig): Promise<void> {
        if (this.isRunning) {
            throw createAdminError(
                AdminErrorCode.BACKUP_FAILED,
                'Backup scheduler đã đang chạy'
            );
        }

        if (!config.enabled) {
            console.log('Backup scheduler is disabled');
            return;
        }

        this.isRunning = true;

        // Calculate interval based on frequency
        const intervalMs = this.getIntervalMs(config.frequency);

        // Schedule the backup
        this.intervalId = setInterval(async () => {
            await this.executeScheduledBackup(config);
        }, intervalMs);

        // Also check if we should run a backup now
        const shouldRunNow = await this.shouldRunBackupNow(config);
        if (shouldRunNow) {
            // Run backup in background
            setTimeout(() => this.executeScheduledBackup(config), 1000);
        }

        console.log(`Backup scheduler started with ${config.frequency} frequency`);
    }

    /**
     * Stop the backup scheduler
     */
    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        console.log('Backup scheduler stopped');
    }

    /**
     * Execute a scheduled backup
     */
    async executeScheduledBackup(config: BackupScheduleConfig): Promise<ScheduledBackupResult> {
        try {
            console.log('Executing scheduled backup...');

            // Create system user for automatic backups
            const systemUser: AdminUser = {
                id: 'system',
                email: 'system@admin.local',
                name: 'System Scheduler',
                role: 'admin'
            };

            // Generate backup name
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupName = `Auto Backup ${timestamp}`;
            const description = `Automatic backup created by scheduler (${config.frequency})`;

            // Create backup
            const backup = await this.backupService.createBackup(
                systemUser,
                backupName,
                description,
                'automatic'
            );

            console.log(`Scheduled backup created: ${backup.id}`);

            // Clean up old backups
            const cleanedUpCount = await this.cleanupOldBackups(config);

            // Log the scheduled backup
            await logAdminAction(
                systemUser,
                AdminAction.BACKUP_DATA,
                AdminResource.SYSTEM,
                backup.id,
                {
                    type: 'scheduled',
                    frequency: config.frequency,
                    cleanedUpCount
                }
            );

            return {
                success: true,
                backupId: backup.id,
                cleanedUpCount
            };
        } catch (error) {
            console.error('Scheduled backup failed:', error);

            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            return {
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * Clean up old automatic backups based on retention policy
     */
    async cleanupOldBackups(config: BackupScheduleConfig): Promise<number> {
        try {
            // Clean up by retention days
            const retentionCleanup = await this.backupService.cleanupOldBackups(config.retentionDays);

            // Clean up by max backup count (keep only the most recent ones)
            const excessBackups = await prisma.adminBackup.findMany({
                where: {
                    type: 'automatic',
                    status: 'completed'
                },
                orderBy: { createdAt: 'desc' },
                skip: config.maxBackups,
                select: { id: true }
            });

            let countCleanup = 0;
            if (excessBackups.length > 0) {
                const deleteResult = await prisma.adminBackup.deleteMany({
                    where: {
                        id: {
                            in: excessBackups.map(b => b.id)
                        }
                    }
                });
                countCleanup = deleteResult.count;
            }

            const totalCleaned = retentionCleanup + countCleanup;

            if (totalCleaned > 0) {
                console.log(`Cleaned up ${totalCleaned} old automatic backups`);
            }

            return totalCleaned;
        } catch (error) {
            console.error('Error cleaning up old backups:', error);
            return 0;
        }
    }

    /**
     * Get backup schedule configuration
     */
    async getScheduleConfig(): Promise<BackupScheduleConfig> {
        try {
            const config = await prisma.adminSetting.findUnique({
                where: { key: 'backup_schedule' }
            });

            if (config && config.value) {
                return JSON.parse(config.value);
            }

            // Default configuration
            return {
                enabled: false,
                frequency: 'daily',
                time: '02:00',
                retentionDays: 30,
                maxBackups: 10,
                includeAITools: true,
                includeTemplates: true
            };
        } catch (error) {
            console.error('Error getting schedule config:', error);
            // Return default config on error
            return {
                enabled: false,
                frequency: 'daily',
                time: '02:00',
                retentionDays: 30,
                maxBackups: 10,
                includeAITools: true,
                includeTemplates: true
            };
        }
    }

    /**
     * Update backup schedule configuration
     */
    async updateScheduleConfig(
        user: AdminUser,
        config: BackupScheduleConfig
    ): Promise<void> {
        try {
            await prisma.adminSetting.upsert({
                where: { key: 'backup_schedule' },
                update: {
                    value: JSON.stringify(config),
                    updatedAt: new Date()
                },
                create: {
                    key: 'backup_schedule',
                    value: JSON.stringify(config)
                }
            });

            // Log configuration change
            await logAdminAction(
                user,
                AdminAction.BACKUP_DATA,
                AdminResource.SYSTEM,
                undefined,
                { action: 'update_schedule', config }
            );

            // Restart scheduler with new config
            if (this.isRunning) {
                this.stop();
                if (config.enabled) {
                    await this.start(config);
                }
            }
        } catch (error) {
            console.error('Error updating schedule config:', error);
            throw createAdminError(
                AdminErrorCode.DATABASE_ERROR,
                'Không thể cập nhật cấu hình backup'
            );
        }
    }

    /**
     * Get backup statistics
     */
    async getBackupStats(): Promise<{
        totalBackups: number;
        automaticBackups: number;
        manualBackups: number;
        totalSize: number;
        lastBackupDate?: Date;
        nextScheduledBackup?: Date;
    }> {
        try {
            const [totalBackups, automaticBackups, manualBackups, sizeResult, lastBackup] = await Promise.all([
                prisma.adminBackup.count(),
                prisma.adminBackup.count({ where: { type: 'automatic' } }),
                prisma.adminBackup.count({ where: { type: 'manual' } }),
                prisma.adminBackup.aggregate({
                    _sum: { size: true }
                }),
                prisma.adminBackup.findFirst({
                    orderBy: { createdAt: 'desc' },
                    select: { createdAt: true }
                })
            ]);

            const config = await this.getScheduleConfig();
            const nextScheduledBackup = this.calculateNextBackupTime(config);

            return {
                totalBackups,
                automaticBackups,
                manualBackups,
                totalSize: sizeResult._sum.size || 0,
                lastBackupDate: lastBackup?.createdAt,
                nextScheduledBackup
            };
        } catch (error) {
            console.error('Error getting backup stats:', error);
            throw createAdminError(
                AdminErrorCode.DATABASE_ERROR,
                'Không thể lấy thống kê backup'
            );
        }
    }

    /**
     * Force run a backup now (for testing or manual trigger)
     */
    async runBackupNow(user: AdminUser): Promise<ScheduledBackupResult> {
        const config = await this.getScheduleConfig();

        // Temporarily modify config to ensure backup runs
        const tempConfig = { ...config, enabled: true };

        return await this.executeScheduledBackup(tempConfig);
    }

    // Private helper methods

    private getIntervalMs(frequency: 'daily' | 'weekly' | 'monthly'): number {
        switch (frequency) {
            case 'daily':
                return 24 * 60 * 60 * 1000; // 24 hours
            case 'weekly':
                return 7 * 24 * 60 * 60 * 1000; // 7 days
            case 'monthly':
                return 30 * 24 * 60 * 60 * 1000; // 30 days
            default:
                return 24 * 60 * 60 * 1000; // Default to daily
        }
    }

    private async shouldRunBackupNow(config: BackupScheduleConfig): Promise<boolean> {
        try {
            const lastBackup = await prisma.adminBackup.findFirst({
                where: { type: 'automatic' },
                orderBy: { createdAt: 'desc' },
                select: { createdAt: true }
            });

            if (!lastBackup) {
                return true; // No backup exists, should run now
            }

            const now = new Date();
            const lastBackupTime = new Date(lastBackup.createdAt);
            const intervalMs = this.getIntervalMs(config.frequency);

            return (now.getTime() - lastBackupTime.getTime()) >= intervalMs;
        } catch (error) {
            console.error('Error checking if backup should run now:', error);
            return false;
        }
    }

    private calculateNextBackupTime(config: BackupScheduleConfig): Date | undefined {
        if (!config.enabled) {
            return undefined;
        }

        const now = new Date();
        const [hours, minutes] = config.time.split(':').map(Number);

        const nextBackup = new Date();
        nextBackup.setHours(hours, minutes, 0, 0);

        // If the time has already passed today, schedule for tomorrow/next period
        if (nextBackup <= now) {
            switch (config.frequency) {
                case 'daily':
                    nextBackup.setDate(nextBackup.getDate() + 1);
                    break;
                case 'weekly':
                    nextBackup.setDate(nextBackup.getDate() + 7);
                    break;
                case 'monthly':
                    nextBackup.setMonth(nextBackup.getMonth() + 1);
                    break;
            }
        }

        return nextBackup;
    }
}

// Singleton instance for the scheduler
let schedulerInstance: BackupScheduler | null = null;

export const getBackupScheduler = (): BackupScheduler => {
    if (!schedulerInstance) {
        schedulerInstance = new BackupScheduler();
    }
    return schedulerInstance;
};

// Initialize scheduler on module load (for server environments)
export const initializeBackupScheduler = async (): Promise<void> => {
    try {
        const scheduler = getBackupScheduler();
        const config = await scheduler.getScheduleConfig();

        if (config.enabled) {
            await scheduler.start(config);
            console.log('Backup scheduler initialized and started');
        } else {
            console.log('Backup scheduler initialized but disabled');
        }
    } catch (error) {
        console.error('Failed to initialize backup scheduler:', error);
    }
};