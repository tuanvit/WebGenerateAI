/**
 * AI Tools Service Layer
 * Handles business logic for managing 40+ AI tools
 */

import { AIToolsRepository, AIToolData, AIToolFilters } from '../repositories/ai-tools-repository';
import { validateAITool, validateBulkAIToolUpdate } from '../admin-validation';
import { AdminErrorCode, createAdminError } from '../admin-errors';
import { logAdminAction, AdminAction, AdminResource } from '../admin-audit';
import { AdminUser } from '../admin-auth';
import { AdminPaginatedResponse } from '../index';

export interface AIToolSearchFilters extends AIToolFilters {
    searchTerm?: string;
    categories?: string[];
    subjects?: string[];
    gradeLevels?: number[];
    difficulties?: string[];
    pricingModels?: string[];
    vietnameseSupport?: boolean;
}

export interface BulkUpdateData {
    ids: string[];
    updates: Partial<AIToolData>;
}

export interface ImportResult {
    success: number;
    failed: number;
    errors: Array<{ row: number; error: string; data?: any }>;
}

export class AIToolsService {
    private repository: AIToolsRepository;

    constructor() {
        this.repository = new AIToolsRepository();
    }

    /**
     * Get AI tools with advanced filtering and search
     */
    async getAITools(filters: AIToolSearchFilters = {}): Promise<AdminPaginatedResponse<AIToolData>> {
        try {
            // Transform search filters to repository filters
            const repositoryFilters: AIToolFilters = {
                search: filters.searchTerm,
                category: filters.categories?.[0], // Repository supports single category
                subject: filters.subjects?.[0], // Repository supports single subject
                gradeLevel: filters.gradeLevels,
                difficulty: filters.difficulties?.[0],
                pricingModel: filters.pricingModels?.[0],
                vietnameseSupport: filters.vietnameseSupport,
                page: filters.page,
                limit: filters.limit,
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder
            };

            const result = await this.repository.getAITools(repositoryFilters);

            // Apply additional client-side filtering for multiple categories/subjects if needed
            if (filters.categories && filters.categories.length > 1) {
                result.data = result.data.filter(tool =>
                    filters.categories!.includes(tool.category)
                );
            }

            if (filters.subjects && filters.subjects.length > 1) {
                result.data = result.data.filter(tool =>
                    tool.subjects.some(subject => filters.subjects!.includes(subject))
                );
            }

            if (filters.difficulties && filters.difficulties.length > 1) {
                result.data = result.data.filter(tool =>
                    filters.difficulties!.includes(tool.difficulty)
                );
            }

            if (filters.pricingModels && filters.pricingModels.length > 1) {
                result.data = result.data.filter(tool =>
                    filters.pricingModels!.includes(tool.pricingModel)
                );
            }

            return result;
        } catch (error) {
            console.error('Error in AIToolsService.getAITools:', error);
            throw error;
        }
    }

    /**
     * Get AI tool by ID with validation
     */
    async getAIToolById(id: string): Promise<AIToolData> {
        if (!id || typeof id !== 'string') {
            throw createAdminError(AdminErrorCode.INVALID_INPUT, 'ID công cụ AI không hợp lệ');
        }

        const tool = await this.repository.getAIToolById(id);
        if (!tool) {
            throw createAdminError(AdminErrorCode.AI_TOOL_NOT_FOUND);
        }

        return tool;
    }

    /**
     * Create new AI tool with validation and business logic
     */
    async createAITool(data: AIToolData, user: AdminUser): Promise<AIToolData> {
        // Validate input data
        const validatedData = validateAITool(data);

        // Additional business logic validation
        await this.validateAIToolBusinessRules(validatedData);

        // Create the tool
        const createdTool = await this.repository.createAITool(validatedData);

        // Log the action
        await logAdminAction(user, AdminAction.CREATE_AI_TOOL, AdminResource.AI_TOOLS, createdTool.id, {
            toolName: createdTool.name,
            category: createdTool.category
        });

        return createdTool;
    }

