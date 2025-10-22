import { GeneratedPrompt, PromptVersion, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';
import type { CreateGeneratedPromptSchema } from '../../types/prompt';
import { z } from 'zod';

type CreateGeneratedPromptInput = z.infer<typeof CreateGeneratedPromptSchema>;
type UpdateGeneratedPromptInput = Partial<Omit<CreateGeneratedPromptInput, 'userId'>>;

export class GeneratedPromptRepository extends BaseRepository<
    GeneratedPrompt,
    CreateGeneratedPromptInput,
    UpdateGeneratedPromptInput
> {
    /**
     * Create a new generated prompt
     */
    async create(data: CreateGeneratedPromptInput): Promise<GeneratedPrompt> {
        try {
            return await this.db.generatedPrompt.create({
                data,
            });
        } catch (error) {
            this.handleError(error, 'tạo prompt');
        }
    }

    /**
     * Find generated prompt by ID
     */
    async findById(id: string): Promise<GeneratedPrompt | null> {
        try {
            return await this.db.generatedPrompt.findUnique({
                where: { id },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    versions: {
                        orderBy: { version: 'desc' },
                    },
                },
            });
        } catch (error) {
            this.handleError(error, 'tìm prompt theo ID');
        }
    }

    /**
     * Update generated prompt by ID
     */
    async update(id: string, data: UpdateGeneratedPromptInput): Promise<GeneratedPrompt> {
        try {
            return await this.db.generatedPrompt.update({
                where: { id },
                data,
            });
        } catch (error) {
            this.handleError(error, 'cập nhật prompt');
        }
    }

    /**
     * Delete generated prompt by ID
     */
    async delete(id: string): Promise<void> {
        try {
            await this.db.generatedPrompt.delete({
                where: { id },
            });
        } catch (error) {
            this.handleError(error, 'xóa prompt');
        }
    }

    /**
     * Find prompts by user ID with filtering
     */
    async findByUserId(
        userId: string,
        filters?: {
            tags?: string[];
            targetTool?: string;
            isShared?: boolean;
            dateFrom?: Date;
            dateTo?: Date;
            limit?: number;
            offset?: number;
        }
    ): Promise<GeneratedPrompt[]> {
        try {
            const where: Prisma.GeneratedPromptWhereInput = {
                userId,
            };

            if (filters?.tags?.length) {
                where.tags = {
                    hasSome: filters.tags,
                };
            }

            if (filters?.targetTool) {
                where.targetTool = filters.targetTool;
            }

            if (filters?.isShared !== undefined) {
                where.isShared = filters.isShared;
            }

            if (filters?.dateFrom || filters?.dateTo) {
                where.createdAt = {};
                if (filters.dateFrom) {
                    where.createdAt.gte = filters.dateFrom;
                }
                if (filters.dateTo) {
                    where.createdAt.lte = filters.dateTo;
                }
            }

            return await this.db.generatedPrompt.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: filters?.limit,
                skip: filters?.offset,
            });
        } catch (error) {
            this.handleError(error, 'tìm prompt theo người dùng');
        }
    }

    /**
     * Find all prompts with optional filtering
     */
    async findMany(filters?: {
        userId?: string;
        tags?: string[];
        targetTool?: string;
        isShared?: boolean;
        limit?: number;
        offset?: number;
    }): Promise<GeneratedPrompt[]> {
        try {
            const where: Prisma.GeneratedPromptWhereInput = {};

            if (filters?.userId) {
                where.userId = filters.userId;
            }

            if (filters?.tags?.length) {
                where.tags = {
                    hasSome: filters.tags,
                };
            }

            if (filters?.targetTool) {
                where.targetTool = filters.targetTool;
            }

            if (filters?.isShared !== undefined) {
                where.isShared = filters.isShared;
            }

            return await this.db.generatedPrompt.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: filters?.limit,
                skip: filters?.offset,
            });
        } catch (error) {
            this.handleError(error, 'tìm danh sách prompt');
        }
    }

    /**
     * Create a new version of a prompt
     */
    async createVersion(promptId: string, content: string): Promise<PromptVersion> {
        try {
            // Get the latest version number
            const latestVersion = await this.db.promptVersion.findFirst({
                where: { promptId },
                orderBy: { version: 'desc' },
            });

            const nextVersion = (latestVersion?.version || 0) + 1;

            return await this.db.promptVersion.create({
                data: {
                    promptId,
                    version: nextVersion,
                    content,
                },
            });
        } catch (error) {
            this.handleError(error, 'tạo phiên bản prompt');
        }
    }

    /**
     * Get version history for a prompt
     */
    async getVersionHistory(promptId: string): Promise<PromptVersion[]> {
        try {
            return await this.db.promptVersion.findMany({
                where: { promptId },
                orderBy: { version: 'desc' },
            });
        } catch (error) {
            this.handleError(error, 'lấy lịch sử phiên bản');
        }
    }

    /**
     * Get prompt statistics
     */
    async getPromptStats(): Promise<{
        totalPrompts: number;
        sharedPrompts: number;
        promptsByTool: Record<string, number>;
    }> {
        try {
            const [totalPrompts, sharedPrompts, promptsByTool] = await Promise.all([
                this.db.generatedPrompt.count(),
                this.db.generatedPrompt.count({ where: { isShared: true } }),
                this.db.generatedPrompt.groupBy({
                    by: ['targetTool'],
                    _count: true,
                }),
            ]);

            const toolStats = promptsByTool.reduce((acc, item) => {
                acc[item.targetTool] = item._count;
                return acc;
            }, {} as Record<string, number>);

            return {
                totalPrompts,
                sharedPrompts,
                promptsByTool: toolStats,
            };
        } catch (error) {
            this.handleError(error, 'lấy thống kê prompt');
        }
    }
}