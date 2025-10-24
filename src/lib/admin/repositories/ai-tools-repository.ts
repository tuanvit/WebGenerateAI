/**
 * AI Tools Repository
 * Handles all database operations for AI tools
 */

import { prisma } from '@/lib/db';
import { AdminFilters, AdminPaginatedResponse, createPaginatedResponse } from '../index';
import { AdminErrorCode, createAdminError } from '../admin-errors';
import { adminConfig } from '../admin-config';
import {
    OptimizedAIToolsQueries,
    validatePagination,
    PerformanceMonitor,
    QueryBuilder
} from '../database-optimization';

export interface AIToolData {
    id: string;
    name: string;
    description: string;
    url: string;
    category: string;
    subjects: string[];
    gradeLevel: number[];
    vietnameseSupport: boolean;
    difficulty: string;
    pricingModel: string;
    features: string[];
    useCase: string;
    integrationGuide: string;
    samplePrompts: string[];
    relatedTools: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface AIToolFilters extends AdminFilters {
    category?: string;
    subject?: string;
    gradeLevel?: number[];
    difficulty?: string;
    pricingModel?: string;
    vietnameseSupport?: boolean;
}

export class AIToolsRepository {
    /**
     * Get all AI tools with filtering and pagination (optimized)
     */
    async getAITools(filters: AIToolFilters = {}): Promise<AdminPaginatedResponse<AIToolData>> {
        return PerformanceMonitor.trackQuery('getAITools', async () => {
            try {
                // Validate and normalize pagination parameters
                const paginationOptions = validatePagination({
                    page: filters.page || 1,
                    limit: filters.limit || adminConfig.defaultPageSize,
                    sortBy: filters.sortBy || 'updatedAt',
                    sortOrder: filters.sortOrder || 'desc'
                });

                // Use optimized query
                const result = await OptimizedAIToolsQueries.getAIToolsOptimized({
                    search: filters.search,
                    category: filters.category,
                    subject: filters.subject,
                    gradeLevel: filters.gradeLevel,
                    difficulty: filters.difficulty,
                    pricingModel: filters.pricingModel,
                    vietnameseSupport: filters.vietnameseSupport,
                    ...paginationOptions
                });

                // Transform data to match expected format
                const transformedData = result.data.map(tool => ({
                    id: tool.id,
                    name: tool.name,
                    description: tool.description,
                    url: tool.url,
                    category: tool.category,
                    subjects: JSON.parse(tool.subjects || '[]'),
                    gradeLevel: JSON.parse(tool.gradeLevel || '[]'),
                    vietnameseSupport: tool.vietnameseSupport,
                    difficulty: tool.difficulty,
                    pricingModel: tool.pricingModel,
                    features: JSON.parse(tool.features || '[]'),
                    useCase: tool.useCase,
                    integrationGuide: tool.integrationGuide,
                    samplePrompts: JSON.parse(tool.samplePrompts || '[]'),
                    relatedTools: JSON.parse(tool.relatedTools || '[]'),
                    createdAt: tool.createdAt,
                    updatedAt: tool.updatedAt
                }));

                return {
                    data: transformedData,
                    pagination: result.pagination
                };
            } catch (error) {
                console.error('Error in AIToolsRepository.getAITools:', error);
                throw createAdminError(AdminErrorCode.DATABASE_ERROR, 'Không thể lấy danh sách AI tools');
            }
        });
    }

    /**
     * Get AI tool by ID
     */
    async getAIToolById(id: string): Promise<AIToolData | null> {
        try {
            const tool = await prisma.aITool.findUnique({
                where: { id }
            });

            return tool ? this.transformAITool(tool) : null;
        } catch (error) {
            console.error('Error getting AI tool by ID:', error);
            throw createAdminError(AdminErrorCode.DATABASE_ERROR, 'Không thể lấy thông tin AI tool');
        }
    }

