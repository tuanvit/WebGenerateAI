import { z } from 'zod';
import type {
    LessonPlanInput,
    PresentationInput,
    AssessmentInput,
    GeneratedPrompt,
    TargetAITool
} from './prompt';
import type {
    SharedContent,
    SearchFilters,
    LibraryFilters,
    ShareableContent
} from './content';

// Service interfaces for business logic layer

export interface PromptGeneratorService {
    generateLessonPlanPrompt(input: LessonPlanInput): Promise<GeneratedPrompt>;
    generatePresentationPrompt(input: PresentationInput): Promise<GeneratedPrompt>;
    generateAssessmentPrompt(input: AssessmentInput): Promise<GeneratedPrompt>;
    optimizeForTargetTool(prompt: string, tool: TargetAITool): string;
}

export interface AIToolIntegration {
    openWithPrompt(tool: TargetAITool, prompt: string): Promise<void>;
    copyToClipboard(prompt: string): Promise<void>;
    formatForTool(prompt: string, tool: TargetAITool): string;
    getToolUrl(tool: TargetAITool): string;
}

export interface CommunityLibraryService {
    searchContent(filters: SearchFilters): Promise<SharedContent[]>;
    shareContent(content: ShareableContent): Promise<SharedContent>;
    rateContent(contentId: string, userId: string, rating: number): Promise<void>;
    saveToPersonalLibrary(contentId: string, userId: string): Promise<void>;
    getPopularContent(limit?: number): Promise<SharedContent[]>;
    getRecentContent(limit?: number): Promise<SharedContent[]>;
}

export interface PersonalLibraryService {
    savePrompt(prompt: Omit<GeneratedPrompt, 'id' | 'createdAt'>): Promise<GeneratedPrompt>;
    getPrompts(userId: string, filters?: LibraryFilters): Promise<GeneratedPrompt[]>;
    updatePrompt(promptId: string, updates: Partial<GeneratedPrompt>): Promise<GeneratedPrompt>;
    deletePrompt(promptId: string, userId: string): Promise<void>;
    getVersionHistory(promptId: string): Promise<PromptVersion[]>;
    createVersion(promptId: string, content: string): Promise<PromptVersion>;
}

export interface PromptVersion {
    id: string;
    promptId: string;
    version: number;
    content: string;
    createdAt: Date;
}

// API Response types
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Error types
export class ValidationError extends Error {
    constructor(
        message: string,
        public field?: string,
        public code?: string
    ) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class NotFoundError extends Error {
    constructor(message: string = 'Không tìm thấy tài nguyên') {
        super(message);
        this.name = 'NotFoundError';
    }
}

export class UnauthorizedError extends Error {
    constructor(message: string = 'Không có quyền truy cập') {
        super(message);
        this.name = 'UnauthorizedError';
    }
}

export class DatabaseError extends Error {
    constructor(message: string = 'Lỗi cơ sở dữ liệu') {
        super(message);
        this.name = 'DatabaseError';
    }
}

// Zod schemas for API validation
export const ApiResponseSchema = z.object({
    success: z.boolean(),
    data: z.unknown().optional(),
    error: z.string().optional(),
    message: z.string().optional(),
});

export const PaginationSchema = z.object({
    page: z.number().min(1, 'Trang phải lớn hơn 0'),
    limit: z.number().min(1, 'Giới hạn phải lớn hơn 0').max(100, 'Giới hạn tối đa là 100'),
    total: z.number().min(0),
    totalPages: z.number().min(0),
});

export const PaginatedResponseSchema = z.object({
    data: z.array(z.unknown()),
    pagination: PaginationSchema,
});