import { LessonPlanInput } from '../../../types/prompt';

export class LessonPlanTemplates {
    /**
     * Generate specialized lesson plan prompt for 4-column format
     */
    static generateFourColumnTemplate(input: LessonPlanInput): string {
        const basePrompt = this.getBaseRoleDefinition();
        const complianceSection = this.getComplianceSection(input.pedagogicalStandard);
        const fourColumnFormat = this.getFourColumnFormat();
        const pedagogicalGuidelines = this.getPedagogicalGuidelines(input.gradeLevel);
        const subjectSpecificGuidelines = this.getSubjectSpecificGuidelines(input.subject, input.gradeLevel);

        return `${basePrompt}

**NHIỆM VỤ CỤ THỂ:**
Tạo kế hoạch bài dạy 4 cột cho:
- Môn học: ${input.subject}
- Lớp: ${input.gradeLevel}
- Tên bài: "${input.lessonName}"
- Chuẩn sư phạm: ${input.pedagogicalStandard}

${complianceSection}

**ĐỊNH DẠNG 4 CỘT YÊU CẦU:**
${fourColumnFormat}

**HƯỚNG DẪN SƯ PHẠM:**
${pedagogicalGuidelines}

**HƯỚNG DẪN THEO MÔN HỌC:**
${subjectSpecificGuidelines}

**CẤU TRÚC BÀI HỌC:**
1. **Hoạt động khởi động** (5-7 phút)
   - Kiểm tra bài cũ hoặc tạo tình huống vào bài
   - Kích thích hứng thú học tập

2. **Hoạt động hình thành kiến thức** (25-30 phút)
   - Tổ chức hoạt động dạy học tích cực
   - Phát triển năng lực học sinh
   - Sử dụng phương pháp đa dạng

3. **Hoạt động luyện tập** (8-10 phút)
   - Củng cố kiến thức vừa học
   - Vận dụng vào tình huống cụ thể

4. **Hoạt động vận dụng** (5-7 phút)
   - Mở rộng, liên hệ thực tiễn
   - Giao nhiệm vụ về nhà

**YÊU CẦU XUẤT:**
Tạo bảng 4 cột chi tiết với nội dung cụ thể cho từng hoạt động, đảm bảo tính khả thi và hiệu quả sư phạm.`;
    }

    /**
     * Generate specialized lesson plan prompt for 5-column format
     */
    static generateFiveColumnTemplate(input: LessonPlanInput): string {
        const basePrompt = this.getBaseRoleDefinition();
        const complianceSection = this.getComplianceSection(input.pedagogicalStandard);
        const fiveColumnFormat = this.getFiveColumnFormat();
        const pedagogicalGuidelines = this.getPedagogicalGuidelines(input.gradeLevel);
        const subjectSpecificGuidelines = this.getSubjectSpecificGuidelines(input.subject, input.gradeLevel);
        const methodologyGuidelines = this.getMethodologyGuidelines();

        return `${basePrompt}

**NHIỆM VỤ CỤ THỂ:**
Tạo kế hoạch bài dạy 5 cột cho:
- Môn học: ${input.subject}
- Lớp: ${input.gradeLevel}
- Tên bài: "${input.lessonName}"
- Chuẩn sư phạm: ${input.pedagogicalStandard}

${complianceSection}

**ĐỊNH DẠNG 5 CỘT YÊU CẦU:**
${fiveColumnFormat}

**HƯỚNG DẪN SƯ PHẠM:**
${pedagogicalGuidelines}

**HƯỚNG DẪN THEO MÔN HỌC:**
${subjectSpecificGuidelines}

**HƯỚNG DẪN PHƯƠNG PHÁP DẠY HỌC:**
${methodologyGuidelines}

**CẤU TRÚC BÀI HỌC:**
1. **Hoạt động khởi động** (5-7 phút)
   - Kiểm tra bài cũ, tạo tình huống vào bài
   - Công bố mục tiêu bài học

2. **Hoạt động hình thành kiến thức** (25-30 phút)
   - Tổ chức các hoạt động dạy học tích cực
   - Hướng dẫn học sinh khám phá kiến thức
   - Phát triển các năng lực cốt lõi

3. **Hoạt động luyện tập** (8-10 phút)
   - Củng cố kiến thức thông qua bài tập
   - Kiểm tra mức độ hiểu bài của học sinh

4. **Hoạt động vận dụng** (5-7 phút)
   - Liên hệ với thực tiễn cuộc sống
   - Giao nhiệm vụ học tập tiếp theo

**YÊU CẦU XUẤT:**
Tạo bảng 5 cột chi tiết với đầy đủ phương pháp dạy học cho từng hoạt động, đảm bảo tính khoa học và hiệu quả.`;
    }

