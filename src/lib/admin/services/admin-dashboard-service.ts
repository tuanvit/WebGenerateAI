/**
 * Admin Dashboard Service
 * Provides data and statistics for the admin dashboard
 */

import { prisma } from '@/lib/db';
import { AdminDashboardStats } from '../index';
import { AdminErrorCode, createAdminError } from '../admin-errors';
import { AIToolsRepository } from '../repositories/ai-tools-repository';
import templatesRepository from '../repositories/templates-repository';
import { getAuditLogStats } from '../admin-audit';

export class AdminDashboardService {
    private aiToolsRepo: AIToolsRepository;
    private templatesRepo: TemplatesRepository;

    constructor() {
        this.aiToolsRepo = new AIToolsRepository();
        this.templatesRepo = templatesRepository;
    }

    /**
     * Get comprehensive dashboard statistics
     */
    async getDashboardStats(): Promise<AdminDashboardStats> {
        try {
            const [
                aiToolsStats,
                templatesStats,
                userStats,
                auditStats,
                recentActivity
            ] = await Promise.all([
                this.aiToolsRepo.getAIToolsStats(),
                this.templatesRepo.getTemplatesStats(),
                this.getUserStats(),
                getAuditLogStats(30),
                this.getRecentActivity()
            ]);

            return {
                totalAITools: aiToolsStats.total,
                totalTemplates: templatesStats.total,
                totalUsers: userStats.totalUsers,
                totalAdmins: userStats.totalAdmins,
                recentActivity,
                aiToolsByCategory: aiToolsStats.byCategory,
                templatesBySubject: templatesStats.bySubject,
                userGrowth: await this.getUserGrowthData()
            };
        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            throw createAdminError(AdminErrorCode.DATABASE_ERROR, 'Không thể lấy thống kê dashboard');
        }
    }

    /**
     * Get user statistics
     */
    private async getUserStats(): Promise<{
        totalUsers: number;
        totalAdmins: number;
        newUsersThisMonth: number;
        activeUsersThisMonth: number;
    }> {
        try {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const [
                totalUsers,
                totalAdmins,
                newUsersThisMonth,
                activeUsersThisMonth
            ] = await Promise.all([
                prisma.user.count(),
                prisma.user.count({ where: { role: 'admin' } }),
                prisma.user.count({
                    where: {
                        createdAt: { gte: startOfMonth }
                    }
                }),
                prisma.user.count({
                    where: {
                        lastLoginAt: { gte: startOfMonth }
                    }
                })
            ]);

            return {
                totalUsers,
                totalAdmins,
                newUsersThisMonth,
                activeUsersThisMonth
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            throw createAdminError(AdminErrorCode.DATABASE_ERROR, 'Không thể lấy thống kê người dùng');
        }
    }

    /**
     * Get recent admin activity
     */
    private async getRecentActivity(): Promise<Array<{
        id: string;
        action: string;
        resource: string;
        userName: string;
        timestamp: Date;
    }>> {
        try {
            const recentLogs = await prisma.adminAuditLog.findMany({
                include: {
                    user: {
                        select: { name: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 10
            });

            return recentLogs.map(log => ({
                id: log.id,
                action: log.action,
                resource: log.resource,
                userName: log.user.name,
                timestamp: log.createdAt
            }));
        } catch (error) {
            console.error('Error getting recent activity:', error);
            throw createAdminError(AdminErrorCode.DATABASE_ERROR, 'Không thể lấy hoạt động gần đây');
        }
    }

    /**
     * Get user growth data for charts
     */
    private async getUserGrowthData(): Promise<Array<{
        date: string;
        count: number;
    }>> {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const users = await prisma.user.findMany({
                where: {
                    createdAt: { gte: thirtyDaysAgo }
                },
                select: { createdAt: true }
            });

            // Group by date
            const growthData = users.reduce((acc, user) => {
                const date = user.createdAt.toISOString().split('T')[0];
                acc[date] = (acc[date] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            // Convert to array and fill missing dates
            const result: Array<{ date: string; count: number }> = [];
            for (let i = 29; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                result.push({
                    date: dateStr,
                    count: growthData[dateStr] || 0
                });
            }

            return result;
        } catch (error) {
            console.error('Error getting user growth data:', error);
            throw createAdminError(AdminErrorCode.DATABASE_ERROR, 'Không thể lấy dữ liệu tăng trưởng người dùng');
        }
    }

    /**
     * Get system health status
     */
    async getSystemHealth(): Promise<{
        database: 'healthy' | 'warning' | 'error';
        storage: 'healthy' | 'warning' | 'error';
        performance: 'healthy' | 'warning' | 'error';
        lastBackup?: Date;
        uptime: number;
    }> {
        try {
            const startTime = Date.now();

            // Test database connection
            await prisma.$queryRaw`SELECT 1`;
            const dbResponseTime = Date.now() - startTime;

            // Get last backup info (if available)
            const lastBackupLog = await prisma.adminAuditLog.findFirst({
                where: { action: 'BACKUP_DATA' },
                orderBy: { createdAt: 'desc' }
            });

            return {
                database: dbResponseTime < 100 ? 'healthy' : dbResponseTime < 500 ? 'warning' : 'error',
                storage: 'healthy', // Placeholder - would check disk space in real implementation
                performance: dbResponseTime < 200 ? 'healthy' : 'warning',
                lastBackup: lastBackupLog?.createdAt,
                uptime: process.uptime()
            };
        } catch (error) {
            console.error('Error getting system health:', error);
            return {
                database: 'error',
                storage: 'error',
                performance: 'error',
                uptime: process.uptime()
            };
        }
    }

    /**
     * Get content statistics
     */
    async getContentStats(): Promise<{
        totalGeneratedPrompts: number;
        totalSharedContent: number;
        averageRating: number;
        topCategories: Array<{ category: string; count: number }>;
        topSubjects: Array<{ subject: string; count: number }>;
    }> {
        try {
            const [
                totalGeneratedPrompts,
                totalSharedContent,
                sharedContentWithRatings,
                aiToolsStats,
                templatesStats
            ] = await Promise.all([
                prisma.generatedPrompt.count(),
                prisma.sharedContent.count(),
                prisma.sharedContent.findMany({
                    where: { ratingCount: { gt: 0 } },
                    select: { rating: true, ratingCount: true }
                }),
                this.aiToolsRepo.getAIToolsStats(),
                this.templatesRepo.getTemplatesStats()
            ]);

            // Calculate average rating
            const totalRatingPoints = sharedContentWithRatings.reduce(
                (sum, content) => sum + (content.rating * content.ratingCount), 0
            );
            const totalRatings = sharedContentWithRatings.reduce(
                (sum, content) => sum + content.ratingCount, 0
            );
            const averageRating = totalRatings > 0 ? totalRatingPoints / totalRatings : 0;

            // Top categories from AI tools
            const topCategories = Object.entries(aiToolsStats.byCategory)
                .map(([category, count]) => ({ category, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            // Top subjects from templates
            const topSubjects = Object.entries(templatesStats.bySubject)
                .map(([subject, count]) => ({ subject, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            return {
                totalGeneratedPrompts,
                totalSharedContent,
                averageRating: Math.round(averageRating * 100) / 100,
                topCategories,
                topSubjects
            };
        } catch (error) {
            console.error('Error getting content stats:', error);
            throw createAdminError(AdminErrorCode.DATABASE_ERROR, 'Không thể lấy thống kê nội dung');
        }
    }
}