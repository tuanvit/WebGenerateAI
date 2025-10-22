import {
    GDPT_2018_KEYWORDS,
    CV_5512_KEYWORDS,
    VALID_PEDAGOGICAL_TERMS,
    validateGDPT2018Compliance,
    validateCV5512Compliance,
    validatePedagogicalTerminology
} from '@/lib/validation';
import { VIETNAMESE_SUBJECTS, GRADE_LEVELS, type GradeLevel, type VietnameseSubject } from '@/types/user';
import { PEDAGOGICAL_STANDARDS, BloomTaxonomyLevel } from '@/types/prompt';
import { ValidationError } from '@/lib/error-handling';

export interface EducationalValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
    complianceScore: number; // 0-100
}

export interface StandardsComplianceReport {
    gdpt2018: {
        isCompliant: boolean;
        score: number;
        missingKeywords: string[];
        suggestions: string[];
    };
    cv5512: {
        isCompliant: boolean;
        score: number;
        missingComponents: string[];
        suggestions: string[];
    };
    terminology: {
        isValid: boolean;
        score: number;
        foundTerms: string[];
        suggestions: string[];
    };
    overall: {
        score: number;
        grade: 'A' | 'B' | 'C' | 'D' | 'F';
        recommendations: string[];
    };
}

export class EducationalStandardsValidator {

    /**
     * Validate grade level restrictions (6-9 only for Vietnamese middle school)
     */
    validateGradeLevel(gradeLevel: number): EducationalValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        const suggestions: string[] = [];

