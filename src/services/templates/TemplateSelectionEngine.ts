import { PromptTemplate, subjectTemplateService } from './SubjectTemplateService';

export interface TemplateSelectionCriteria {
    subject: string;
    gradeLevel: 6 | 7 | 8 | 9;
    outputType: 'lesson-plan' | 'presentation' | 'assessment' | 'interactive' | 'research';
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    compliance?: string[]; // GDPT 2018, CV 5512, etc.
    keywords?: string[];
    userExperience?: 'beginner' | 'intermediate' | 'advanced';
}

export interface TemplateMatch {
    template: PromptTemplate;
    score: number;
    reasons: string[];
    confidence: 'high' | 'medium' | 'low';
}

export interface UserPreferences {
    favoriteTemplates: string[];
    recentlyUsedTemplates: string[];
    preferredDifficulty: 'beginner' | 'intermediate' | 'advanced';
    subjectExpertise: Record<string, 'beginner' | 'intermediate' | 'advanced'>;
    compliancePreferences: string[];
}

export class TemplateSelectionEngine {

    /**
     * Tìm template phù hợp nhất dựa trên tiêu chí
     */
    async findBestTemplate(criteria: TemplateSelectionCriteria, userPreferences?: UserPreferences): Promise<TemplateMatch | null> {
        const matches = await this.findMatchingTemplates(criteria, userPreferences);
        return matches.length > 0 ? matches[0] : null;
    }

    /**
     * Tìm tất cả template phù hợp và sắp xếp theo độ phù hợp
     */
    async findMatchingTemplates(criteria: TemplateSelectionCriteria, userPreferences?: UserPreferences): Promise<TemplateMatch[]> {
        // Lấy templates theo tiêu chí cơ bản
        const candidateTemplates = await this.getCandidateTemplates(criteria);

        // Tính điểm cho từng template
        const matches: TemplateMatch[] = [];

        for (const template of candidateTemplates) {
            const score = this.calculateTemplateScore(template, criteria, userPreferences);
            const reasons = this.generateMatchReasons(template, criteria, userPreferences);
            const confidence = this.determineConfidence(score);

            matches.push({
                template,
                score,
                reasons,
                confidence
            });
        }

        // Sắp xếp theo điểm số giảm dần
        return matches.sort((a, b) => b.score - a.score);
    }

    /**
     * Đề xuất template dựa trên lịch sử sử dụng
     */
    async getPersonalizedRecommendations(
        criteria: TemplateSelectionCriteria,
        userPreferences: UserPreferences
    ): Promise<TemplateMatch[]> {
        const matches = await this.findMatchingTemplates(criteria, userPreferences);

        // Boost điểm cho template yêu thích và đã sử dụng gần đây
        return matches.map(match => {
            let bonusScore = 0;
            const bonusReasons: string[] = [];

            if (userPreferences.favoriteTemplates.includes(match.template.id)) {
                bonusScore += 15;
                bonusReasons.push('Template yêu thích của bạn');
            }

            if (userPreferences.recentlyUsedTemplates.includes(match.template.id)) {
                bonusScore += 10;
                bonusReasons.push('Đã sử dụng gần đây');
            }

            // Kiểm tra expertise level
            const subjectExpertise = userPreferences.subjectExpertise[criteria.subject];
            if (subjectExpertise && this.matchesDifficultyLevel(match.template.difficulty, subjectExpertise)) {
                bonusScore += 8;
                bonusReasons.push(`Phù hợp với trình độ ${subjectExpertise} của bạn`);
            }

            return {
                ...match,
                score: match.score + bonusScore,
                reasons: [...match.reasons, ...bonusReasons],
                confidence: this.determineConfidence(match.score + bonusScore)
            };
        }).sort((a, b) => b.score - a.score);
    }

    /**
     * So sánh templates và đưa ra lời khuyên
     */
    async compareTemplates(templateIds: string[], criteria: TemplateSelectionCriteria): Promise<{
        comparison: Array<{
            template: PromptTemplate;
            pros: string[];
            cons: string[];
            bestFor: string[];
        }>;
        recommendation: string;
    }> {
        const templates = await Promise.all(
            templateIds.map(id => subjectTemplateService.getTemplateById(id))
        );

        const validTemplates = templates.filter(t => t !== null) as PromptTemplate[];

        const comparison = validTemplates.map(template => ({
            template,
            pros: this.getTemplatePros(template, criteria),
            cons: this.getTemplateCons(template, criteria),
            bestFor: this.getTemplateBestUseCase(template)
        }));

        const recommendation = this.generateComparisonRecommendation(comparison, criteria);

        return { comparison, recommendation };
    }

