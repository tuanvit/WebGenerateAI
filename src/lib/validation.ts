import { BloomTaxonomyLevel, PEDAGOGICAL_STANDARDS, TargetAITool } from '@/types/prompt';
import { GRADE_LEVELS, VIETNAMESE_SUBJECTS, type VietnameseSubject } from '@/types/user';
import { z } from 'zod';
import { VIETNAMESE_ERROR_MESSAGES } from './error-handling';

// Educational standards validation
export const GDPT_2018_KEYWORDS = [
    'năng lực',
    'phẩm chất',
    'tích hợp',
    'hoạt động trải nghiệm',
    'học tập tích cực',
    'phát triển toàn diện',
    'giáo dục hướng nghiệp',
    'giáo dục kỹ năng sống'
] as const;

export const CV_5512_KEYWORDS = [
    'mục tiêu bài học',
    'nội dung bài học',
    'phương pháp dạy học',
    'hoạt động dạy học',
    'đánh giá kết quả',
    'tổ chức hoạt động',
    'phương tiện dạy học',
    'thời gian thực hiện'
] as const;

// Enhanced validation schemas with Vietnamese error messages
export const EnhancedGradeLevelSchema = z
    .union([z.literal(6), z.literal(7), z.literal(8), z.literal(9)])
    .refine((val) => GRADE_LEVELS.includes(val), {
        message: VIETNAMESE_ERROR_MESSAGES.invalid_grade_level
    });

export const EnhancedSubjectSchema = z
    .string()
    .min(1, VIETNAMESE_ERROR_MESSAGES.required)
    .refine((val) => VIETNAMESE_SUBJECTS.includes(val as VietnameseSubject), {
        message: VIETNAMESE_ERROR_MESSAGES.invalid_subject
    });

export const EnhancedPedagogicalStandardSchema = z
    .string()
    .min(1, VIETNAMESE_ERROR_MESSAGES.required)
    .refine((val) => PEDAGOGICAL_STANDARDS.includes(val as any), {
        message: VIETNAMESE_ERROR_MESSAGES.invalid_pedagogical_standard
    });

export const EnhancedLessonNameSchema = z
    .string()
    .min(1, VIETNAMESE_ERROR_MESSAGES.lesson_name_required)
    .max(200, VIETNAMESE_ERROR_MESSAGES.lesson_name_too_long)
    .refine((val) => val.trim().length > 0, {
        message: VIETNAMESE_ERROR_MESSAGES.lesson_name_required
    });

export const EnhancedCurriculumContentSchema = z
    .string()
    .min(10, VIETNAMESE_ERROR_MESSAGES.curriculum_content_too_short)
    .max(5000, VIETNAMESE_ERROR_MESSAGES.curriculum_content_too_long)
    .refine((val) => val.trim().length >= 10, {
        message: VIETNAMESE_ERROR_MESSAGES.curriculum_content_too_short
    });

export const EnhancedTopicSchema = z
    .string()
    .min(1, VIETNAMESE_ERROR_MESSAGES.topic_required)
    .max(200, VIETNAMESE_ERROR_MESSAGES.topic_too_long)
    .refine((val) => val.trim().length > 0, {
        message: VIETNAMESE_ERROR_MESSAGES.topic_required
    });

export const EnhancedSlideCountSchema = z
    .number()
    .min(3, VIETNAMESE_ERROR_MESSAGES.invalid_slide_count)
    .max(20, VIETNAMESE_ERROR_MESSAGES.invalid_slide_count)
    .int('Số slide phải là số nguyên');

export const EnhancedQuestionCountSchema = z
    .number()
    .min(1, VIETNAMESE_ERROR_MESSAGES.invalid_question_count)
    .max(50, VIETNAMESE_ERROR_MESSAGES.invalid_question_count)
    .int('Số câu hỏi phải là số nguyên');

export const EnhancedBloomLevelsSchema = z
    .array(z.nativeEnum(BloomTaxonomyLevel))
    .min(1, VIETNAMESE_ERROR_MESSAGES.bloom_levels_required)
    .refine((levels) => levels.length > 0, {
        message: VIETNAMESE_ERROR_MESSAGES.bloom_levels_required
    });

