import { AssessmentInput, BloomTaxonomyLevel } from '../../../types/prompt';

export class AssessmentTemplates {
    /**
     * Generate specialized assessment prompt
     */
    static generateAssessmentTemplate(input: AssessmentInput): string {
        const basePrompt = this.getBaseRoleDefinition();
        const bloomLevelsDescription = this.getBloomLevelsDescription(input.bloomLevels);
        const questionTypeInstructions = this.getQuestionTypeInstructions(input.questionType);
        const distributionGuidelines = this.getDistributionGuidelines(input.questionCount, input.bloomLevels);
        const gradeLevelGuidelines = this.getGradeLevelGuidelines(input.gradeLevel);
        const formatRequirements = this.getFormatRequirements(input.questionType);

        return `${basePrompt}

**NHIỆM VỤ CỤ THỂ:**
Tạo bộ câu hỏi đánh giá cho:
- Môn học: ${input.subject}
- Lớp: ${input.gradeLevel}
- Chủ đề: "${input.topic}"
- Số câu hỏi: ${input.questionCount}
- Loại câu hỏi: ${this.getQuestionTypeVietnamese(input.questionType)}

**MỨC ĐỘ TƯ DUY THEO BLOOM'S TAXONOMY:**
${bloomLevelsDescription}

**PHÂN BỔ CÂU HỎI:**
${distributionGuidelines}

**HƯỚNG DẪN THEO KHỐI LỚP:**
${gradeLevelGuidelines}

**YÊU CẦU LOẠI CÂU HỎI:**
${questionTypeInstructions}

**ĐỊNH DẠNG XUẤT:**
${formatRequirements}

**TIÊU CHÍ CHẤT LƯỢNG:**
- Câu hỏi phải rõ ràng, không gây nhầm lẫn
- Đáp án phải chính xác và có căn cứ
- Phù hợp với trình độ nhận thức học sinh lớp ${input.gradeLevel}
- Đảm bảo tính công bằng và khách quan
- Có thể đánh giá được năng lực học sinh

**KIỂM TRA CUỐI CÙNG:**
- Đảm bảo đủ ${input.questionCount} câu hỏi
- Phân bổ đúng theo các mức độ tư duy đã chọn
- Mỗi câu hỏi có đầy đủ đáp án và giải thích
- Thang điểm và tiêu chí chấm rõ ràng

Vui lòng tạo bộ câu hỏi đánh giá chất lượng cao.`;
    }

    /**
     * Base role definition for assessment generation
     */
    private static getBaseRoleDefinition(): string {
        return `**VAI TRÒ:** Bạn là một chuyên gia đánh giá giáo dục hàng đầu Việt Nam với hơn 12 năm kinh nghiệm thiết kế các câu hỏi đánh giá theo thang Bloom's Taxonomy cho hệ thống giáo dục THCS. Bạn có chuyên môn sâu về:
- Thiết kế câu hỏi đánh giá theo chuẩn GDPT 2018
- Phân loại câu hỏi theo các mức độ tư duy Bloom's Taxonomy
- Tâm lý học đường và đặc điểm nhận thức học sinh THCS
- Phương pháp đánh giá năng lực và kết quả học tập
- Thiết kế rubric chấm điểm khoa học và công bằng
- Tạo câu hỏi phù hợp với từng môn học và lứa tuổi`;
    }

