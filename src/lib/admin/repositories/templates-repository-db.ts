/**
 * Templates Repository with Database
 * Simplified version for testing database connection
 */

export interface TemplateData {
    id?: string;
    name: string;
    description: string;
    subject: string;
    gradeLevel: number[];
    outputType: 'lesson-plan' | 'presentation' | 'assessment' | 'interactive' | 'research';
    templateContent: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    recommendedTools?: string[];
    tags?: string[];
    compliance?: string[];
    variables?: any[];
    examples?: any[];
}

export interface TemplateFilters {
    page?: number;
    limit?: number;
    search?: string;
    subject?: string;
    outputType?: string;
    difficulty?: string;
    gradeLevel?: number[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface AdminPaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export class TemplatesRepository {
    /**
     * Get all templates with filtering and pagination
     */
    async getTemplates(filters: TemplateFilters = {}): Promise<AdminPaginatedResponse<TemplateData>> {
        try {
            // Import Prisma dynamically to avoid initialization issues
            const { prisma } = await import('@/lib/db');

            const page = filters.page || 1;
            const limit = filters.limit || 25;
            const skip = (page - 1) * limit;

            // Build where clause
            const where: any = {};

            if (filters.search) {
                where.OR = [
                    { name: { contains: filters.search } },
                    { description: { contains: filters.search } }
                ];
            }

            if (filters.subject) {
                where.subject = filters.subject;
            }

            if (filters.outputType) {
                where.outputType = filters.outputType;
            }

            if (filters.difficulty) {
                where.difficulty = filters.difficulty;
            }

            const [templates, total] = await Promise.all([
                prisma.template.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { updatedAt: 'desc' },
                    include: {
                        variables: true,
                        examples: true
                    }
                }),
                prisma.template.count({ where })
            ]);

            const transformedData = templates.map(template => this.transformTemplate(template));
            const totalPages = Math.ceil(total / limit);

            return {
                data: transformedData,
                total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            };
        } catch (error) {
            console.error('Error in TemplatesRepository.getTemplates:', error);
            throw new Error('Không thể lấy danh sách templates từ database');
        }
    }

    /**
     * Get template by ID
     */
    async getTemplateById(id: string): Promise<TemplateData | null> {
        try {
            const { prisma } = await import('@/lib/db');

            const template = await prisma.template.findUnique({
                where: { id },
                include: {
                    variables: true,
                    examples: true
                }
            });

            return template ? this.transformTemplate(template) : null;
        } catch (error) {
            console.error('Error getting template by ID:', error);
            throw new Error('Không thể lấy thông tin template');
        }
    }

    /**
     * Create new template
     */
    async createTemplate(data: TemplateData): Promise<TemplateData> {
        try {
            const { prisma } = await import('@/lib/db');

            // Check for duplicate name
            const existing = await prisma.template.findFirst({
                where: { name: data.name }
            });

            if (existing) {
                throw new Error('Template với tên này đã tồn tại');
            }

            const template = await prisma.template.create({
                data: {
                    name: data.name,
                    description: data.description,
                    subject: data.subject,
                    gradeLevel: JSON.stringify(data.gradeLevel),
                    outputType: data.outputType,
                    templateContent: data.templateContent,
                    recommendedTools: data.recommendedTools ? JSON.stringify(data.recommendedTools) : null,
                    tags: data.tags ? JSON.stringify(data.tags) : null,
                    difficulty: data.difficulty,
                    compliance: data.compliance ? JSON.stringify(data.compliance) : null,
                    variables: data.variables ? {
                        create: data.variables.map((variable: any) => ({
                            name: variable.name,
                            label: variable.label,
                            description: variable.description || null,
                            type: variable.type,
                            required: variable.required,
                            placeholder: variable.placeholder || null,
                            options: variable.options ? JSON.stringify(variable.options) : null,
                            defaultValue: variable.defaultValue || null
                        }))
                    } : undefined,
                    examples: data.examples ? {
                        create: data.examples.map((example: any) => ({
                            title: example.title,
                            description: example.description,
                            sampleInput: JSON.stringify(example.sampleInput),
                            expectedOutput: example.expectedOutput
                        }))
                    } : undefined
                },
                include: {
                    variables: true,
                    examples: true
                }
            });

            return this.transformTemplate(template);
        } catch (error) {
            console.error('Error creating template:', error);
            throw new Error('Không thể tạo template mới');
        }
    }

    /**
     * Update template
     */
    async updateTemplate(id: string, data: Partial<TemplateData>): Promise<TemplateData> {
        try {
            const { prisma } = await import('@/lib/db');

            // Check if template exists
            const existing = await prisma.template.findUnique({
                where: { id }
            });

            if (!existing) {
                throw new Error('Template không tồn tại');
            }

            const updateData: any = {};

            if (data.name) updateData.name = data.name;
            if (data.description) updateData.description = data.description;
            if (data.subject) updateData.subject = data.subject;
            if (data.gradeLevel) updateData.gradeLevel = JSON.stringify(data.gradeLevel);
            if (data.outputType) updateData.outputType = data.outputType;
            if (data.templateContent) updateData.templateContent = data.templateContent;
            if (data.recommendedTools !== undefined) updateData.recommendedTools = data.recommendedTools ? JSON.stringify(data.recommendedTools) : null;
            if (data.tags !== undefined) updateData.tags = data.tags ? JSON.stringify(data.tags) : null;
            if (data.difficulty) updateData.difficulty = data.difficulty;
            if (data.compliance !== undefined) updateData.compliance = data.compliance ? JSON.stringify(data.compliance) : null;

            // Handle variables update
            if (data.variables !== undefined) {
                // Delete existing variables
                await prisma.templateVariable.deleteMany({
                    where: { templateId: id }
                });

                // Create new variables if provided
                if (data.variables && data.variables.length > 0) {
                    updateData.variables = {
                        create: data.variables.map((variable: any) => ({
                            name: variable.name,
                            label: variable.label,
                            description: variable.description || null,
                            type: variable.type,
                            required: variable.required,
                            placeholder: variable.placeholder || null,
                            options: variable.options ? JSON.stringify(variable.options) : null,
                            defaultValue: variable.defaultValue || null
                        }))
                    };
                }
            }

            // Handle examples update
            if (data.examples !== undefined) {
                // Delete existing examples
                await prisma.templateExample.deleteMany({
                    where: { templateId: id }
                });

                // Create new examples if provided
                if (data.examples && data.examples.length > 0) {
                    updateData.examples = {
                        create: data.examples.map((example: any) => ({
                            title: example.title,
                            description: example.description,
                            sampleInput: JSON.stringify(example.sampleInput),
                            expectedOutput: example.expectedOutput
                        }))
                    };
                }
            }

            const template = await prisma.template.update({
                where: { id },
                data: updateData,
                include: {
                    variables: true,
                    examples: true
                }
            });

            return this.transformTemplate(template);
        } catch (error) {
            console.error('Error updating template:', error);
            throw new Error('Không thể cập nhật template');
        }
    }