        if (!GRADE_LEVELS.includes(gradeLevel as GradeLevel)) {
            errors.push(`Khối lớp ${gradeLevel} không được hỗ trợ. Hệ thống chỉ hỗ trợ lớp 6-9.`);
            suggestions.push('Vui lòng chọn khối lớp từ 6 đến 9 (THCS)');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            suggestions,
            complianceScore: errors.length === 0 ? 100 : 0
        };
    }

    /**
     * Validate Vietnamese subject selection
     */
    validateSubject(subject: string): EducationalValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        const suggestions: string[] = [];

        if (!subject || subject.trim().length === 0) {
            errors.push('Môn học không được để trống');
            suggestions.push('Vui lòng chọn một môn học từ danh sách');
        } else if (!VIETNAMESE_SUBJECTS.includes(subject as VietnameseSubject)) {
            errors.push(`Môn học "${subject}" không có trong chương trình GDPT 2018`);
            suggestions.push('Vui lòng chọn môn học từ danh sách được phê duyệt');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            suggestions,
            complianceScore: errors.length === 0 ? 100 : 0
        };
    }

    /**
     * Validate pedagogical standard compliance
     */
    validatePedagogicalStandard(standard: string): EducationalValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        const suggestions: string[] = [];

        if (!standard || standard.trim().length === 0) {
            errors.push('Chuẩn sư phạm không được để trống');
            suggestions.push('Vui lòng chọn GDPT 2018 hoặc CV 5512');
        } else if (!PEDAGOGICAL_STANDARDS.includes(standard as any)) {
            errors.push(`Chuẩn sư phạm "${standard}" không được công nhận`);
            suggestions.push('Chỉ chấp nhận GDPT 2018 và CV 5512');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            suggestions,
            complianceScore: errors.length === 0 ? 100 : 0
        };
    }

    /**
     * Validate lesson content for educational standards compliance
     */
    validateLessonContent(
        content: string,
        gradeLevel: GradeLevel,
        subject: VietnameseSubject
    ): StandardsComplianceReport {
        const gdpt2018Result = validateGDPT2018Compliance(content);
        const cv5512Result = validateCV5512Compliance(content);
        const terminologyResult = validatePedagogicalTerminology(content);

        // Calculate scores
        const gdpt2018Score = this.calculateGDPT2018Score(gdpt2018Result, content);
        const cv5512Score = this.calculateCV5512Score(cv5512Result, content);
        const terminologyScore = this.calculateTerminologyScore(terminologyResult, content);

        // Overall score calculation
        const overallScore = Math.round((gdpt2018Score + cv5512Score + terminologyScore) / 3);
        const grade = this.getGrade(overallScore);

        // Generate recommendations based on grade level and subject
        const recommendations = this.generateRecommendations(
            gradeLevel,
            subject,
            gdpt2018Result,
            cv5512Result,
            terminologyResult
        );

        return {
            gdpt2018: {
                isCompliant: gdpt2018Result.isCompliant,
                score: gdpt2018Score,
                missingKeywords: gdpt2018Result.missingKeywords,
                suggestions: gdpt2018Result.suggestions
            },
            cv5512: {
                isCompliant: cv5512Result.isCompliant,
                score: cv5512Score,
                missingComponents: cv5512Result.missingComponents,
                suggestions: cv5512Result.suggestions
            },
            terminology: {
                isValid: terminologyResult.isValid,
                score: terminologyScore,
                foundTerms: terminologyResult.foundTerms,
                suggestions: terminologyResult.suggestions
            },
            overall: {
                score: overallScore,
                grade,
                recommendations
            }
        };
    }

    /**
     * Validate Bloom's Taxonomy distribution for assessment
     */
    validateBloomTaxonomy(
        bloomLevels: BloomTaxonomyLevel[],
        gradeLevel: GradeLevel,
        questionCount: number
    ): EducationalValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        const suggestions: string[] = [];

        if (!bloomLevels || bloomLevels.length === 0) {
            errors.push('Phải chọn ít nhất một mức độ tư duy Bloom');
            suggestions.push('Chọn các mức độ phù hợp với khối lớp và mục tiêu bài học');
            return {
                isValid: false,
                errors,
                warnings,
                suggestions,
                complianceScore: 0
            };
        }

        // Check for appropriate distribution based on grade level
        const lowerOrderLevels = [BloomTaxonomyLevel.RECOGNITION, BloomTaxonomyLevel.COMPREHENSION];
        const middleOrderLevels = [BloomTaxonomyLevel.APPLICATION];
        const higherOrderLevels = [BloomTaxonomyLevel.ANALYSIS, BloomTaxonomyLevel.SYNTHESIS, BloomTaxonomyLevel.EVALUATION];

        const hasLowerOrder = bloomLevels.some(level => lowerOrderLevels.includes(level));
        const hasMiddleOrder = bloomLevels.some(level => middleOrderLevels.includes(level));
        const hasHigherOrder = bloomLevels.some(level => higherOrderLevels.includes(level));

        // Grade-specific recommendations
        if (gradeLevel <= 7) {
            if (!hasLowerOrder) {
                warnings.push('Với lớp 6-7, nên có câu hỏi nhận biết và thông hiểu');
                suggestions.push('Bổ sung câu hỏi nhận biết và thông hiểu cho học sinh lớp nhỏ');
            }
            if (hasHigherOrder && bloomLevels.filter(l => higherOrderLevels.includes(l)).length > 1) {
                warnings.push('Lớp 6-7 có thể gặp khó khăn với quá nhiều câu hỏi tư duy bậc cao');
                suggestions.push('Giảm số lượng câu hỏi phân tích, tổng hợp, đánh giá');
            }
        } else {
            // Grade 8-9
            if (!hasHigherOrder) {
                warnings.push('Với lớp 8-9, nên có câu hỏi tư duy bậc cao');
                suggestions.push('Bổ sung câu hỏi phân tích, tổng hợp hoặc đánh giá');
            }
            if (!hasMiddleOrder && questionCount > 5) {
                warnings.push('Nên có câu hỏi vận dụng để kết nối lý thuyết và thực hành');
                suggestions.push('Thêm câu hỏi vận dụng kiến thức vào tình huống cụ thể');
            }
        }

        // Check for balanced distribution
        if (questionCount >= 10) {
            const distribution = this.analyzeBloomDistribution(bloomLevels);
            if (distribution.isImbalanced) {
                warnings.push('Phân bố mức độ tư duy chưa cân bằng');
                suggestions.push('Cân bằng giữa các mức độ tư duy để đánh giá toàn diện');
            }
        }

        const complianceScore = this.calculateBloomComplianceScore(bloomLevels, gradeLevel, questionCount);

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            suggestions,
            complianceScore
        };
    }

    /**
     * Comprehensive validation for lesson plan input
     */
    validateLessonPlan(input: {
        subject: string;
        gradeLevel: number;
        lessonName: string;
        pedagogicalStandard: string;
    }): EducationalValidationResult {
        const results: EducationalValidationResult[] = [];

        // Validate each component
        results.push(this.validateSubject(input.subject));
        results.push(this.validateGradeLevel(input.gradeLevel));
        results.push(this.validatePedagogicalStandard(input.pedagogicalStandard));

        // Validate lesson name content
        if (input.lessonName && input.lessonName.length > 10) {
            const contentReport = this.validateLessonContent(
                input.lessonName,
                input.gradeLevel as GradeLevel,
                input.subject as VietnameseSubject
            );

            if (contentReport.overall.score < 60) {
                results.push({
                    isValid: false,
                    errors: [],
                    warnings: ['Tên bài học nên phản ánh tinh thần GDPT 2018'],
                    suggestions: contentReport.overall.recommendations,
                    complianceScore: contentReport.overall.score
                });
            }
        }

        return this.combineValidationResults(results);
    }

    /**
     * Comprehensive validation for presentation input
     */
    validatePresentation(input: {
        subject: string;
        gradeLevel: number;
        lessonName: string;
        curriculumContent: string;
        slideCount: number;
    }): EducationalValidationResult {
        const results: EducationalValidationResult[] = [];

        // Basic validation
        results.push(this.validateSubject(input.subject));
        results.push(this.validateGradeLevel(input.gradeLevel));

        // Validate curriculum content
        if (input.curriculumContent && input.curriculumContent.length >= 10) {
            const contentReport = this.validateLessonContent(
                input.curriculumContent,
                input.gradeLevel as GradeLevel,
                input.subject as VietnameseSubject
            );

            if (!contentReport.cv5512.isCompliant) {
                results.push({
                    isValid: false,
                    errors: [],
                    warnings: ['Nội dung chưa tuân thủ đầy đủ cấu trúc CV 5512'],
                    suggestions: contentReport.cv5512.suggestions,
                    complianceScore: contentReport.cv5512.score
                });
            }

            if (!contentReport.gdpt2018.isCompliant) {
                results.push({
                    isValid: false,
                    errors: [],
                    warnings: ['Nội dung chưa phản ánh đầy đủ tinh thần GDPT 2018'],
                    suggestions: contentReport.gdpt2018.suggestions,
                    complianceScore: contentReport.gdpt2018.score
                });
            }
        }

        // Validate slide count appropriateness
        const slideValidation = this.validateSlideCount(input.slideCount, input.gradeLevel as GradeLevel);
        results.push(slideValidation);

        return this.combineValidationResults(results);
    }

    /**
     * Comprehensive validation for assessment input
     */
    validateAssessment(input: {
        subject: string;
        gradeLevel: number;
        topic: string;
        questionCount: number;
        bloomLevels: BloomTaxonomyLevel[];
        questionType: string;
    }): EducationalValidationResult {
        const results: EducationalValidationResult[] = [];

        // Basic validation
        results.push(this.validateSubject(input.subject));
        results.push(this.validateGradeLevel(input.gradeLevel));

        // Validate Bloom's taxonomy
        results.push(this.validateBloomTaxonomy(
            input.bloomLevels,
            input.gradeLevel as GradeLevel,
            input.questionCount
        ));

        // Validate question type appropriateness for grade level
        const questionTypeValidation = this.validateQuestionType(
            input.questionType,
            input.gradeLevel as GradeLevel,
            input.questionCount
        );
        results.push(questionTypeValidation);

        return this.combineValidationResults(results);
    }

    // Private helper methods

    private calculateGDPT2018Score(result: any, content: string): number {
        const keywordCoverage = (GDPT_2018_KEYWORDS.length - result.missingKeywords.length) / GDPT_2018_KEYWORDS.length;
        const contentQuality = Math.min(content.length / 100, 1); // Bonus for detailed content
        return Math.round((keywordCoverage * 0.8 + contentQuality * 0.2) * 100);
    }

    private calculateCV5512Score(result: any, content: string): number {
        const componentCoverage = (CV_5512_KEYWORDS.length - result.missingComponents.length) / CV_5512_KEYWORDS.length;
        const structureBonus = content.includes('mục tiêu') && content.includes('hoạt động') ? 0.1 : 0;
        return Math.round((componentCoverage + structureBonus) * 100);
    }

    private calculateTerminologyScore(result: any, content: string): number {
        const terminologyRatio = result.foundTerms.length / Math.max(VALID_PEDAGOGICAL_TERMS.length * 0.3, 1);
        return Math.round(Math.min(terminologyRatio, 1) * 100);
    }

    private getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    private generateRecommendations(
        gradeLevel: GradeLevel,
        subject: VietnameseSubject,
        gdpt2018: any,
        cv5512: any,
        terminology: any
    ): string[] {
        const recommendations: string[] = [];

        // Grade-specific recommendations
        if (gradeLevel <= 7) {
            recommendations.push('Tập trung vào hoạt động trải nghiệm phù hợp với lứa tuổi');
            recommendations.push('Sử dụng phương pháp dạy học trực quan, sinh động');
        } else {
            recommendations.push('Tăng cường hoạt động tự học và nghiên cứu');
            recommendations.push('Phát triển kỹ năng tư duy phản biện');
        }

        // Subject-specific recommendations
        if (['Toán học', 'Vật lý', 'Hóa học'].includes(subject)) {
            recommendations.push('Kết hợp lý thuyết với thực hành, thí nghiệm');
            recommendations.push('Sử dụng công nghệ hỗ trợ dạy học');
        } else if (['Ngữ văn', 'Lịch sử', 'Địa lý'].includes(subject)) {
            recommendations.push('Tăng cường hoạt động thảo luận và trình bày');
            recommendations.push('Kết nối với thực tiễn cuộc sống');
        }

        // Add specific suggestions from validation results
        recommendations.push(...gdpt2018.suggestions.slice(0, 2));
        recommendations.push(...cv5512.suggestions.slice(0, 2));

        return recommendations.slice(0, 6); // Limit to 6 recommendations
    }

    private analyzeBloomDistribution(bloomLevels: BloomTaxonomyLevel[]): { isImbalanced: boolean } {
        const levelCounts = bloomLevels.reduce((acc, level) => {
            acc[level] = (acc[level] || 0) + 1;
            return acc;
        }, {} as Record<BloomTaxonomyLevel, number>);

        const counts = Object.values(levelCounts);
        const max = Math.max(...counts);
        const min = Math.min(...counts);

        // Consider imbalanced if the ratio is too high
        return { isImbalanced: max / min > 3 };
    }

    private calculateBloomComplianceScore(
        bloomLevels: BloomTaxonomyLevel[],
        gradeLevel: GradeLevel,
        questionCount: number
    ): number {
        let score = 50; // Base score

        const lowerOrder = bloomLevels.filter(l =>
            [BloomTaxonomyLevel.RECOGNITION, BloomTaxonomyLevel.COMPREHENSION].includes(l)
        ).length;
        const higherOrder = bloomLevels.filter(l =>
            [BloomTaxonomyLevel.ANALYSIS, BloomTaxonomyLevel.SYNTHESIS, BloomTaxonomyLevel.EVALUATION].includes(l)
        ).length;

        // Grade-appropriate distribution
        if (gradeLevel <= 7) {
            if (lowerOrder > 0) score += 25;
            if (higherOrder <= 1) score += 25;
        } else {
            if (higherOrder > 0) score += 25;
            if (lowerOrder > 0) score += 25;
        }

        return Math.min(score, 100);
    }

    private validateSlideCount(slideCount: number, gradeLevel: GradeLevel): EducationalValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        const suggestions: string[] = [];

        if (slideCount < 3) {
            errors.push('Số slide quá ít để trình bày đầy đủ nội dung');
        } else if (slideCount > 20) {
            errors.push('Số slide quá nhiều, có thể gây mệt mỏi cho học sinh');
        }

        // Grade-specific recommendations
        if (gradeLevel <= 7 && slideCount > 15) {
            warnings.push('Với lớp 6-7, nên giới hạn số slide để duy trì sự tập trung');
            suggestions.push('Giảm xuống 10-12 slide với nội dung súc tích');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            suggestions,
            complianceScore: errors.length === 0 ? 100 : 50
        };
    }

    private validateQuestionType(
        questionType: string,
        gradeLevel: GradeLevel,
        questionCount: number
    ): EducationalValidationResult {
        const warnings: string[] = [];
        const suggestions: string[] = [];

        if (questionType === 'essay' && gradeLevel <= 7 && questionCount > 3) {
            warnings.push('Với lớp 6-7, quá nhiều câu tự luận dài có thể gây khó khăn');
            suggestions.push('Cân nhắc giảm số câu tự luận hoặc chuyển sang tự luận ngắn');
        }

        if (questionType === 'multiple-choice' && questionCount > 30) {
            warnings.push('Quá nhiều câu trắc nghiệm có thể không đánh giá được tư duy sâu');
            suggestions.push('Kết hợp với một số câu tự luận để đánh giá toàn diện');
        }

        return {
            isValid: true,
            errors: [],
            warnings,
            suggestions,
            complianceScore: 100
        };
    }

    private combineValidationResults(results: EducationalValidationResult[]): EducationalValidationResult {
        const allErrors = results.flatMap(r => r.errors);
        const allWarnings = results.flatMap(r => r.warnings);
        const allSuggestions = results.flatMap(r => r.suggestions);
        const averageScore = results.reduce((sum, r) => sum + r.complianceScore, 0) / results.length;

        return {
            isValid: allErrors.length === 0,
            errors: [...new Set(allErrors)], // Remove duplicates
            warnings: [...new Set(allWarnings)],
            suggestions: [...new Set(allSuggestions)],
            complianceScore: Math.round(averageScore)
        };
    }
}

// Export singleton instance
export const educationalStandardsValidator = new EducationalStandardsValidator();