    /**
     * Bloom's Taxonomy levels description in Vietnamese
     */
    private static getBloomLevelsDescription(levels: BloomTaxonomyLevel[]): string {
        const descriptions: Record<BloomTaxonomyLevel, string> = {
            [BloomTaxonomyLevel.RECOGNITION]: '**Nhận biết** - Ghi nhớ và nhận ra thông tin cơ bản, thuật ngữ, sự kiện',
            [BloomTaxonomyLevel.COMPREHENSION]: '**Thông hiểu** - Hiểu ý nghĩa, giải thích, tóm tắt, so sánh thông tin',
            [BloomTaxonomyLevel.APPLICATION]: '**Vận dụng** - Áp dụng kiến thức vào tình huống mới, giải quyết bài tập',
            [BloomTaxonomyLevel.ANALYSIS]: '**Phân tích** - Phân tích thành phần, mối quan hệ, nguyên nhân-kết quả',
            [BloomTaxonomyLevel.SYNTHESIS]: '**Tổng hợp** - Kết hợp thông tin tạo ra ý tưởng, giải pháp mới',
            [BloomTaxonomyLevel.EVALUATION]: '**Đánh giá** - Đưa ra nhận định, phê phán có căn cứ khoa học'
        };

        const selectedDescriptions = levels.map(level => `- ${descriptions[level]}`).join('\n');

        return `${selectedDescriptions}

**Từ khóa gợi ý cho từng mức độ:**
- **Nhận biết:** Định nghĩa, liệt kê, nhận ra, ghi nhớ, xác định
- **Thông hiểu:** Giải thích, mô tả, so sánh, phân biệt, tóm tắt
- **Vận dụng:** Áp dụng, sử dụng, giải quyết, thực hiện, tính toán
- **Phân tích:** Phân tích, phân loại, so sánh, tìm nguyên nhân
- **Tổng hợp:** Tạo ra, thiết kế, kết hợp, đề xuất, sáng tạo
- **Đánh giá:** Đánh giá, phê phán, lựa chọn, biện luận, kết luận`;
    }

    /**
     * Question type specific instructions
     */
    private static getQuestionTypeInstructions(type: 'multiple-choice' | 'short-answer' | 'essay'): string {
        switch (type) {
            case 'multiple-choice':
                return `**HƯỚNG DẪN CÂU HỎI TRẮC NGHIỆM:**
- Mỗi câu có đúng 4 phương án A, B, C, D
- Chỉ có 1 đáp án đúng duy nhất
- 3 phương án sai (distractors) phải hợp lý và có thể gây nhầm lẫn
- Tránh các manh mối gợi ý đáp án đúng (độ dài, ngữ pháp)
- Sử dụng ngôn ngữ rõ ràng, tránh phủ định kép
- Các phương án phải tương đương về độ dài và cấu trúc
- Tránh sử dụng "tất cả đều đúng" hoặc "tất cả đều sai"`;

            case 'short-answer':
                return `**HƯỚNG DẪN CÂU HỎI TỰ LUẬN NGẮN:**
- Câu trả lời từ 1-3 câu hoặc 50-100 từ
- Yêu cầu trả lời cụ thể, rõ ràng về một khía cạnh
- Có thể có nhiều cách trả lời đúng
- Cung cấp từ khóa chính trong đáp án mẫu
- Đặt câu hỏi mở nhưng có hướng dẫn rõ ràng
- Tránh câu hỏi quá rộng hoặc quá hẹp
- Cho điểm theo từng ý chính`;

            case 'essay':
                return `**HƯỚNG DẪN CÂU HỎI TỰ LUẬN DÀI:**
- Câu hỏi mở, yêu cầu trình bày chi tiết (200-500 từ)
- Có cấu trúc: mở bài, thân bài, kết luận
- Đánh giá khả năng lập luận và trình bày
- Yêu cầu sử dụng kiến thức tổng hợp
- Có thể có nhiều quan điểm khác nhau
- Cung cấp rubric chấm điểm chi tiết
- Đánh giá cả nội dung và hình thức trình bày`;
        }
    }