    /**
     * Update AI tool with validation
     */
    async updateAITool(id: string, data: Partial<AIToolData>, user: AdminUser): Promise<AIToolData> {
        // Validate ID
        if (!id || typeof id !== 'string') {
            throw createAdminError(AdminErrorCode.INVALID_INPUT, 'ID công cụ AI không hợp lệ');
        }

        // Get existing tool
        const existingTool = await this.getAIToolById(id);

        // Validate update data
        const validatedData = validateAITool({ ...existingTool, ...data });

        // Additional business logic validation
        await this.validateAIToolBusinessRules(validatedData, id);

        // Update the tool
        const updatedTool = await this.repository.updateAITool(id, validatedData);

        // Log the action
        await logAdminAction(user, AdminAction.UPDATE_AI_TOOL, AdminResource.AI_TOOLS, id, {
            toolName: updatedTool.name,
            changes: data
        });

        return updatedTool;
    }

    /**
     * Delete AI tool with validation
     */
    async deleteAITool(id: string, user: AdminUser): Promise<void> {
        // Validate ID
        if (!id || typeof id !== 'string') {
            throw createAdminError(AdminErrorCode.INVALID_INPUT, 'ID công cụ AI không hợp lệ');
        }

        // Get existing tool for logging
        const existingTool = await this.getAIToolById(id);

        // Delete the tool
        await this.repository.deleteAITool(id);

        // Log the action
        await logAdminAction(user, AdminAction.DELETE_AI_TOOL, AdminResource.AI_TOOLS, id, {
            toolName: existingTool.name,
            category: existingTool.category
        });
    }

    /**
     * Bulk update AI tools with validation
     */
    async bulkUpdateAITools(data: BulkUpdateData, user: AdminUser): Promise<number> {
        // Validate bulk update data
        const validatedData = validateBulkAIToolUpdate(data);

        // Additional validation for bulk operations
        if (validatedData.ids.length === 0) {
            throw createAdminError(AdminErrorCode.INVALID_INPUT, 'Phải chọn ít nhất một công cụ AI');
        }

        // Validate that all IDs exist
        const existingTools = await Promise.all(
            validatedData.ids.map(id => this.repository.getAIToolById(id))
        );

        const notFoundIds = validatedData.ids.filter((id, index) => !existingTools[index]);
        if (notFoundIds.length > 0) {
            throw createAdminError(
                AdminErrorCode.AI_TOOL_NOT_FOUND,
                `Không tìm thấy công cụ AI với ID: ${notFoundIds.join(', ')}`
            );
        }

        // Perform bulk update
        const updatedCount = await this.repository.bulkUpdateAITools(
            validatedData.ids,
            validatedData.updates
        );

        // Log the action
        await logAdminAction(user, AdminAction.BULK_UPDATE_AI_TOOLS, AdminResource.AI_TOOLS, undefined, {
            affectedIds: validatedData.ids,
            updatedCount,
            changes: validatedData.updates
        });

        return updatedCount;
    }

    /**
     * Bulk delete AI tools
     */
    async bulkDeleteAITools(ids: string[], user: AdminUser): Promise<number> {
        if (!ids || ids.length === 0) {
            throw createAdminError(AdminErrorCode.INVALID_INPUT, 'Phải chọn ít nhất một công cụ AI');
        }

        // Validate that all IDs exist and get tool names for logging
        const existingTools = await Promise.all(
            ids.map(id => this.repository.getAIToolById(id))
        );

        const notFoundIds = ids.filter((id, index) => !existingTools[index]);
        if (notFoundIds.length > 0) {
            throw createAdminError(
                AdminErrorCode.AI_TOOL_NOT_FOUND,
                `Không tìm thấy công cụ AI với ID: ${notFoundIds.join(', ')}`
            );
        }

        // Perform bulk delete
        const deletedCount = await this.repository.bulkDeleteAITools(ids);

        // Log the action
        await logAdminAction(user, AdminAction.BULK_DELETE_AI_TOOLS, AdminResource.AI_TOOLS, undefined, {
            affectedIds: ids,
            deletedCount,
            toolNames: existingTools.filter(Boolean).map(tool => tool!.name)
        });

        return deletedCount;
    }