    /**
     * Create new AI tool
     */
    async createAITool(data: Omit<AIToolData, 'id' | 'createdAt' | 'updatedAt'>): Promise<AIToolData> {
        try {
            // Check for existing tool with same name
            const existing = await prisma.aITool.findFirst({
                where: { name: data.name }
            });

            if (existing) {
                throw createAdminError(AdminErrorCode.DUPLICATE_ENTRY, 'AI tool với tên này đã tồn tại');
            }

            const tool = await prisma.aITool.create({
                data: {
                    name: data.name,
                    description: data.description,
                    url: data.url,
                    category: data.category,
                    subjects: JSON.stringify(data.subjects),
                    gradeLevel: JSON.stringify(data.gradeLevel),
                    vietnameseSupport: data.vietnameseSupport,
                    difficulty: data.difficulty,
                    pricingModel: data.pricingModel,
                    features: JSON.stringify(data.features),
                    useCase: data.useCase,
                    integrationGuide: data.integrationGuide,
                    samplePrompts: JSON.stringify(data.samplePrompts || []),
                    relatedTools: JSON.stringify(data.relatedTools || [])
                }
            });

            return this.transformAITool(tool);
        } catch (error) {
            console.error('Error creating AI tool:', error);
            throw createAdminError(AdminErrorCode.DATABASE_ERROR, 'Không thể tạo AI tool mới');
        }
    }

    /**
     * Update AI tool
     */
    async updateAITool(id: string, data: Partial<AIToolData>): Promise<AIToolData> {
        try {
            const existing = await prisma.aITool.findUnique({
                where: { id }
            });

            if (!existing) {
                throw createAdminError(AdminErrorCode.NOT_FOUND, 'Không tìm thấy AI tool');
            }

            // Check for name conflicts if name is being updated
            if (data.name && data.name !== existing.name) {
                const nameConflict = await prisma.aITool.findFirst({
                    where: {
                        name: data.name,
                        id: { not: id }
                    }
                });

                if (nameConflict) {
                    throw createAdminError(AdminErrorCode.DUPLICATE_ENTRY, 'AI tool với tên này đã tồn tại');
                }
            }

            const updateData: any = {};
            if (data.name) updateData.name = data.name;
            if (data.description) updateData.description = data.description;
            if (data.url) updateData.url = data.url;
            if (data.category) updateData.category = data.category;
            if (data.subjects) updateData.subjects = JSON.stringify(data.subjects);
            if (data.gradeLevel) updateData.gradeLevel = JSON.stringify(data.gradeLevel);
            if (data.vietnameseSupport !== undefined) updateData.vietnameseSupport = data.vietnameseSupport;
            if (data.difficulty) updateData.difficulty = data.difficulty;
            if (data.pricingModel) updateData.pricingModel = data.pricingModel;
            if (data.features) updateData.features = JSON.stringify(data.features);
            if (data.useCase) updateData.useCase = data.useCase;
            if (data.integrationGuide) updateData.integrationGuide = data.integrationGuide;
            if (data.samplePrompts) updateData.samplePrompts = JSON.stringify(data.samplePrompts);
            if (data.relatedTools) updateData.relatedTools = JSON.stringify(data.relatedTools);

            const tool = await prisma.aITool.update({
                where: { id },
                data: updateData
            });

            return this.transformAITool(tool);
        } catch (error) {
            console.error('Error updating AI tool:', error);
            throw createAdminError(AdminErrorCode.DATABASE_ERROR, 'Không thể cập nhật AI tool');
        }
    }

    /**
     * Delete AI tool
     */
    async deleteAITool(id: string): Promise<void> {
        try {
            const existing = await prisma.aITool.findUnique({
                where: { id }
            });

            if (!existing) {
                throw createAdminError(AdminErrorCode.NOT_FOUND, 'Không tìm thấy AI tool');
            }

            await prisma.aITool.delete({
                where: { id }
            });
        } catch (error) {
            console.error('Error deleting AI tool:', error);
            throw createAdminError(AdminErrorCode.DATABASE_ERROR, 'Không thể xóa AI tool');
        }
    }