    /**
     * Distribution guidelines for questions across Bloom levels
     */
    private static getDistributionGuidelines(questionCount: number, levels: BloomTaxonomyLevel[]): string {
        const distribution = this.calculateDistribution(questionCount, levels);

        let guidelines = `Phân bổ ${questionCount} câu hỏi theo các mức độ tư duy:\n`;

        distribution.forEach(({ level, count, percentage }) => {
            const levelName = this.getBloomLevelVietnamese(level);
            guidelines += `- **${levelName}:** ${count} câu (${percentage}%)\n`;
        });

        guidelines += `\n**Nguyên tắc phân bổ:**
- Mức độ thấp (Nhận biết, Thông hiểu): 40-50% tổng số câu
- Mức độ trung bình (Vận dụng, Phân tích): 30-40% tổng số câu  
- Mức độ cao (Tổng hợp, Đánh giá): 10-20% tổng số câu
- Đảm bảo cân bằng giữa các mức độ được chọn`;

        return guidelines;
    }

    /**
     * Grade level specific guidelines
     */
    private static getGradeLevelGuidelines(gradeLevel: number): string {
        const baseGuidelines = `- Sử dụng ngôn ngữ phù hợp với trình độ học sinh lớp ${gradeLevel}
- Nội dung câu hỏi gắn liền với chương trình học
- Tránh các khái niệm quá phức tạp hoặc ngoài chương trình
- Đảm bảo tính công bằng cho tất cả học sinh`;

        const gradeSpecific = {
            6: `- Tập trung vào kiến thức cơ bản và kỹ năng nhận biết
- Sử dụng ví dụ gần gũi với cuộc sống học sinh
- Câu hỏi ngắn gọn, dễ hiểu
- Tránh các tình huống quá phức tạp`,

            7: `- Phát triển khả năng thông hiểu và vận dụng
- Tăng cường câu hỏi liên hệ thực tế
- Khuyến khích tư duy logic
- Có thể có câu hỏi yêu cầu giải thích đơn giản`,

            8: `- Tăng cường câu hỏi phân tích và so sánh
- Liên hệ với kiến thức liên môn
- Phát triển kỹ năng lập luận
- Có thể có câu hỏi tình huống thực tế`,

            9: `- Tổng hợp kiến thức toàn khóa THCS
- Câu hỏi có tính tư duy cao
- Chuẩn bị cho kỳ thi tuyển sinh lớp 10
- Tăng cường câu hỏi đánh giá và tổng hợp`
        };

        return `${baseGuidelines}
${gradeSpecific[gradeLevel as keyof typeof gradeSpecific] || ''}`;
    }

    /**
     * Format requirements based on question type
     */
    private static getFormatRequirements(type: 'multiple-choice' | 'short-answer' | 'essay'): string {
        const baseFormat = `**Cho mỗi câu hỏi, cung cấp:**
1. **Số thứ tự và mức độ tư duy** (VD: Câu 1 - Nhận biết)
2. **Nội dung câu hỏi** (rõ ràng, chính xác)
3. **Đáp án đúng** (chi tiết, đầy đủ)
4. **Giải thích/Hướng dẫn** (tại sao đáp án này đúng)
5. **Điểm số** (phân bổ điểm hợp lý)
6. **Tiêu chí chấm** (rubric chi tiết)`;

        switch (type) {
            case 'multiple-choice':
                return `${baseFormat}

**Định dạng cụ thể cho trắc nghiệm:**
\`\`\`
Câu [số] - [Mức độ tư duy]: [Nội dung câu hỏi]
A. [Phương án A]
B. [Phương án B] 
C. [Phương án C]
D. [Phương án D]

Đáp án: [A/B/C/D]
Giải thích: [Tại sao đáp án này đúng và các đáp án khác sai]
Điểm: [X điểm]
\`\`\``;

            case 'short-answer':
                return `${baseFormat}

**Định dạng cụ thể cho tự luận ngắn:**
\`\`\`
Câu [số] - [Mức độ tư duy]: [Nội dung câu hỏi]

Đáp án mẫu:
- [Ý chính 1] (X điểm)
- [Ý chính 2] (X điểm)
- [Ý chính 3] (X điểm)

Tiêu chí chấm:
- Đầy đủ các ý chính: [X điểm]
- Trình bày rõ ràng: [X điểm]
- Sử dụng thuật ngữ chính xác: [X điểm]
Tổng: [X điểm]
\`\`\``;

            case 'essay':
                return `${baseFormat}

**Định dạng cụ thể cho tự luận dài:**
\`\`\`
Câu [số] - [Mức độ tư duy]: [Nội dung câu hỏi]

Đáp án mẫu:
I. Mở bài: [Nội dung chính]
II. Thân bài:
   1. [Ý chính 1 + giải thích]
   2. [Ý chính 2 + giải thích]
   3. [Ý chính 3 + giải thích]
III. Kết luận: [Tóm tắt và khẳng định]

Rubric chấm điểm:
- Mở bài (1-2 điểm): Nêu được vấn đề chính
- Thân bài (6-7 điểm): Phân tích đầy đủ, lập luận chặt chẽ
- Kết luận (1-2 điểm): Tóm tắt và khẳng định rõ ràng
- Hình thức (1 điểm): Trình bày mạch lạc, chính tả đúng
Tổng: [X điểm]
\`\`\``;
        }
    }

