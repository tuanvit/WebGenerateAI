import { z } from 'zod';
import type { GradeLevel, VietnameseSubject } from './user';
import { TargetAITool, BloomTaxonomyLevel } from './prompt';

// API request and response types

// Prompt Generation API
export interface GeneratePromptRequest {
    type: 'lesson-plan' | 'presentation' | 'assessment';
    subject: VietnameseSubject;
    gradeLevel: GradeLevel;
    lessonName: string;
    targetTool: TargetAITool;
    // Additional fields based on type
    pedagogicalStandard?: string;
    outputFormat?: 'four-column' | 'five-column';
    curriculumContent?: string;
    slideCount?: number;
    topic?: string;
    questionCount?: number;
    bloomLevels?: BloomTaxonomyLevel[];
    questionType?: 'multiple-choice' | 'short-answer' | 'essay';
}

export interface GeneratePromptResponse {
    id: string;
    generatedText: string;
    inputParameters: Record<string, unknown>;
    targetTool: TargetAITool;
    tags: string[];
}

// Community Library API
export interface SearchContentRequest {
    subject?: VietnameseSubject;
    gradeLevel?: GradeLevel;
    topic?: string;
    tags?: string[];
    rating?: number;
    author?: string;
    page?: number;
    limit?: number;
}

export interface ShareContentRequest {
    title: string;
    description: string;
    content: string;
    subject: VietnameseSubject;
    gradeLevel: GradeLevel;
    tags: string[];
}

export interface RateContentRequest {
    contentId: string;
    rating: number;
}

// Personal Library API
export interface SavePromptRequest {
    promptId: string;
    tags?: string[];
}

export interface UpdatePromptRequest {
    title?: string;
    tags?: string[];
    isShared?: boolean;
}

export interface GetPromptsRequest {
    subject?: VietnameseSubject;
    gradeLevel?: GradeLevel;
    tags?: string[];
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}

// User Management API
export interface UpdateUserProfileRequest {
    name?: string;
    school?: string;
    subjects?: VietnameseSubject[];
    gradeLevel?: GradeLevel[];
}

// AI Tool Integration API
export interface GetToolUrlRequest {
    tool: TargetAITool;
    prompt: string;
}

export interface GetToolUrlResponse {
    url: string;
    instructions: string;
    supportsDirectAccess: boolean;
}

// Zod validation schemas for API requests
export const GeneratePromptRequestSchema = z.object({
    type: z.enum(['lesson-plan', 'presentation', 'assessment']),
    subject: z.string(),
    gradeLevel: z.number().min(6).max(9),
    lessonName: z.string().min(1, 'Tên bài học không được để trống'),
    targetTool: z.nativeEnum(TargetAITool),
    pedagogicalStandard: z.string().optional(),
    outputFormat: z.enum(['four-column', 'five-column']).optional(),
    curriculumContent: z.string().optional(),
    slideCount: z.number().min(3).max(20).optional(),
    topic: z.string().optional(),
    questionCount: z.number().min(1).max(50).optional(),
    bloomLevels: z.array(z.nativeEnum(BloomTaxonomyLevel)).optional(),
    questionType: z.enum(['multiple-choice', 'short-answer', 'essay']).optional(),
});

export const SearchContentRequestSchema = z.object({
    subject: z.string().optional(),
    gradeLevel: z.number().min(6).max(9).optional(),
    topic: z.string().max(100).optional(),
    tags: z.array(z.string()).optional(),
    rating: z.number().min(1).max(5).optional(),
    author: z.string().max(100).optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(50).default(20),
});

export const ShareContentRequestSchema = z.object({
    title: z.string().min(1, 'Tiêu đề không được để trống').max(200),
    description: z.string().min(1, 'Mô tả không được để trống').max(500),
    content: z.string().min(10, 'Nội dung quá ngắn').max(10000),
    subject: z.string(),
    gradeLevel: z.number().min(6).max(9),
    tags: z.array(z.string()).max(10),
});

export const RateContentRequestSchema = z.object({
    contentId: z.string(),
    rating: z.number().min(1).max(5),
});

export const UpdateUserProfileRequestSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    school: z.string().max(200).optional(),
    subjects: z.array(z.string()).optional(),
    gradeLevel: z.array(z.number().min(6).max(9)).optional(),
});

export const GetToolUrlRequestSchema = z.object({
    tool: z.nativeEnum(TargetAITool),
    prompt: z.string().min(1, 'Prompt không được để trống'),
});