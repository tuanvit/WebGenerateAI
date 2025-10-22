import {
    LessonPlanInput,
    PresentationInput,
    AssessmentInput,
    GeneratedPrompt,
    TargetAITool,
    BloomTaxonomyLevel,
    LessonPlanInputSchema,
    PresentationInputSchema,
    AssessmentInputSchema
} from '../../types/prompt';
import { LessonPlanTemplates } from './templates/LessonPlanTemplates';
import { PresentationTemplates } from './templates/PresentationTemplates';
import { AssessmentTemplates } from './templates/AssessmentTemplates';
import { cacheService, generatePromptHash } from '../../lib/cache';

export class PromptGeneratorService {
    /**
     * Generate AI prompt for lesson plan creation
     */
    async generateLessonPlanPrompt(input: LessonPlanInput): Promise<GeneratedPrompt> {
        // Validate input
        const validatedInput = LessonPlanInputSchema.parse(input);

        // Check cache first
        const cacheKey = generatePromptHash({ ...validatedInput, type: 'lesson-plan' });
        const cached = await cacheService.getCachedPrompt(cacheKey);

        if (cached) {
            return {
                ...cached,
                createdAt: new Date(cached.createdAt), // Ensure Date object
            };
        }

        const prompt = this.buildLessonPlanPrompt(validatedInput);
        const optimizedPrompt = this.optimizeForTargetTool(prompt, validatedInput.targetTool);

        const result: GeneratedPrompt = {
            id: this.generateId(),
            userId: '', // Will be set by calling service
            inputParameters: validatedInput,
            generatedText: optimizedPrompt,
            targetTool: validatedInput.targetTool,
            createdAt: new Date(),
            isShared: false,
            tags: this.generateTags('lesson-plan', validatedInput.subject, validatedInput.gradeLevel)
        };

        // Cache the result
        await cacheService.cachePrompt(cacheKey, result);

        return result;
    }

    /**
     * Generate AI prompt for presentation outline creation
     */
    async generatePresentationPrompt(input: PresentationInput): Promise<GeneratedPrompt> {
        // Validate input
        const validatedInput = PresentationInputSchema.parse(input);

        // Check cache first
        const cacheKey = generatePromptHash({ ...validatedInput, type: 'presentation' });
        const cached = await cacheService.getCachedPrompt(cacheKey);

        if (cached) {
            return {
                ...cached,
                createdAt: new Date(cached.createdAt),
            };
        }

        const prompt = this.buildPresentationPrompt(validatedInput);
        const optimizedPrompt = this.optimizeForTargetTool(prompt, validatedInput.targetTool);

        const result: GeneratedPrompt = {
            id: this.generateId(),
            userId: '', // Will be set by calling service
            inputParameters: validatedInput,
            generatedText: optimizedPrompt,
            targetTool: validatedInput.targetTool,
            createdAt: new Date(),
            isShared: false,
            tags: this.generateTags('presentation', validatedInput.subject, validatedInput.gradeLevel)
        };

        // Cache the result
        await cacheService.cachePrompt(cacheKey, result);

        return result;
    }

    /**
     * Generate AI prompt for assessment question creation
     */
    async generateAssessmentPrompt(input: AssessmentInput): Promise<GeneratedPrompt> {
        // Validate input
        const validatedInput = AssessmentInputSchema.parse(input);

        // Check cache first
        const cacheKey = generatePromptHash({ ...validatedInput, type: 'assessment' });
        const cached = await cacheService.getCachedPrompt(cacheKey);

        if (cached) {
            return {
                ...cached,
                createdAt: new Date(cached.createdAt),
            };
        }

        const prompt = this.buildAssessmentPrompt(validatedInput);
        const optimizedPrompt = this.optimizeForTargetTool(prompt, validatedInput.targetTool);

        const result: GeneratedPrompt = {
            id: this.generateId(),
            userId: '', // Will be set by calling service
            inputParameters: validatedInput,
            generatedText: optimizedPrompt,
            targetTool: validatedInput.targetTool,
            createdAt: new Date(),
            isShared: false,
            tags: this.generateTags('assessment', validatedInput.subject, validatedInput.gradeLevel)
        };

        // Cache the result
        await cacheService.cachePrompt(cacheKey, result);

        return result;
    }

