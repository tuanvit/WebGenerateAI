import { prisma } from './db';
import { DatabaseError } from '../types/services';

// Re-export prisma for convenience
export { prisma };

/**
 * Database utility functions for common operations
 */
export class DatabaseUtils {
    /**
     * Test database connection
     */
    static async testConnection(): Promise<boolean> {
        try {
            await prisma.$queryRaw`SELECT 1`;
            return true;
        } catch (error) {
            console.error('Database connection test failed:', error);
            return false;
        }
    }

    /**
     * Get database health status
     */
    static async getHealthStatus(): Promise<{
        connected: boolean;
        version?: string;
        uptime?: number;
    }> {
        try {
            const result = await prisma.$queryRaw<Array<{ version: string }>>`SELECT version()`;
            const version = result[0]?.version;

            return {
                connected: true,
                version,
            };
        } catch (error) {
            return {
                connected: false,
            };
        }
    }

    /**
     * Execute database transaction
     */
    static async executeTransaction<T>(
        operation: (tx: typeof prisma) => Promise<T>
    ): Promise<T> {
        try {
            return await prisma.$transaction(operation);
        } catch (error) {
            console.error('Transaction failed:', error);
            throw new DatabaseError('Giao dịch cơ sở dữ liệu thất bại');
        }
    }

    /**
     * Get database statistics
     */
    static async getDatabaseStats(): Promise<{
        users: number;
        generatedPrompts: number;
        sharedContent: number;
        contentRatings: number;
        userLibraries: number;
    }> {
        try {
            const [
                users,
                generatedPrompts,
                sharedContent,
                contentRatings,
                userLibraries,
            ] = await Promise.all([
                prisma.user.count(),
                prisma.generatedPrompt.count(),
                prisma.sharedContent.count(),
                prisma.contentRating.count(),
                prisma.userLibrary.count(),
            ]);

            return {
                users,
                generatedPrompts,
                sharedContent,
                contentRatings,
                userLibraries,
            };
        } catch (error) {
            console.error('Failed to get database stats:', error);
            throw new DatabaseError('Không thể lấy thống kê cơ sở dữ liệu');
        }
    }

    /**
     * Clean up old data (for maintenance)
     */
    static async cleanupOldData(daysOld: number = 365): Promise<{
        deletedPrompts: number;
        deletedRatings: number;
    }> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const [deletedPrompts, deletedRatings] = await prisma.$transaction([
                prisma.generatedPrompt.deleteMany({
                    where: {
                        createdAt: {
                            lt: cutoffDate,
                        },
                        isShared: false, // Only delete non-shared prompts
                    },
                }),
                prisma.contentRating.deleteMany({
                    where: {
                        content: {
                            createdAt: {
                                lt: cutoffDate,
                            },
                        },
                    },
                }),
            ]);

            return {
                deletedPrompts: deletedPrompts.count,
                deletedRatings: deletedRatings.count,
            };
        } catch (error) {
            console.error('Cleanup failed:', error);
            throw new DatabaseError('Dọn dẹp dữ liệu thất bại');
        }
    }

    /**
     * Backup essential data
     */
    static async backupData(): Promise<{
        users: any[];
        sharedContent: any[];
        contentRatings: any[];
    }> {
        try {
            const [users, sharedContent, contentRatings] = await Promise.all([
                prisma.user.findMany({
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        school: true,
                        subjects: true,
                        gradeLevel: true,
                        createdAt: true,
                    },
                }),
                prisma.sharedContent.findMany({
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                }),
                prisma.contentRating.findMany({
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        content: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                    },
                }),
            ]);

            return {
                users,
                sharedContent,
                contentRatings,
            };
        } catch (error) {
            console.error('Backup failed:', error);
            throw new DatabaseError('Sao lưu dữ liệu thất bại');
        }
    }
}