    /**
     * Lấy danh sách template ứng viên
     */
    private async getCandidateTemplates(criteria: TemplateSelectionCriteria): Promise<PromptTemplate[]> {
        console.log('Getting candidate templates for criteria:', criteria);

        // Lấy templates theo subject, grade level và output type
        const templates = await subjectTemplateService.getRecommendedTemplates(
            criteria.subject,
            criteria.gradeLevel,
            criteria.outputType
        );

        console.log('Found recommended templates:', templates.length);

        // Nếu không có template chính xác, mở rộng tìm kiếm
        if (templates.length === 0) {
            console.log('No recommended templates, searching by subject:', criteria.subject);
            const allSubjectTemplates = await subjectTemplateService.getTemplatesBySubject(criteria.subject);
            console.log('Found subject templates:', allSubjectTemplates.length);
            const filtered = allSubjectTemplates.filter(t => t.gradeLevel.includes(criteria.gradeLevel));
            console.log('Filtered by grade level:', filtered.length);
            return filtered;
        }

        return templates;
    }

    /**
     * Tính điểm phù hợp cho template
     */
    private calculateTemplateScore(
        template: PromptTemplate,
        criteria: TemplateSelectionCriteria,
        userPreferences?: UserPreferences
    ): number {
        let score = 0;

        // Điểm cơ bản cho subject match (20 điểm)
        if (template.subject === criteria.subject) {
            score += 20;
        }

        // Điểm cho grade level match (15 điểm)
        if (template.gradeLevel.includes(criteria.gradeLevel)) {
            score += 15;
        }

        // Điểm cho output type match (15 điểm)
        if (template.outputType === criteria.outputType) {
            score += 15;
        }

        // Điểm cho difficulty match (10 điểm)
        if (criteria.difficulty && template.difficulty === criteria.difficulty) {
            score += 10;
        } else if (!criteria.difficulty && template.difficulty === 'intermediate') {
            score += 5; // Default preference for intermediate
        }

        // Điểm cho compliance match (10 điểm)
        if (criteria.compliance) {
            const matchingCompliance = template.compliance.filter(c =>
                criteria.compliance!.includes(c)
            );
            score += matchingCompliance.length * 2;
        }

        // Điểm cho keywords match (10 điểm)
        if (criteria.keywords) {
            const matchingKeywords = template.tags.filter(tag =>
                criteria.keywords!.some(keyword =>
                    tag.toLowerCase().includes(keyword.toLowerCase())
                )
            );
            score += matchingKeywords.length * 2;
        }

        // Điểm cho user experience level (5 điểm)
        if (criteria.userExperience) {
            if (this.matchesDifficultyLevel(template.difficulty, criteria.userExperience)) {
                score += 5;
            }
        }

        // Điểm bonus cho template chất lượng cao
        score += template.compliance.length; // Nhiều compliance standards
        score += Math.min(template.variables.length / 2, 5); // Nhiều variables (linh hoạt)
        score += template.examples.length * 2; // Có ví dụ mẫu

        return Math.round(score);
    }

    /**
     * Tạo lý do match
     */
    private generateMatchReasons(
        template: PromptTemplate,
        criteria: TemplateSelectionCriteria,
        userPreferences?: UserPreferences
    ): string[] {
        const reasons: string[] = [];

        if (template.subject === criteria.subject) {
            reasons.push(`Chuyên môn ${criteria.subject}`);
        }

        if (template.gradeLevel.includes(criteria.gradeLevel)) {
            reasons.push(`Phù hợp lớp ${criteria.gradeLevel}`);
        }

        if (template.outputType === criteria.outputType) {
            reasons.push(`Định dạng ${this.getOutputTypeText(criteria.outputType)}`);
        }

        if (criteria.difficulty && template.difficulty === criteria.difficulty) {
            reasons.push(`Độ khó ${this.getDifficultyText(template.difficulty)}`);
        }

        if (template.compliance.includes('GDPT 2018')) {
            reasons.push('Tuân thủ GDPT 2018');
        }

        if (template.compliance.includes('CV 5512')) {
            reasons.push('Theo Công văn 5512');
        }

        if (template.examples.length > 0) {
            reasons.push(`${template.examples.length} ví dụ mẫu`);
        }

        return reasons;
    }