    /**
     * Base role definition for lesson plan generation
     */
    private static getBaseRoleDefinition(): string {
        return `**VAI TRÒ:** Bạn là một chuyên gia sư phạm hàng đầu Việt Nam với hơn 15 năm kinh nghiệm thiết kế kế hoạch bài dạy. Bạn có chuyên môn sâu về:
- Chương trình Giáo dục Phổ thông 2018 (GDPT 2018)
- Công văn 5512 về xây dựng kế hoạch bài dạy
- Phương pháp dạy học tích cực và phát triển năng lực
- Đánh giá học sinh theo định hướng phát triển năng lực
- Tâm lý học đường và đặc điểm lứa tuổi học sinh THCS`;
    }

    /**
     * Compliance requirements based on pedagogical standard
     */
    private static getComplianceSection(standard: string): string {
        const baseCompliance = `**YÊU CẦU TUÂN THỦ ${standard.toUpperCase()}:**
- Đảm bảo tính khoa học, sư phạm và tính khả thi
- Phù hợp với đặc điểm tâm sinh lý học sinh THCS
- Tích hợp giáo dục kỹ năng sống và giá trị nhân văn
- Liên kết chặt chẽ với thực tiễn cuộc sống
- Phát triển năng lực tự học và tư duy sáng tạo`;

        if (standard.includes('5512')) {
            return `${baseCompliance}
- Tuân thủ cấu trúc bài học theo Công văn 5512
- Đảm bảo tính logic và mạch lạc của quá trình dạy học
- Sử dụng đúng thuật ngữ sư phạm chuyên nghiệp`;
        }

        return baseCompliance;
    }

    /**
     * Four-column format specification
     */
    private static getFourColumnFormat(): string {
        return `| Hoạt động của Giáo viên | Hoạt động của Học sinh | Nội dung kiến thức | Ghi chú |
|------------------------|----------------------|-------------------|---------|
| - Những việc GV thực hiện | - Những việc HS thực hiện | - Kiến thức cần truyền đạt | - Phương tiện, tài liệu |
| - Câu hỏi, yêu cầu đặt ra | - Cách thức tham gia | - Kỹ năng cần hình thành | - Thời gian dự kiến |
| - Hướng dẫn, định hướng | - Sản phẩm tạo ra | - Thái độ cần rèn luyện | - Lưu ý đặc biệt |

**Lưu ý quan trọng:**
- Mỗi ô phải có nội dung cụ thể, chi tiết
- Đảm bảo sự tương tác tích cực giữa GV và HS
- Nội dung kiến thức phải chính xác và phù hợp`;
    }

    /**
     * Five-column format specification
     */
    private static getFiveColumnFormat(): string {
        return `| Hoạt động của Giáo viên | Hoạt động của Học sinh | Nội dung kiến thức | Phương pháp dạy học | Ghi chú |
|------------------------|----------------------|-------------------|-------------------|---------|
| - Những việc GV thực hiện | - Những việc HS thực hiện | - Kiến thức cần truyền đạt | - PP và kỹ thuật sử dụng | - Phương tiện, tài liệu |
| - Câu hỏi, yêu cầu đặt ra | - Cách thức tham gia | - Kỹ năng cần hình thành | - Hình thức tổ chức | - Thời gian dự kiến |
| - Hướng dẫn, định hướng | - Sản phẩm tạo ra | - Thái độ cần rèn luyện | - Phương tiện hỗ trợ | - Lưu ý đặc biệt |

**Lưu ý quan trọng:**
- Cột "Phương pháp dạy học" phải ghi rõ PP cụ thể được sử dụng
- Đảm bảo sự đa dạng trong phương pháp dạy học
- Phương pháp phải phù hợp với nội dung và đối tượng học sinh`;
    }