// Enhanced input schemas with comprehensive validation
export const EnhancedLessonPlanInputSchema = z.object({
    subject: EnhancedSubjectSchema,
    gradeLevel: EnhancedGradeLevelSchema,
    lessonName: EnhancedLessonNameSchema,
    pedagogicalStandard: EnhancedPedagogicalStandardSchema,
    outputFormat: z.enum(['four-column', 'five-column'], {
        errorMap: () => ({ message: 'Định dạng kế hoạch bài dạy phải là 4 cột hoặc 5 cột' })
    }),
    targetTool: z.nativeEnum(TargetAITool, {
        errorMap: () => ({ message: 'Công cụ AI không hợp lệ' })
    }),
});

export const EnhancedPresentationInputSchema = z.object({
    subject: EnhancedSubjectSchema,
    gradeLevel: EnhancedGradeLevelSchema,
    lessonName: EnhancedLessonNameSchema,
    curriculumContent: EnhancedCurriculumContentSchema,
    slideCount: EnhancedSlideCountSchema,
    targetTool: z.nativeEnum(TargetAITool, {
        errorMap: () => ({ message: 'Công cụ AI không hợp lệ' })
    }),
});

export const EnhancedAssessmentInputSchema = z.object({
    subject: EnhancedSubjectSchema,
    gradeLevel: EnhancedGradeLevelSchema,
    topic: EnhancedTopicSchema,
    questionCount: EnhancedQuestionCountSchema,
    bloomLevels: EnhancedBloomLevelsSchema,
    questionType: z.enum(['multiple-choice', 'short-answer', 'essay'], {
        errorMap: () => ({ message: 'Loại câu hỏi không hợp lệ' })
    }),
    targetTool: z.nativeEnum(TargetAITool, {
        errorMap: () => ({ message: 'Công cụ AI không hợp lệ' })
    }),
});

// Validation functions for educational standards compliance
export function validateGDPT2018Compliance(content: string): {
    isCompliant: boolean;
    missingKeywords: string[];
    suggestions: string[];
} {
    const contentLower = content.toLowerCase();
    const missingKeywords: string[] = [];
    const suggestions: string[] = [];

    // Check for GDPT 2018 keywords
    GDPT_2018_KEYWORDS.forEach(keyword => {
        if (!contentLower.includes(keyword)) {
            missingKeywords.push(keyword);
        }
    });

    // Provide suggestions based on missing keywords
    if (missingKeywords.includes('năng lực')) {
        suggestions.push('Bổ sung mục tiêu phát triển năng lực cụ thể cho học sinh');
    }
    if (missingKeywords.includes('hoạt động trải nghiệm')) {
        suggestions.push('Thêm các hoạt động trải nghiệm thực tế cho học sinh');
    }
    if (missingKeywords.includes('học tập tích cực')) {
        suggestions.push('Tích hợp phương pháp học tập tích cực vào bài học');
    }

    return {
        isCompliant: missingKeywords.length <= 2, // Allow some flexibility
        missingKeywords,
        suggestions
    };
}

export function validateCV5512Compliance(content: string): {
    isCompliant: boolean;
    missingComponents: string[];
    suggestions: string[];
} {
    const contentLower = content.toLowerCase();
    const missingComponents: string[] = [];
    const suggestions: string[] = [];

    // Check for CV 5512 required components
    CV_5512_KEYWORDS.forEach(component => {
        if (!contentLower.includes(component)) {
            missingComponents.push(component);
        }
    });

    // Provide suggestions based on missing components
    if (missingComponents.includes('mục tiêu bài học')) {
        suggestions.push('Bổ sung mục tiêu bài học rõ ràng và cụ thể');
    }
    if (missingComponents.includes('phương pháp dạy học')) {
        suggestions.push('Xác định phương pháp dạy học phù hợp với nội dung');
    }
    if (missingComponents.includes('đánh giá kết quả')) {
        suggestions.push('Thêm phương pháp đánh giá kết quả học tập');
    }

    return {
        isCompliant: missingComponents.length <= 3, // Allow some flexibility
        missingComponents,
        suggestions
    };
}

// Pedagogical terminology validation
export const VALID_PEDAGOGICAL_TERMS = [
    'mục tiêu',
    'năng lực',
    'phẩm chất',
    'kiến thức',
    'kỹ năng',
    'thái độ',
    'phương pháp',
    'hoạt động',
    'đánh giá',
    'tổ chức',
    'phương tiện',
    'thời gian'
] as const;