    /**
     * Delete template
     */
    async deleteTemplate(id: string): Promise<void> {
        try {
            const { prisma } = await import('@/lib/db');

            const existing = await prisma.template.findUnique({
                where: { id }
            });

            if (!existing) {
                throw new Error('Template không tồn tại');
            }

            await prisma.template.delete({
                where: { id }
            });
        } catch (error) {
            console.error('Error deleting template:', error);
            throw new Error('Không thể xóa template');
        }
    }

    /**
     * Bulk update templates
     */
    async bulkUpdateTemplates(ids: string[], updates: Partial<TemplateData>): Promise<number> {
        try {
            const { prisma } = await import('@/lib/db');

            const updateData: any = {};

            if (updates.subject) updateData.subject = updates.subject;
            if (updates.gradeLevel) updateData.gradeLevel = JSON.stringify(updates.gradeLevel);
            if (updates.outputType) updateData.outputType = updates.outputType;
            if (updates.difficulty) updateData.difficulty = updates.difficulty;
            if (updates.tags !== undefined) updateData.tags = updates.tags ? JSON.stringify(updates.tags) : null;

            const result = await prisma.template.updateMany({
                where: { id: { in: ids } },
                data: updateData
            });

            return result.count;
        } catch (error) {
            console.error('Error bulk updating templates:', error);
            throw new Error('Không thể cập nhật hàng loạt');
        }
    }

    /**
     * Bulk delete templates
     */
    async bulkDeleteTemplates(ids: string[]): Promise<number> {
        try {
            const { prisma } = await import('@/lib/db');

            const result = await prisma.template.deleteMany({
                where: { id: { in: ids } }
            });

            return result.count;
        } catch (error) {
            console.error('Error bulk deleting templates:', error);
            throw new Error('Không thể xóa hàng loạt');
        }
    }

    /**
     * Get templates statistics
     */
    async getTemplatesStats(): Promise<{
        total: number;
        bySubject: Record<string, number>;
        byDifficulty: Record<string, number>;
        byOutputType: Record<string, number>;
    }> {
        try {
            const { prisma } = await import('@/lib/db');

            const [
                total,
                bySubject,
                byDifficulty,
                byOutputType
            ] = await Promise.all([
                prisma.template.count(),
                prisma.template.groupBy({
                    by: ['subject'],
                    _count: { id: true }
                }),
                prisma.template.groupBy({
                    by: ['difficulty'],
                    _count: { id: true }
                }),
                prisma.template.groupBy({
                    by: ['outputType'],
                    _count: { id: true }
                })
            ]);

            return {
                total,
                bySubject: bySubject.reduce((acc, item) => {
                    acc[item.subject] = item._count.id;
                    return acc;
                }, {} as Record<string, number>),
                byDifficulty: byDifficulty.reduce((acc, item) => {
                    acc[item.difficulty] = item._count.id;
                    return acc;
                }, {} as Record<string, number>),
                byOutputType: byOutputType.reduce((acc, item) => {
                    acc[item.outputType] = item._count.id;
                    return acc;
                }, {} as Record<string, number>)
            };
        } catch (error) {
            console.error('Error getting templates stats:', error);
            throw new Error('Không thể lấy thống kê template');
        }
    }

    /**
     * Transform database record to API format
     */
    private transformTemplate(template: any): TemplateData {
        return {
            id: template.id,
            name: template.name,
            description: template.description,
            subject: template.subject,
            gradeLevel: JSON.parse(template.gradeLevel || '[]'),
            outputType: template.outputType,
            templateContent: template.templateContent,
            recommendedTools: template.recommendedTools ? JSON.parse(template.recommendedTools) : [],
            tags: template.tags ? JSON.parse(template.tags) : [],
            difficulty: template.difficulty,
            compliance: template.compliance ? JSON.parse(template.compliance) : [],
            variables: template.variables ? template.variables.map((variable: any) => ({
                id: variable.id,
                name: variable.name,
                label: variable.label,
                description: variable.description,
                type: variable.type,
                required: variable.required,
                placeholder: variable.placeholder,
                options: variable.options ? JSON.parse(variable.options) : [],
                defaultValue: variable.defaultValue
            })) : [],
            examples: template.examples ? template.examples.map((example: any) => ({
                id: example.id,
                title: example.title,
                description: example.description,
                sampleInput: JSON.parse(example.sampleInput || '{}'),
                expectedOutput: example.expectedOutput
            })) : []
        };
    }
}