    // Helper methods
    private static getQuestionTypeVietnamese(type: 'multiple-choice' | 'short-answer' | 'essay'): string {
        switch (type) {
            case 'multiple-choice': return 'Trắc nghiệm';
            case 'short-answer': return 'Tự luận ngắn';
            case 'essay': return 'Tự luận dài';
        }
    }

    private static getBloomLevelVietnamese(level: BloomTaxonomyLevel): string {
        const names: Record<BloomTaxonomyLevel, string> = {
            [BloomTaxonomyLevel.RECOGNITION]: 'Nhận biết',
            [BloomTaxonomyLevel.COMPREHENSION]: 'Thông hiểu',
            [BloomTaxonomyLevel.APPLICATION]: 'Vận dụng',
            [BloomTaxonomyLevel.ANALYSIS]: 'Phân tích',
            [BloomTaxonomyLevel.SYNTHESIS]: 'Tổng hợp',
            [BloomTaxonomyLevel.EVALUATION]: 'Đánh giá'
        };
        return names[level];
    }

    private static calculateDistribution(questionCount: number, levels: BloomTaxonomyLevel[]): Array<{ level: BloomTaxonomyLevel, count: number, percentage: number }> {
        const distribution: Array<{ level: BloomTaxonomyLevel, count: number, percentage: number }> = [];
        const levelCount = levels.length;

        // Basic equal distribution with adjustments for educational best practices
        let remainingQuestions = questionCount;

        levels.forEach((level, index) => {
            let count: number;

            if (index === levels.length - 1) {
                // Last level gets remaining questions
                count = remainingQuestions;
            } else {
                // Distribute based on level priority (lower levels get more questions)
                const priority = this.getLevelPriority(level);
                const baseCount = Math.floor(questionCount / levelCount);
                count = Math.max(1, Math.floor(baseCount * priority));
                count = Math.min(count, remainingQuestions - (levelCount - index - 1)); // Ensure we don't exceed remaining
            }

            remainingQuestions -= count;
            const percentage = Math.round((count / questionCount) * 100);

            distribution.push({ level, count, percentage });
        });

        return distribution;
    }

    private static getLevelPriority(level: BloomTaxonomyLevel): number {
        // Priority multiplier for question distribution (higher = more questions)
        const priorities: Record<BloomTaxonomyLevel, number> = {
            [BloomTaxonomyLevel.RECOGNITION]: 1.3,
            [BloomTaxonomyLevel.COMPREHENSION]: 1.2,
            [BloomTaxonomyLevel.APPLICATION]: 1.1,
            [BloomTaxonomyLevel.ANALYSIS]: 1.0,
            [BloomTaxonomyLevel.SYNTHESIS]: 0.8,
            [BloomTaxonomyLevel.EVALUATION]: 0.7
        };
        return priorities[level];
    }
}