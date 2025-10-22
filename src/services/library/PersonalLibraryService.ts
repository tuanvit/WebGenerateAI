import { prisma } from '../../lib/db';
import type { GeneratedPrompt, PromptVersion } from '../../types/prompt';
import type { PersonalLibraryService as IPersonalLibraryService } from '../../types/services';
import type { LibraryFilters } from '../../types/content';
import { DatabaseError, NotFoundError, UnauthorizedError } from '../../types/services';

/**
 * Service for managing user's personal library of saved prompts
 * Supports organizing prompts by subject, grade level, and date
 * Includes version management and editing capabilities
 */
export class PersonalLibraryService implements IPersonalLibraryService {
    /**
     * Save a new prompt to user's personal library
     */
    async savePrompt(prompt: Omit<GeneratedPrompt, 'id' | 'createdAt'>): Promise<GeneratedPrompt> {
        try {
            const savedPrompt = await prisma.generatedPrompt.create({
                data: {
                    userId: prompt.userId,
                    inputParameters: prompt.inputParameters,
                    generatedText: prompt.generatedText,
                    targetTool: prompt.targetTool,
                    isShared: prompt.isShared,
                    tags: prompt.tags,
                },
            });

            // Create initial version
            await this.createVersion(savedPrompt.id, savedPrompt.generatedText);

            return {
                ...savedPrompt,
                inputParameters: savedPrompt.inputParameters as Record<string, unknown>,
            };
        } catch (error) {
            console.error('Failed to save prompt:', error);
            throw new DatabaseError('Không thể lưu prompt vào thư viện cá nhân');
        }
    }

    /**
     * Retrieve user's saved prompts with optional filtering
     * Supports organizing by subject, grade level, and date
     */
    async getPrompts(userId: string, filters?: LibraryFilters): Promise<GeneratedPrompt[]> {
        try {
            const where: any = {
                userId,
            };

            // Apply filters
            if (filters) {
                if (filters.subject) {
                    where.inputParameters = {
                        path: ['subject'],
                        equals: filters.subject,
                    };
                }

                if (filters.gradeLevel) {
                    where.inputParameters = {
                        ...where.inputParameters,
                        path: ['gradeLevel'],
                        equals: filters.gradeLevel,
                    };
                }

                if (filters.tags && filters.tags.length > 0) {
                    where.tags = {
                        hasSome: filters.tags,
                    };
                }

                if (filters.dateFrom || filters.dateTo) {
                    where.createdAt = {};
                    if (filters.dateFrom) {
                        where.createdAt.gte = filters.dateFrom;
                    }
                    if (filters.dateTo) {
                        where.createdAt.lte = filters.dateTo;
                    }
                }
            }

            const prompts = await prisma.generatedPrompt.findMany({
                where,
                orderBy: [
                    { createdAt: 'desc' },
                ],
                include: {
                    versions: {
                        orderBy: { version: 'desc' },
                        take: 1, // Get latest version for each prompt
                    },
                },
            });

            return prompts.map((prompt: any) => ({
                ...prompt,
                inputParameters: prompt.inputParameters as Record<string, unknown>,
            }));
        } catch (error) {
            console.error('Failed to get prompts:', error);
            throw new DatabaseError('Không thể lấy danh sách prompt từ thư viện cá nhân');
        }
    }

    /**
     * Update an existing prompt in user's personal library
     */
    async updatePrompt(promptId: string, updates: Partial<GeneratedPrompt>): Promise<GeneratedPrompt> {
        try {
            // First verify the prompt exists and belongs to the user
            const existingPrompt = await prisma.generatedPrompt.findUnique({
                where: { id: promptId },
            });

            if (!existingPrompt) {
                throw new NotFoundError('Không tìm thấy prompt');
            }

            // Prepare update data
            const updateData: any = {};

            if (updates.inputParameters !== undefined) {
                updateData.inputParameters = updates.inputParameters;
            }
            if (updates.generatedText !== undefined) {
                updateData.generatedText = updates.generatedText;
            }
            if (updates.targetTool !== undefined) {
                updateData.targetTool = updates.targetTool;
            }
            if (updates.isShared !== undefined) {
                updateData.isShared = updates.isShared;
            }
            if (updates.tags !== undefined) {
                updateData.tags = updates.tags;
            }

            const updatedPrompt = await prisma.generatedPrompt.update({
                where: { id: promptId },
                data: updateData,
            });

            // Create new version if content changed
            if (updates.generatedText && updates.generatedText !== existingPrompt.generatedText) {
                await this.createVersion(promptId, updates.generatedText);
            }

            return {
                ...updatedPrompt,
                inputParameters: updatedPrompt.inputParameters as Record<string, unknown>,
            };
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            console.error('Failed to update prompt:', error);
            throw new DatabaseError('Không thể cập nhật prompt');
        }
    }