    /**
     * Optimize prompt format for specific AI tool
     */
    optimizeForTargetTool(prompt: string, tool: TargetAITool): string {
        switch (tool) {
            case TargetAITool.CHATGPT:
                return this.optimizeForChatGPT(prompt);
            case TargetAITool.GEMINI:
                return this.optimizeForGemini(prompt);
            case TargetAITool.COPILOT:
                return this.optimizeForCopilot(prompt);
            case TargetAITool.CANVA_AI:
                return this.optimizeForCanvaAI(prompt);
            case TargetAITool.GAMMA_APP:
                return this.optimizeForGammaApp(prompt);
            default:
                return prompt;
        }
    }

    /**
     * Build lesson plan prompt based on input parameters using specialized templates
     */
    private buildLessonPlanPrompt(input: LessonPlanInput): string {
        if (input.outputFormat === 'four-column') {
            return LessonPlanTemplates.generateFourColumnTemplate(input);
        } else {
            return LessonPlanTemplates.generateFiveColumnTemplate(input);
        }
    }

    /**
     * Build presentation prompt based on input parameters using specialized template
     */
    private buildPresentationPrompt(input: PresentationInput): string {
        return PresentationTemplates.generatePresentationTemplate(input);
    }

    /**
     * Build assessment prompt based on input parameters using specialized template
     */
    private buildAssessmentPrompt(input: AssessmentInput): string {
        return AssessmentTemplates.generateAssessmentTemplate(input);
    }

    // Helper methods for role definitions





    // Helper methods for format instructions



    // Helper methods for pedagogical content



    // Tool-specific optimization methods
    private optimizeForChatGPT(prompt: string): string {
        return `${prompt}

**LưU Ý QUAN TRỌNG:** Vui lòng trả lời bằng tiếng Việt và tuân thủ chặt chẽ các yêu cầu trên.`;
    }

    private optimizeForGemini(prompt: string): string {
        return `${prompt}

**Hướng dẫn sử dụng:** Sao chép prompt này vào Gemini và yêu cầu trả lời bằng tiếng Việt.`;
    }

    private optimizeForCopilot(prompt: string): string {
        return `${prompt}

**Ghi chú:** Prompt này được tối ưu cho Microsoft Copilot. Vui lòng đảm bảo ngôn ngữ xuất là tiếng Việt.`;
    }

    private optimizeForCanvaAI(prompt: string): string {
        return `${prompt}

**Hướng dẫn cho Canva AI:** Sử dụng prompt này để tạo nội dung, sau đó áp dụng vào thiết kế slide trong Canva.`;
    }

    private optimizeForGammaApp(prompt: string): string {
        return `${prompt}

**Hướng dẫn cho Gamma:** Prompt này được thiết kế để tạo nội dung presentation. Sao chép và dán vào Gamma để tạo slide tự động.`;
    }

    // Utility methods
    private generateId(): string {
        return `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateTags(type: string, subject: string, gradeLevel: number): string[] {
        const baseTags = ['#GDPT2018', '#Chuẩn5512'];
        const typeTags = {
            'lesson-plan': ['#KếHoạchBàiDạy', '#TổChứcHoạtĐộng'],
            'presentation': ['#ThuyếtTrình', '#SlideGiảngDạy'],
            'assessment': ['#ĐánhGiá', '#CâuHỏi']
        };

        return [
            ...baseTags,
            ...(typeTags[type as keyof typeof typeTags] || []),
            `#${subject}`,
            `#Lớp${gradeLevel}`
        ];
    }

    // Cache management methods
    async clearCache(): Promise<void> {
        await cacheService.invalidatePattern('ai-prompt:prompt:*');
    }

    async getCacheStats(): Promise<{ hits: number; misses: number }> {
        // This would require implementing cache statistics in the cache service
        // For now, return placeholder values
        return { hits: 0, misses: 0 };
    }
}