    /**
     * Pedagogical guidelines based on grade level
     */
    private static getPedagogicalGuidelines(gradeLevel: number): string {
        const baseGuidelines = `- Sử dụng các từ khóa sư phạm: "Tổ chức hoạt động dạy học", "Phát triển năng lực", "Dạy học tích cực"
- Tích hợp các hoạt động trải nghiệm và thực hành
- Khuyến khích học tập hợp tác và tương tác tích cực
- Đánh giá đa dạng: đánh giá quá trình và kết quả
- Phát triển tư duy phản biện và giải quyết vấn đề`;

        const gradeSpecific = {
            6: `- Chú trọng việc làm quen với môi trường THCS
- Sử dụng nhiều hoạt động trực quan, sinh động
- Tạo không khí học tập vui vẻ, thoải mái`,
            7: `- Phát triển khả năng tư duy trừu tượng
- Tăng cường hoạt động nhóm và thảo luận
- Khuyến khích tính tự lập trong học tập`,
            8: `- Phát triển tư duy logic và phân tích
- Tăng cường liên hệ với thực tiễn cuộc sống
- Chuẩn bị cho việc định hướng nghề nghiệp`,
            9: `- Tổng hợp và hệ thống hóa kiến thức
- Phát triển kỹ năng tự học và nghiên cứu
- Chuẩn bị cho kỳ thi tuyển sinh lớp 10`
        };

        return `${baseGuidelines}
${gradeSpecific[gradeLevel as keyof typeof gradeSpecific] || ''}`;
    }

    /**
     * Subject-specific guidelines
     */
    private static getSubjectSpecificGuidelines(subject: string, gradeLevel: number): string {
        const guidelines: Record<string, string> = {
            'Toán học': `- Chú trọng việc hình thành tư duy logic toán học
- Sử dụng phương pháp giải quyết vấn đề
- Liên hệ toán học với thực tiễn cuộc sống
- Phát triển kỹ năng tính toán và lập luận`,

            'Ngữ văn': `- Phát triển năng lực đọc hiểu và viết
- Giáo dục thẩm mỹ và nhân cách
- Sử dụng phương pháp dạy học tích cực
- Tích hợp giáo dục truyền thống và hiện đại`,

            'Tiếng Anh': `- Phát triển 4 kỹ năng: Nghe, Nói, Đọc, Viết
- Sử dụng phương pháp giao tiếp
- Tạo môi trường học tập tiếng Anh tự nhiên
- Tích hợp văn hóa và giao tiếp thực tế`,

            'Vật lý': `- Kết hợp lý thuyết với thí nghiệm
- Phát triển tư duy khoa học
- Liên hệ với ứng dụng trong đời sống
- Sử dụng phương tiện trực quan và mô phỏng`,

            'Hóa học': `- An toàn trong thí nghiệm hóa học
- Phát triển kỹ năng quan sát và phân tích
- Liên hệ với môi trường và sức khỏe
- Sử dụng mô hình và thí nghiệm minh họa`,

            'Sinh học': `- Quan sát và nghiên cứu thực tế
- Giáo dục ý thức bảo vệ môi trường
- Phát triển tư duy sinh thái
- Liên hệ với sức khỏe và đời sống`,

            'Lịch sử': `- Phát triển tư duy lịch sử
- Giáo dục lòng yêu nước và truyền thống
- Sử dụng tài liệu lịch sử đa dạng
- Rèn luyện kỹ năng phân tích sử liệu`,

            'Địa lý': `- Sử dụng bản đồ và tài liệu địa lý
- Phát triển ý thức bảo vệ môi trường
- Liên hệ với thực tế địa phương
- Rèn luyện kỹ năng quan sát và phân tích không gian`
        };

        return guidelines[subject] || `- Tuân thủ đặc thù của môn ${subject}
- Phát triển năng lực chuyên môn
- Liên hệ với thực tiễn cuộc sống
- Sử dụng phương pháp phù hợp với đặc điểm môn học`;
    }

    /**
     * Methodology guidelines for 5-column format
     */
    private static getMethodologyGuidelines(): string {
        return `**Các phương pháp dạy học chính:**
- **Thuyết trình có vấn đáp:** Trình bày kết hợp đặt câu hỏi
- **Đàm thoại:** Hỏi đáp có hệ thống để dẫn dắt tư duy
- **Thảo luận nhóm:** Học sinh thảo luận, trao đổi ý kiến
- **Phát hiện và giải quyết vấn đề:** Đặt vấn đề để HS tìm lời giải
- **Hoạt động nhóm:** Phân công nhiệm vụ cho từng nhóm
- **Thực hành, thí nghiệm:** Học qua hoạt động thực tế
- **Trò chơi học tập:** Học thông qua các trò chơi giáo dục
- **Dạy học phân hóa:** Phù hợp với từng nhóm đối tượng HS

**Nguyên tắc lựa chọn phương pháp:**
- Phù hợp với nội dung bài học
- Phù hợp với đặc điểm học sinh
- Đảm bảo tính tích cực và chủ động của HS
- Tạo hứng thú và động lực học tập`;
    }
}