    /**
     * Delete a prompt from user's personal library
     */
    async deletePrompt(promptId: string, userId: string): Promise<void> {
        try {
            // Verify the prompt exists and belongs to the user
            const existingPrompt = await prisma.generatedPrompt.findUnique({
                where: { id: promptId },
            });

            if (!existingPrompt) {
                throw new NotFoundError('Không tìm thấy prompt');
            }

            if (existingPrompt.userId !== userId) {
                throw new UnauthorizedError('Không có quyền xóa prompt này');
            }

            // Delete the prompt (versions will be deleted automatically due to cascade)
            await prisma.generatedPrompt.delete({
                where: { id: promptId },
            });
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof UnauthorizedError) {
                throw error;
            }
            console.error('Failed to delete prompt:', error);
            throw new DatabaseError('Không thể xóa prompt');
        }
    }

    /**
     * Get version history for a specific prompt
     */
    async getVersionHistory(promptId: string): Promise<PromptVersion[]> {
        try {
            const versions = await prisma.promptVersion.findMany({
                where: { promptId },
                orderBy: { version: 'desc' },
            });

            return versions;
        } catch (error) {
            console.error('Failed to get version history:', error);
            throw new DatabaseError('Không thể lấy lịch sử phiên bản');
        }
    }

    /**
     * Create a new version of a prompt
     */
    async createVersion(promptId: string, content: string): Promise<PromptVersion> {
        try {
            // Get the highest version number for this prompt
            const latestVersion = await prisma.promptVersion.findFirst({
                where: { promptId },
                orderBy: { version: 'desc' },
            });

            const nextVersion = (latestVersion?.version || 0) + 1;

            const version = await prisma.promptVersion.create({
                data: {
                    promptId,
                    version: nextVersion,
                    content,
                },
            });

            return version;
        } catch (error) {
            console.error('Failed to create version:', error);
            throw new DatabaseError('Không thể tạo phiên bản mới');
        }
    }

    /**
     * Get prompts organized by subject
     */
    async getPromptsBySubject(userId: string): Promise<Record<string, GeneratedPrompt[]>> {
        try {
            const prompts = await this.getPrompts(userId);
            const promptsBySubject: Record<string, GeneratedPrompt[]> = {};

            prompts.forEach((prompt: GeneratedPrompt) => {
                const subject = (prompt.inputParameters as any)?.subject || 'Khác';
                if (!promptsBySubject[subject]) {
                    promptsBySubject[subject] = [];
                }
                promptsBySubject[subject].push(prompt);
            });

            return promptsBySubject;
        } catch (error) {
            console.error('Failed to get prompts by subject:', error);
            throw new DatabaseError('Không thể lấy prompt theo môn học');
        }
    }

    /**
     * Get prompts organized by grade level
     */
    async getPromptsByGradeLevel(userId: string): Promise<Record<number, GeneratedPrompt[]>> {
        try {
            const prompts = await this.getPrompts(userId);
            const promptsByGrade: Record<number, GeneratedPrompt[]> = {};

            prompts.forEach((prompt: GeneratedPrompt) => {
                const gradeLevel = (prompt.inputParameters as any)?.gradeLevel || 0;
                if (!promptsByGrade[gradeLevel]) {
                    promptsByGrade[gradeLevel] = [];
                }
                promptsByGrade[gradeLevel].push(prompt);
            });

            return promptsByGrade;
        } catch (error) {
            console.error('Failed to get prompts by grade level:', error);
            throw new DatabaseError('Không thể lấy prompt theo khối lớp');
        }
    }

    /**
     * Get recent prompts for quick access
     */
    async getRecentPrompts(userId: string, limit: number = 10): Promise<GeneratedPrompt[]> {
        try {
            const prompts = await prisma.generatedPrompt.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: limit,
            });

            return prompts.map((prompt: any) => ({
                ...prompt,
                inputParameters: prompt.inputParameters as Record<string, unknown>,
            }));
        } catch (error) {
            console.error('Failed to get recent prompts:', error);
            throw new DatabaseError('Không thể lấy prompt gần đây');
        }
    }

    /**
     * Search prompts in user's personal library
     */
    async searchPrompts(userId: string, query: string): Promise<GeneratedPrompt[]> {
        try {
            const prompts = await prisma.generatedPrompt.findMany({
                where: {
                    userId,
                    OR: [
                        {
                            generatedText: {
                                contains: query,
                                mode: 'insensitive',
                            },
                        },
                        {
                            tags: {
                                hasSome: [query],
                            },
                        },
                    ],
                },
                orderBy: { createdAt: 'desc' },
            });

            return prompts.map((prompt: any) => ({
                ...prompt,
                inputParameters: prompt.inputParameters as Record<string, unknown>,
            }));
        } catch (error) {
            console.error('Failed to search prompts:', error);
            throw new DatabaseError('Không thể tìm kiếm prompt');
        }
    }
}