    /**
     * Import AI tools from data array
     */
    async importAITools(toolsData: any[], user: AdminUser): Promise<ImportResult> {
        const result: ImportResult = {
            success: 0,
            failed: 0,
            errors: []
        };

        for (let i = 0; i < toolsData.length; i++) {
            try {
                const toolData = toolsData[i];

                // Validate the tool data
                const validatedData = validateAITool(toolData);

                // Additional business logic validation
                await this.validateAIToolBusinessRules(validatedData);

                // Create the tool
                await this.repository.createAITool(validatedData);
                result.success++;
            } catch (error) {
                result.failed++;
                result.errors.push({
                    row: i + 1,
                    error: error instanceof Error ? error.message : 'Lỗi không xác định',
                    data: toolsData[i]
                });
            }
        }

        // Log the import action
        await logAdminAction(user, AdminAction.IMPORT_AI_TOOLS, AdminResource.AI_TOOLS, undefined, {
            totalRows: toolsData.length,
            successCount: result.success,
            failedCount: result.failed,
            errors: result.errors.slice(0, 10) // Log first 10 errors only
        });

        return result;
    }

    /**
     * Export AI tools data
     */
    async exportAITools(filters: AIToolSearchFilters = {}, user: AdminUser): Promise<AIToolData[]> {
        // Get all tools matching filters (without pagination)
        const allToolsFilters = { ...filters, page: 1, limit: 10000 };
        const result = await this.getAITools(allToolsFilters);

        // Log the export action
        await logAdminAction(user, AdminAction.EXPORT_AI_TOOLS, AdminResource.AI_TOOLS, undefined, {
            exportedCount: result.data.length,
            filters
        });

        return result.data;
    }

    /**
     * Get AI tools statistics
     */
    async getAIToolsStatistics(): Promise<{
        total: number;
        byCategory: Record<string, number>;
        byDifficulty: Record<string, number>;
        byPricingModel: Record<string, number>;
        vietnameseSupportCount: number;
        bySubject: Record<string, number>;
        byGradeLevel: Record<string, number>;
    }> {
        const stats = await this.repository.getAIToolsStats();

        // Get additional statistics by subject and grade level
        const allTools = await this.repository.getAITools({ page: 1, limit: 10000 });

        const bySubject: Record<string, number> = {};
        const byGradeLevel: Record<string, number> = {};

        allTools.data.forEach(tool => {
            // Count by subjects
            tool.subjects.forEach(subject => {
                bySubject[subject] = (bySubject[subject] || 0) + 1;
            });

            // Count by grade levels
            tool.gradeLevel.forEach(grade => {
                const gradeKey = `Lớp ${grade}`;
                byGradeLevel[gradeKey] = (byGradeLevel[gradeKey] || 0) + 1;
            });
        });

        return {
            ...stats,
            bySubject,
            byGradeLevel
        };
    }

    /**
     * Search AI tools with advanced text search
     */
    async searchAITools(query: string, filters: AIToolSearchFilters = {}): Promise<AdminPaginatedResponse<AIToolData>> {
        if (!query || query.trim().length === 0) {
            return this.getAITools(filters);
        }

        const searchFilters: AIToolSearchFilters = {
            ...filters,
            searchTerm: query.trim()
        };

        return this.getAITools(searchFilters);
    }

    /**
     * Get AI tools by category with filtering
     */
    async getAIToolsByCategory(category: string, filters: AIToolSearchFilters = {}): Promise<AdminPaginatedResponse<AIToolData>> {
        const categoryFilters: AIToolSearchFilters = {
            ...filters,
            categories: [category]
        };

        return this.getAITools(categoryFilters);
    }