    /**
     * Bulk update AI tools
     */
    async bulkUpdateAITools(ids: string[], updates: Partial<AIToolData>): Promise<number> {
        try {
            if (ids.length === 0) {
                return 0;
            }

            const updateData: any = {};
            if (updates.category) updateData.category = updates.category;
            if (updates.difficulty) updateData.difficulty = updates.difficulty;
            if (updates.pricingModel) updateData.pricingModel = updates.pricingModel;
            if (updates.vietnameseSupport !== undefined) updateData.vietnameseSupport = updates.vietnameseSupport;
            if (updates.subjects) updateData.subjects = JSON.stringify(updates.subjects);
            if (updates.gradeLevel) updateData.gradeLevel = JSON.stringify(updates.gradeLevel);

            const result = await prisma.aITool.updateMany({
                where: { id: { in: ids } },
                data: updateData
            });

            return result.count;
        } catch (error) {
            console.error('Error bulk updating AI tools:', error);
            throw createAdminError(AdminErrorCode.DATABASE_ERROR, 'Không thể cập nhật hàng loạt AI tools');
        }
    }

    /**
     * Bulk delete AI tools
     */
    async bulkDeleteAITools(ids: string[]): Promise<number> {
        try {
            if (ids.length === 0) {
                return 0;
            }

            const result = await prisma.aITool.deleteMany({
                where: { id: { in: ids } }
            });

            return result.count;
        } catch (error) {
            console.error('Error bulk deleting AI tools:', error);
            throw createAdminError(AdminErrorCode.DATABASE_ERROR, 'Không thể xóa hàng loạt AI tools');
        }
    }

    /**
     * Get AI tools statistics
     */
    async getAIToolsStats(): Promise<{
        total: number;
        byCategory: Record<string, number>;
        byDifficulty: Record<string, number>;
        byPricingModel: Record<string, number>;
        vietnameseSupportCount: number;
    }> {
        try {
            const [total, byCategory, byDifficulty, byPricingModel, vietnameseSupportCount] = await Promise.all([
                prisma.aITool.count(),
                prisma.aITool.groupBy({
                    by: ['category'],
                    _count: { category: true }
                }),
                prisma.aITool.groupBy({
                    by: ['difficulty'],
                    _count: { difficulty: true }
                }),
                prisma.aITool.groupBy({
                    by: ['pricingModel'],
                    _count: { pricingModel: true }
                }),
                prisma.aITool.count({
                    where: { vietnameseSupport: true }
                })
            ]);

            return {
                total,
                byCategory: byCategory.reduce((acc, item) => {
                    acc[item.category] = item._count.category;
                    return acc;
                }, {} as Record<string, number>),
                byDifficulty: byDifficulty.reduce((acc, item) => {
                    acc[item.difficulty] = item._count.difficulty;
                    return acc;
                }, {} as Record<string, number>),
                byPricingModel: byPricingModel.reduce((acc, item) => {
                    acc[item.pricingModel] = item._count.pricingModel;
                    return acc;
                }, {} as Record<string, number>),
                vietnameseSupportCount
            };
        } catch (error) {
            console.error('Error getting AI tools stats:', error);
            throw createAdminError(AdminErrorCode.DATABASE_ERROR, 'Không thể lấy thống kê AI tools');
        }
    }

    /**
     * Transform database record to AIToolData
     */
    private transformAITool(tool: any): AIToolData {
        return {
            id: tool.id,
            name: tool.name,
            description: tool.description,
            url: tool.url,
            category: tool.category,
            subjects: JSON.parse(tool.subjects || '[]'),
            gradeLevel: JSON.parse(tool.gradeLevel || '[]'),
            vietnameseSupport: tool.vietnameseSupport,
            difficulty: tool.difficulty,
            pricingModel: tool.pricingModel,
            features: JSON.parse(tool.features || '[]'),
            useCase: tool.useCase,
            integrationGuide: tool.integrationGuide,
            samplePrompts: JSON.parse(tool.samplePrompts || '[]'),
            relatedTools: JSON.parse(tool.relatedTools || '[]'),
            createdAt: tool.createdAt,
            updatedAt: tool.updatedAt
        };
    }
}

export const aiToolsRepository = new AIToolsRepository();