export function validatePedagogicalTerminology(content: string): {
    isValid: boolean;
    foundTerms: string[];
    suggestions: string[];
} {
    const contentLower = content.toLowerCase();
    const foundTerms: string[] = [];
    const suggestions: string[] = [];

    VALID_PEDAGOGICAL_TERMS.forEach(term => {
        if (contentLower.includes(term)) {
            foundTerms.push(term);
        }
    });

    if (foundTerms.length < 3) {
        suggestions.push('Sử dụng thêm thuật ngữ sư phạm chuyên nghiệp');
        suggestions.push('Bổ sung các khái niệm về mục tiêu, phương pháp, và đánh giá');
    }

    return {
        isValid: foundTerms.length >= 3,
        foundTerms,
        suggestions
    };
}

// Real-time validation for forms
export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
    warnings: Record<string, string>;
}

export function validateLessonPlanInput(input: Partial<any>): ValidationResult {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    try {
        EnhancedLessonPlanInputSchema.parse(input);
    } catch (error) {
        if (error instanceof z.ZodError) {
            error.errors.forEach(err => {
                const field = err.path.join('.');
                errors[field] = err.message;
            });
        }
    }

    // Additional educational standards validation
    if (input.lessonName && typeof input.lessonName === 'string') {
        const gdptCompliance = validateGDPT2018Compliance(input.lessonName);
        if (!gdptCompliance.isCompliant) {
            warnings.lessonName = 'Tên bài học nên phản ánh tinh thần GDPT 2018';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        warnings
    };
}

export function validatePresentationInput(input: Partial<any>): ValidationResult {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    try {
        EnhancedPresentationInputSchema.parse(input);
    } catch (error) {
        if (error instanceof z.ZodError) {
            error.errors.forEach(err => {
                const field = err.path.join('.');
                errors[field] = err.message;
            });
        }
    }

    // Additional validation for curriculum content
    if (input.curriculumContent && typeof input.curriculumContent === 'string') {
        const cv5512Compliance = validateCV5512Compliance(input.curriculumContent);
        if (!cv5512Compliance.isCompliant) {
            warnings.curriculumContent = 'Nội dung nên tuân thủ cấu trúc Công văn 5512';
        }

        const terminology = validatePedagogicalTerminology(input.curriculumContent);
        if (!terminology.isValid) {
            warnings.curriculumContent = warnings.curriculumContent
                ? warnings.curriculumContent + '. Sử dụng thêm thuật ngữ sư phạm chuyên nghiệp'
                : 'Sử dụng thêm thuật ngữ sư phạm chuyên nghiệp';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        warnings
    };
}

export function validateAssessmentInput(input: Partial<any>): ValidationResult {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    try {
        EnhancedAssessmentInputSchema.parse(input);
    } catch (error) {
        if (error instanceof z.ZodError) {
            error.errors.forEach(err => {
                const field = err.path.join('.');
                errors[field] = err.message;
            });
        }
    }

    // Validate Bloom's taxonomy distribution
    if (input.bloomLevels && Array.isArray(input.bloomLevels)) {
        const hasLowerOrder = input.bloomLevels.some((level: BloomTaxonomyLevel) =>
            [BloomTaxonomyLevel.RECOGNITION, BloomTaxonomyLevel.COMPREHENSION].includes(level)
        );
        const hasHigherOrder = input.bloomLevels.some((level: BloomTaxonomyLevel) =>
            [BloomTaxonomyLevel.ANALYSIS, BloomTaxonomyLevel.SYNTHESIS, BloomTaxonomyLevel.EVALUATION].includes(level)
        );

        if (!hasLowerOrder) {
            warnings.bloomLevels = 'Nên bao gồm cả câu hỏi nhận biết và thông hiểu';
        }
        if (!hasHigherOrder && input.gradeLevel && input.gradeLevel >= 8) {
            warnings.bloomLevels = 'Với lớp 8-9, nên có câu hỏi tư duy bậc cao';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        warnings
    };
}

// Rate limiting validation
export interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    message: string;
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
    prompt_generation: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 10,
        message: 'Quá nhiều yêu cầu tạo prompt. Vui lòng thử lại sau 1 phút'
    },
    content_sharing: {
        windowMs: 5 * 60 * 1000, // 5 minutes
        maxRequests: 5,
        message: 'Quá nhiều yêu cầu chia sẻ nội dung. Vui lòng thử lại sau 5 phút'
    },
    library_operations: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 20,
        message: 'Quá nhiều thao tác với thư viện. Vui lòng thử lại sau 1 phút'
    }
};