    /**
     * Get recommended AI tools for curriculum creation
     */
    async getRecommendedToolsForCurriculum(subject?: string, gradeLevel?: number): Promise<AIToolData[]> {
        const filters: AIToolSearchFilters = {
            page: 1,
            limit: 20,
            vietnameseSupport: true, // Prioritize Vietnamese support
            difficulties: ['beginner', 'intermediate'], // Focus on accessible tools
            pricingModels: ['free', 'freemium'] // Prioritize free tools
        };

        if (subject) {
            filters.subjects = [subject];
        }

        if (gradeLevel) {
            filters.gradeLevels = [gradeLevel];
        }

        const result = await this.getAITools(filters);

        // Sort by relevance for curriculum creation
        return result.data.sort((a, b) => {
            // Vietnamese support first
            if (a.vietnameseSupport && !b.vietnameseSupport) return -1;
            if (!a.vietnameseSupport && b.vietnameseSupport) return 1;

            // Free tools first
            if (a.pricingModel === 'free' && b.pricingModel !== 'free') return -1;
            if (a.pricingModel !== 'free' && b.pricingModel === 'free') return 1;

            // Beginner-friendly first
            if (a.difficulty === 'beginner' && b.difficulty !== 'beginner') return -1;
            if (a.difficulty !== 'beginner' && b.difficulty === 'beginner') return 1;

            return 0;
        });
    }

    /**
     * Validate AI tool business rules
     */
    private async validateAIToolBusinessRules(data: AIToolData, excludeId?: string): Promise<void> {
        // Check for duplicate URLs
        const existingTools = await this.repository.getAITools({ search: '', page: 1, limit: 10000 });
        const duplicateUrl = existingTools.data.find(tool =>
            tool.url === data.url && tool.id !== excludeId
        );

        if (duplicateUrl) {
            throw createAdminError(
                AdminErrorCode.DUPLICATE_RECORD,
                `URL đã được sử dụng bởi công cụ "${duplicateUrl.name}"`
            );
        }

        // Validate category-specific requirements
        this.validateCategorySpecificRules(data);

        // Validate subject-grade level combinations
        this.validateSubjectGradeLevelCombinations(data);
    }

    /**
     * Validate category-specific business rules
     */
    private validateCategorySpecificRules(data: AIToolData): void {
        switch (data.category) {
            case 'SIMULATION':
                if (!data.subjects.includes('Khoa học tự nhiên') && !data.subjects.includes('Toán')) {
                    throw createAdminError(
                        AdminErrorCode.VALIDATION_ERROR,
                        'Công cụ mô phỏng phải hỗ trợ ít nhất môn Khoa học tự nhiên hoặc Toán'
                    );
                }
                break;

            case 'ASSESSMENT':
                if (data.features.length === 0) {
                    throw createAdminError(
                        AdminErrorCode.VALIDATION_ERROR,
                        'Công cụ đánh giá phải có ít nhất một tính năng'
                    );
                }
                break;

            case 'TEXT_GENERATION':
                if (!data.vietnameseSupport) {
                    console.warn(`Text generation tool "${data.name}" should support Vietnamese`);
                }
                break;
        }
    }

    /**
     * Validate subject and grade level combinations
     */
    private validateSubjectGradeLevelCombinations(data: AIToolData): void {
        // Ensure grade levels are appropriate for subjects
        const hasAdvancedSubjects = data.subjects.some(subject =>
            ['Khoa học tự nhiên', 'Lịch sử & Địa lí'].includes(subject)
        );

        if (hasAdvancedSubjects && data.gradeLevel.some(grade => grade < 6)) {
            throw createAdminError(
                AdminErrorCode.VALIDATION_ERROR,
                'Các môn Khoa học tự nhiên và Lịch sử & Địa lí chỉ phù hợp từ lớp 6 trở lên'
            );
        }

        // Validate difficulty vs grade level
        if (data.difficulty === 'advanced' && data.gradeLevel.some(grade => grade < 8)) {
            throw createAdminError(
                AdminErrorCode.VALIDATION_ERROR,
                'Công cụ mức độ nâng cao chỉ phù hợp từ lớp 8 trở lên'
            );
        }
    }
}