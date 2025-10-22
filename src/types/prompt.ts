import { z } from 'zod';
import { VIETNAMESE_SUBJECTS, GRADE_LEVELS, type GradeLevel, type VietnameseSubject } from './user';

// Core prompt-related types
export enum TargetAITool {
    CHATGPT = 'chatgpt',
    GEMINI = 'gemini',
    COPILOT = 'copilot',
    CANVA_AI = 'canva-ai',
    GAMMA_APP = 'gamma-app'
}

export interface LessonPlanInput {
    subject: string;
    gradeLevel: GradeLevel;
    lessonName: string;
    pedagogicalStandard: string;
    outputFormat: 'four-column' | 'five-column';
    targetTool: TargetAITool;
}

export interface PresentationInput {
    subject: string;
    gradeLevel: GradeLevel;
    lessonName: string;
    curriculumContent: string;
    slideCount: number;
    targetTool: TargetAITool;
}

export interface AssessmentInput {
    subject: string;
    gradeLevel: GradeLevel;
    topic: string;
    questionCount: number;
    bloomLevels: BloomTaxonomyLevel[];
    questionType: 'multiple-choice' | 'short-answer' | 'essay';
    targetTool: TargetAITool;
}

export interface GeneratedPrompt {
    id: string;
    userId?: string;
    inputParameters: Record<string, unknown>;
    generatedText: string;
    targetTool: string;
    createdAt: Date;
    isShared: boolean;
    tags: string[];
    user?: {
        name: string;
        email: string;
    };
}

export interface PromptVersion {
    id: string;
    promptId: string;
    version: number;
    content: string;
    createdAt: Date;
}

// Bloom's Taxonomy levels for Vietnamese education
export enum BloomTaxonomyLevel {
    RECOGNITION = 'recognition',      // Nhận biết
    COMPREHENSION = 'comprehension',  // Thông hiểu
    APPLICATION = 'application',      // Vận dụng
    ANALYSIS = 'analysis',           // Phân tích
    SYNTHESIS = 'synthesis',         // Tổng hợp
    EVALUATION = 'evaluation'        // Đánh giá
}

// Zod validation schemas
export const TargetAIToolSchema = z.nativeEnum(TargetAITool);
export const BloomTaxonomyLevelSchema = z.nativeEnum(BloomTaxonomyLevel);

export const LessonPlanInputSchema = z.object({
    subject: z.string().min(1, 'Vui lòng chọn môn học'),
    gradeLevel: z.union([z.literal(6), z.literal(7), z.literal(8), z.literal(9)]),
    lessonName: z.string().min(1, 'Tên bài học không được để trống').max(200, 'Tên bài học quá dài'),
    pedagogicalStandard: z.string().min(1, 'Vui lòng chọn chuẩn sư phạm'),
    outputFormat: z.enum(['four-column', 'five-column']),
    targetTool: TargetAIToolSchema,
});

export const PresentationInputSchema = z.object({
    subject: z.string().min(1, 'Vui lòng chọn môn học'),
    gradeLevel: z.union([z.literal(6), z.literal(7), z.literal(8), z.literal(9)]),
    lessonName: z.string().min(1, 'Tên bài học không được để trống').max(200, 'Tên bài học quá dài'),
    curriculumContent: z.string().min(10, 'Nội dung chương trình quá ngắn').max(5000, 'Nội dung chương trình quá dài'),
    slideCount: z.number().min(3, 'Số slide tối thiểu là 3').max(20, 'Số slide tối đa là 20'),
    targetTool: TargetAIToolSchema,
});

export const AssessmentInputSchema = z.object({
    subject: z.string().min(1, 'Vui lòng chọn môn học'),
    gradeLevel: z.union([z.literal(6), z.literal(7), z.literal(8), z.literal(9)]),
    topic: z.string().min(1, 'Chủ đề không được để trống').max(200, 'Chủ đề quá dài'),
    questionCount: z.number().min(1, 'Số câu hỏi tối thiểu là 1').max(50, 'Số câu hỏi tối đa là 50'),
    bloomLevels: z.array(BloomTaxonomyLevelSchema).min(1, 'Phải chọn ít nhất một mức độ tư duy'),
    questionType: z.enum(['multiple-choice', 'short-answer', 'essay']),
    targetTool: TargetAIToolSchema,
});

export const GeneratedPromptSchema = z.object({
    id: z.string(),
    userId: z.string(),
    inputParameters: z.record(z.string(), z.unknown()),
    generatedText: z.string().min(1, 'Nội dung prompt không được để trống'),
    targetTool: TargetAIToolSchema,
    createdAt: z.date(),
    isShared: z.boolean(),
    tags: z.array(z.string()),
});

export const CreateGeneratedPromptSchema = z.object({
    userId: z.string(),
    inputParameters: z.record(z.string(), z.unknown()),
    generatedText: z.string().min(1, 'Nội dung prompt không được để trống'),
    targetTool: TargetAIToolSchema,
    isShared: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
});

export const PromptVersionSchema = z.object({
    id: z.string(),
    promptId: z.string(),
    version: z.number().positive(),
    content: z.string().min(1, 'Nội dung phiên bản không được để trống'),
    createdAt: z.date(),
});

// Vietnamese pedagogical standards
export const PEDAGOGICAL_STANDARDS = ['GDPT 2018', 'CV 5512'] as const;
export type PedagogicalStandard = typeof PEDAGOGICAL_STANDARDS[number];

// Common Vietnamese educational tags
export const COMMON_TAGS = [
    '#Chuẩn5512',
    '#GDPT2018',
    '#SángTạo',
    '#HoạtĐộngMới',
    '#DạyHọcTíchCực',
    '#PhátTriểnNăngLực',
    '#TổChứcHoạtĐộng',
    '#ĐánhGiáHọcSinh'
] as const;