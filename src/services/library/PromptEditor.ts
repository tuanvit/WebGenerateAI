import { prisma } from '../../lib/db';
import type { GeneratedPrompt, LessonPlanInput, PresentationInput, AssessmentInput } from '../../types/prompt';
import { PersonalLibraryService } from './PersonalLibraryService';
import { VersionManager } from './VersionManager';
import { DatabaseError, NotFoundError, UnauthorizedError, ValidationError } from '../../types/services';

/**
 * Service for editing and refining saved prompts
 * Maintains input parameters with generated text and supports iterative improvements
 */
export class PromptEditor {
    private personalLibrary: PersonalLibraryService;
    private versionManager: VersionManager;

    constructor() {
        this.personalLibrary = new PersonalLibraryService();
        this.versionManager = new VersionManager();
    }

    /**
     * Edit a prompt's content while preserving input parameters
     */
    async editPromptContent(
        promptId: string,
        userId: string,
        newContent: string,
        createVersion: boolean = true
    ): Promise<GeneratedPrompt> {
        try {
            // Verify the prompt exists and belongs to the user
            const existingPrompt = await prisma.generatedPrompt.findUnique({
                where: { id: promptId },
            });

            if (!existingPrompt) {
                throw new NotFoundError('Không tìm thấy prompt');
            }

            if (existingPrompt.userId !== userId) {
                throw new UnauthorizedError('Không có quyền chỉnh sửa prompt này');
            }

            // Validate content
            if (!newContent || newContent.trim().length === 0) {
                throw new ValidationError('Nội dung prompt không được để trống');
            }

            // Create version before updating if requested
            if (createVersion && newContent !== existingPrompt.generatedText) {
                await this.versionManager.createVersion(promptId, newContent);
            }

            // Update the prompt content
            const updatedPrompt = await prisma.generatedPrompt.update({
                where: { id: promptId },
                data: {
                    generatedText: newContent,
                },
            });

            return {
                ...updatedPrompt,
                inputParameters: updatedPrompt.inputParameters as Record<string, unknown>,
            };
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof UnauthorizedError || error instanceof ValidationError) {
                throw error;
            }
            console.error('Failed to edit prompt content:', error);
            throw new DatabaseError('Không thể chỉnh sửa nội dung prompt');
        }
    }

    /**
     * Update input parameters for a prompt and optionally regenerate content
     */
    async updateInputParameters(
        promptId: string,
        userId: string,
        newParameters: Record<string, unknown>,
        regenerateContent: boolean = false
    ): Promise<GeneratedPrompt> {
        try {
            // Verify the prompt exists and belongs to the user
            const existingPrompt = await prisma.generatedPrompt.findUnique({
                where: { id: promptId },
            });

            if (!existingPrompt) {
                throw new NotFoundError('Không tìm thấy prompt');
            }

            if (existingPrompt.userId !== userId) {
                throw new UnauthorizedError('Không có quyền chỉnh sửa prompt này');
            }

            // Validate parameters based on prompt type
            this.validateInputParameters(newParameters);

            let updateData: any = {
                inputParameters: newParameters,
            };

            // If regenerating content, we would call the appropriate prompt generator
            // For now, we'll just update the parameters
            if (regenerateContent) {
                // This would integrate with PromptGeneratorService to regenerate content
                // based on the new parameters. For now, we'll create a version with current content
                await this.versionManager.createVersion(promptId, existingPrompt.generatedText);
            }

            const updatedPrompt = await prisma.generatedPrompt.update({
                where: { id: promptId },
                data: updateData,
            });

            return {
                ...updatedPrompt,
                inputParameters: updatedPrompt.inputParameters as Record<string, unknown>,
            };
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof UnauthorizedError || error instanceof ValidationError) {
                throw error;
            }
            console.error('Failed to update input parameters:', error);
            throw new DatabaseError('Không thể cập nhật tham số đầu vào');
        }
    }

    /**
     * Refine a prompt by applying common improvements
     */
    async refinePrompt(
        promptId: string,
        userId: string,
        refinements: PromptRefinement[]
    ): Promise<GeneratedPrompt> {
        try {
            const existingPrompt = await prisma.generatedPrompt.findUnique({
                where: { id: promptId },
            });

            if (!existingPrompt) {
                throw new NotFoundError('Không tìm thấy prompt');
            }

            if (existingPrompt.userId !== userId) {
                throw new UnauthorizedError('Không có quyền tinh chỉnh prompt này');
            }

            let refinedContent = existingPrompt.generatedText;

            // Apply refinements
            for (const refinement of refinements) {
                refinedContent = this.applyRefinement(refinedContent, refinement);
            }

            // Create version before updating
            await this.versionManager.createVersion(promptId, refinedContent);

            // Update the prompt
            const updatedPrompt = await prisma.generatedPrompt.update({
                where: { id: promptId },
                data: {
                    generatedText: refinedContent,
                },
            });

            return {
                ...updatedPrompt,
                inputParameters: updatedPrompt.inputParameters as Record<string, unknown>,
            };
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof UnauthorizedError) {
                throw error;
            }
            console.error('Failed to refine prompt:', error);
            throw new DatabaseError('Không thể tinh chỉnh prompt');
        }
    }

    /**
     * Duplicate a prompt for editing without affecting the original
     */
    async duplicatePrompt(promptId: string, userId: string, newTitle?: string): Promise<GeneratedPrompt> {
        try {
            const originalPrompt = await prisma.generatedPrompt.findUnique({
                where: { id: promptId },
            });

            if (!originalPrompt) {
                throw new NotFoundError('Không tìm thấy prompt gốc');
            }

            // Create a copy with modified title if provided
            const inputParameters = originalPrompt.inputParameters as Record<string, unknown>;
            if (newTitle && typeof inputParameters === 'object') {
                inputParameters.lessonName = newTitle;
            }

            const duplicatedPrompt = await this.personalLibrary.savePrompt({
                userId,
                inputParameters,
                generatedText: originalPrompt.generatedText,
                targetTool: originalPrompt.targetTool,
                isShared: false, // Duplicated prompts are private by default
                tags: [...originalPrompt.tags, '#Sao chép'],
            });

            return duplicatedPrompt;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            console.error('Failed to duplicate prompt:', error);
            throw new DatabaseError('Không thể sao chép prompt');
        }
    }

    /**
     * Add tags to a prompt
     */
    async addTags(promptId: string, userId: string, newTags: string[]): Promise<GeneratedPrompt> {
        try {
            const existingPrompt = await prisma.generatedPrompt.findUnique({
                where: { id: promptId },
            });

            if (!existingPrompt) {
                throw new NotFoundError('Không tìm thấy prompt');
            }

            if (existingPrompt.userId !== userId) {
                throw new UnauthorizedError('Không có quyền chỉnh sửa prompt này');
            }

            // Merge tags and remove duplicates
            const updatedTags = [...new Set([...existingPrompt.tags, ...newTags])];

            const updatedPrompt = await prisma.generatedPrompt.update({
                where: { id: promptId },
                data: {
                    tags: updatedTags,
                },
            });

            return {
                ...updatedPrompt,
                inputParameters: updatedPrompt.inputParameters as Record<string, unknown>,
            };
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof UnauthorizedError) {
                throw error;
            }
            console.error('Failed to add tags:', error);
            throw new DatabaseError('Không thể thêm thẻ tag');
        }
    }

    /**
     * Remove tags from a prompt
     */
    async removeTags(promptId: string, userId: string, tagsToRemove: string[]): Promise<GeneratedPrompt> {
        try {
            const existingPrompt = await prisma.generatedPrompt.findUnique({
                where: { id: promptId },
            });

            if (!existingPrompt) {
                throw new NotFoundError('Không tìm thấy prompt');
            }

            if (existingPrompt.userId !== userId) {
                throw new UnauthorizedError('Không có quyền chỉnh sửa prompt này');
            }

            // Remove specified tags
            const updatedTags = existingPrompt.tags.filter((tag: string) => !tagsToRemove.includes(tag));

            const updatedPrompt = await prisma.generatedPrompt.update({
                where: { id: promptId },
                data: {
                    tags: updatedTags,
                },
            });

            return {
                ...updatedPrompt,
                inputParameters: updatedPrompt.inputParameters as Record<string, unknown>,
            };
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof UnauthorizedError) {
                throw error;
            }
            console.error('Failed to remove tags:', error);
            throw new DatabaseError('Không thể xóa thẻ tag');
        }
    }

    /**
     * Get editing suggestions for a prompt
     */
    async getEditingSuggestions(promptId: string): Promise<EditingSuggestion[]> {
        try {
            const prompt = await prisma.generatedPrompt.findUnique({
                where: { id: promptId },
            });

            if (!prompt) {
                throw new NotFoundError('Không tìm thấy prompt');
            }

            const suggestions: EditingSuggestion[] = [];
            const content = prompt.generatedText;
            const inputParams = prompt.inputParameters as Record<string, unknown>;

            // Analyze content and provide suggestions
            if (content.length < 100) {
                suggestions.push({
                    type: 'content_length',
                    message: 'Prompt có thể quá ngắn. Hãy thêm chi tiết để AI hiểu rõ hơn yêu cầu.',
                    severity: 'warning',
                });
            }

            if (!content.includes('GDPT 2018') && !content.includes('CV 5512')) {
                suggestions.push({
                    type: 'standards_compliance',
                    message: 'Hãy thêm tham chiếu đến GDPT 2018 hoặc CV 5512 để đảm bảo tuân thủ chuẩn.',
                    severity: 'info',
                });
            }

            if (inputParams.gradeLevel && !content.includes(`lớp ${inputParams.gradeLevel}`)) {
                suggestions.push({
                    type: 'grade_level',
                    message: `Hãy đề cập rõ khối lớp ${inputParams.gradeLevel} trong prompt.`,
                    severity: 'info',
                });
            }

            if (prompt.tags.length === 0) {
                suggestions.push({
                    type: 'tags',
                    message: 'Thêm thẻ tag để dễ dàng tìm kiếm và phân loại prompt.',
                    severity: 'info',
                });
            }

            return suggestions;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            console.error('Failed to get editing suggestions:', error);
            throw new DatabaseError('Không thể lấy gợi ý chỉnh sửa');
        }
    }

    /**
     * Validate input parameters based on their structure
     */
    private validateInputParameters(parameters: Record<string, unknown>): void {
        if (!parameters || typeof parameters !== 'object') {
            throw new ValidationError('Tham số đầu vào không hợp lệ');
        }

        // Basic validation - can be extended based on specific parameter types
        if (parameters.gradeLevel && ![6, 7, 8, 9].includes(parameters.gradeLevel as number)) {
            throw new ValidationError('Khối lớp phải từ 6 đến 9');
        }

        if (parameters.subject && typeof parameters.subject !== 'string') {
            throw new ValidationError('Môn học phải là chuỗi ký tự');
        }

        if (parameters.lessonName && typeof parameters.lessonName !== 'string') {
            throw new ValidationError('Tên bài học phải là chuỗi ký tự');
        }
    }

    /**
     * Apply a specific refinement to prompt content
     */
    private applyRefinement(content: string, refinement: PromptRefinement): string {
        switch (refinement.type) {
            case 'add_context':
                return `${content}\n\nBối cảnh bổ sung: ${refinement.value}`;

            case 'improve_clarity':
                return content.replace(/\b(hãy|vui lòng)\b/gi, 'Yêu cầu cụ thể:');

            case 'add_examples':
                return `${content}\n\nVí dụ tham khảo: ${refinement.value}`;

            case 'enhance_structure':
                return this.enhanceStructure(content);

            case 'add_constraints':
                return `${content}\n\nRàng buộc: ${refinement.value}`;

            default:
                return content;
        }
    }

    /**
     * Enhance the structure of prompt content
     */
    private enhanceStructure(content: string): string {
        // Add clear sections if not present
        if (!content.includes('Mục tiêu:') && !content.includes('Yêu cầu:')) {
            return `Mục tiêu: Tạo nội dung giáo dục chất lượng cao\n\nYêu cầu cụ thể:\n${content}\n\nĐịnh dạng đầu ra: Cấu trúc rõ ràng, dễ hiểu`;
        }
        return content;
    }
}

// Types for prompt editing and refinement
export interface PromptRefinement {
    type: 'add_context' | 'improve_clarity' | 'add_examples' | 'enhance_structure' | 'add_constraints';
    value?: string;
}

export interface EditingSuggestion {
    type: 'content_length' | 'standards_compliance' | 'grade_level' | 'tags' | 'structure' | 'clarity';
    message: string;
    severity: 'info' | 'warning' | 'error';
}