    /**
     * Xác định độ tin cậy
     */
    private determineConfidence(score: number): 'high' | 'medium' | 'low' {
        if (score >= 60) return 'high';
        if (score >= 40) return 'medium';
        return 'low';
    }

    /**
     * Kiểm tra độ khó phù hợp với trình độ
     */
    private matchesDifficultyLevel(templateDifficulty: string, userLevel: string): boolean {
        const difficultyMap = {
            'beginner': ['beginner'],
            'intermediate': ['beginner', 'intermediate'],
            'advanced': ['intermediate', 'advanced']
        };

        return difficultyMap[userLevel as keyof typeof difficultyMap]?.includes(templateDifficulty) || false;
    }

    /**
     * Lấy ưu điểm của template
     */
    private getTemplatePros(template: PromptTemplate, criteria: TemplateSelectionCriteria): string[] {
        const pros: string[] = [];

        if (template.compliance.length > 0) {
            pros.push(`Tuân thủ ${template.compliance.join(', ')}`);
        }

        if (template.examples.length > 0) {
            pros.push(`Có ${template.examples.length} ví dụ mẫu`);
        }

        if (template.variables.length > 5) {
            pros.push('Tùy chỉnh linh hoạt với nhiều biến');
        }

        if (template.difficulty === 'beginner') {
            pros.push('Dễ sử dụng cho người mới');
        }

        if (template.recommendedTools.length > 0) {
            pros.push('Tích hợp với công cụ AI phù hợp');
        }

        return pros;
    }

    /**
     * Lấy nhược điểm của template
     */
    private getTemplateCons(template: PromptTemplate, criteria: TemplateSelectionCriteria): string[] {
        const cons: string[] = [];

        if (!template.gradeLevel.includes(criteria.gradeLevel)) {
            cons.push(`Không tối ưu cho lớp ${criteria.gradeLevel}`);
        }

        if (template.variables.length > 8) {
            cons.push('Cần điền nhiều thông tin');
        }

        if (template.difficulty === 'advanced' && criteria.userExperience === 'beginner') {
            cons.push('Có thể phức tạp cho người mới');
        }

        if (template.examples.length === 0) {
            cons.push('Không có ví dụ mẫu tham khảo');
        }

        return cons;
    }

    /**
     * Lấy trường hợp sử dụng tốt nhất
     */
    private getTemplateBestUseCase(template: PromptTemplate): string[] {
        const useCases: string[] = [];

        if (template.difficulty === 'beginner') {
            useCases.push('Giáo viên mới bắt đầu');
        }

        if (template.compliance.includes('CV 5512')) {
            useCases.push('Kế hoạch bài dạy chính thức theo quy định');
        }

        if (template.variables.length > 6) {
            useCases.push('Bài học phức tạp cần tùy chỉnh chi tiết');
        }

        if (template.examples.length > 1) {
            useCases.push('Cần tham khảo nhiều ví dụ');
        }

        return useCases;
    }

    /**
     * Tạo khuyến nghị so sánh
     */
    private generateComparisonRecommendation(
        comparison: Array<{ template: PromptTemplate; pros: string[]; cons: string[] }>,
        criteria: TemplateSelectionCriteria
    ): string {
        if (comparison.length === 0) return 'Không có template phù hợp.';

        const bestTemplate = comparison[0];
        return `Khuyến nghị sử dụng "${bestTemplate.template.name}" vì ${bestTemplate.pros.slice(0, 2).join(' và ')}.`;
    }

    /**
     * Helper methods
     */
    private getOutputTypeText(outputType: string): string {
        const texts = {
            'lesson-plan': 'Kế hoạch bài dạy',
            'presentation': 'Thuyết trình',
            'assessment': 'Đánh giá',
            'interactive': 'Tương tác',
            'research': 'Nghiên cứu'
        };
        return texts[outputType as keyof typeof texts] || outputType;
    }

    private getDifficultyText(difficulty: string): string {
        const texts = {
            'beginner': 'Cơ bản',
            'intermediate': 'Trung bình',
            'advanced': 'Nâng cao'
        };
        return texts[difficulty as keyof typeof texts] || difficulty;
    }
}

export const templateSelectionEngine = new TemplateSelectionEngine();