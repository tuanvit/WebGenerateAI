import { PresentationInput } from '../../../types/prompt';

export class PresentationTemplates {
    /**
     * Generate specialized presentation outline prompt
     */
    static generatePresentationTemplate(input: PresentationInput): string {
        const basePrompt = this.getBaseRoleDefinition();
        const structureInstructions = this.getStructureInstructions(input.slideCount);
        const contentGuidelines = this.getContentGuidelines(input.gradeLevel);
        const formatRequirements = this.getFormatRequirements();
        const visualGuidelines = this.getVisualGuidelines();

        return `${basePrompt}

**NHIỆM VỤ CỤ THỂ:**
Tạo dàn ý slide thuyết trình cho:
- Môn học: ${input.subject}
- Lớp: ${input.gradeLevel}
- Tên bài: "${input.lessonName}"
- Số slide: ${input.slideCount}

**NỘI DUNG CHƯƠNG TRÌNH GỐC:**
${input.curriculumContent}

**NGUYÊN TẮC QUAN TRỌNG - TUÂN THỦ NGHIÊM NGẶT:**
🚫 CHỈ sử dụng thông tin từ nội dung chương trình được cung cấp ở trên
🚫 KHÔNG thêm thông tin bên ngoài hoặc tự sáng tạo nội dung
🚫 KHÔNG sử dụng kiến thức bên ngoài nội dung đã cho
✅ Chỉ tái cấu trúc và trình bày lại thông tin có sẵn

${structureInstructions}

**HƯỚNG DẪN NỘI DUNG:**
${contentGuidelines}

**YÊU CẦU ĐỊNH DẠNG:**
${formatRequirements}

**HƯỚNG DẪN HÌNH ẢNH:**
${visualGuidelines}

**KIỂM TRA CUỐI CÙNG:**
- Đảm bảo mọi thông tin đều có trong nội dung chương trình gốc
- Kiểm tra tính logic và mạch lạc giữa các slide
- Đảm bảo phù hợp với trình độ nhận thức lớp ${input.gradeLevel}
- Mỗi slide phải có đủ: tiêu đề, nội dung chính, gợi ý hình ảnh

Vui lòng tạo dàn ý slide chi tiết và hấp dẫn.`;
    }

    /**
     * Base role definition for presentation generation
     */
    private static getBaseRoleDefinition(): string {
        return `**VAI TRÒ:** Bạn là một chuyên gia thiết kế nội dung giáo dục hàng đầu Việt Nam với hơn 10 năm kinh nghiệm tạo ra các slide thuyết trình hấp dẫn và hiệu quả cho học sinh THCS. Bạn có chuyên môn về:
- Thiết kế slide giáo dục theo chuẩn GDPT 2018
- Tâm lý học đường và đặc điểm nhận thức học sinh THCS
- Phương pháp trình bày thông tin logic và dễ hiểu
- Tích hợp hình ảnh và minh họa phù hợp với từng độ tuổi
- Tạo nội dung thu hút và tương tác với học sinh`;
    }

    /**
     * Structure instructions based on slide count
     */
    private static getStructureInstructions(slideCount: number): string {
        if (slideCount <= 5) {
            return `**CẤU TRÚC ${slideCount} SLIDE:**
- Slide 1: **Giới thiệu bài học**
  - Tiêu đề bài học
  - Mục tiêu học tập
  - Tạo hứng thú ban đầu

- Slide 2-${slideCount - 1}: **Nội dung chính** (${slideCount - 2} slide)
  - Trình bày kiến thức cốt lõi
  - Chia nhỏ thành các phần logic
  - Mỗi slide tập trung 1 ý chính

- Slide ${slideCount}: **Kết luận và củng cố**
  - Tóm tắt kiến thức quan trọng
  - Câu hỏi ôn tập
  - Nhiệm vụ tiếp theo`;
        } else if (slideCount <= 10) {
            const mainSlides = slideCount - 2;
            return `**CẤU TRÚC ${slideCount} SLIDE:**
- Slide 1: **Giới thiệu bài học**
  - Tiêu đề và mục tiêu bài học
  - Tạo tình huống vào bài

- Slide 2-${slideCount - 1}: **Nội dung chính** (${mainSlides} slide)
  - Phần 1: Kiến thức cơ bản (${Math.ceil(mainSlides / 2)} slide)
  - Phần 2: Kiến thức nâng cao (${Math.floor(mainSlides / 2)} slide)
  - Mỗi slide tập trung 1 khái niệm chính

- Slide ${slideCount}: **Kết luận và vận dụng**
  - Tổng kết kiến thức
  - Ứng dụng thực tế
  - Bài tập về nhà`;
        } else {
            const introSlides = 1;
            const mainSlides = slideCount - 2;
            const conclusionSlides = 1;

            return `**CẤU TRÚC ${slideCount} SLIDE:**
- Slide 1: **Mở đầu**
  - Tiêu đề và giới thiệu bài học
  - Mục tiêu và tầm quan trọng

- Slide 2-8: **Phần 1 - Kiến thức cơ bản** (7 slide)
  - Các khái niệm cơ bản
  - Định nghĩa và đặc điểm
  - Ví dụ minh họa

- Slide 9-${slideCount - 1}: **Phần 2 - Kiến thức mở rộng** (${mainSlides - 7} slide)
  - Ứng dụng và thực hành
  - Liên hệ thực tiễn
  - Phân tích và đánh giá

- Slide ${slideCount}: **Kết luận**
  - Tóm tắt toàn bài
  - Câu hỏi tự kiểm tra
  - Hướng dẫn học tiếp`;
        }
    }

    /**
     * Content guidelines based on grade level
     */
    private static getContentGuidelines(gradeLevel: number): string {
        const baseGuidelines = `- Sử dụng ngôn ngữ rõ ràng, dễ hiểu phù hợp với học sinh lớp ${gradeLevel}
- Chia nhỏ thông tin thành các đơn vị dễ tiếp thu
- Tạo sự liên kết logic giữa các ý trong slide
- Sử dụng từ khóa quan trọng và làm nổi bật
- Tránh quá tải thông tin trong một slide`;

        const gradeSpecific = {
            6: `- Sử dụng nhiều hình ảnh minh họa và ví dụ cụ thể
- Ngôn ngữ đơn giản, gần gũi với học sinh mới vào THCS
- Tạo không khí học tập vui vẻ, thoải mái
- Kết hợp trò chơi và hoạt động tương tác`,

            7: `- Phát triển khả năng tư duy trừu tượng từ từ
- Tăng cường hoạt động thảo luận và làm việc nhóm
- Liên hệ với kiến thức đã học ở lớp 6
- Khuyến khích tính tự lập trong tư duy`,

            8: `- Phát triển tư duy logic và khả năng phân tích
- Tăng cường liên hệ với thực tiễn cuộc sống
- Sử dụng các tình huống thực tế để minh họa
- Chuẩn bị cho việc định hướng nghề nghiệp`,

            9: `- Tổng hợp và hệ thống hóa kiến thức toàn khóa
- Phát triển kỹ năng tự học và nghiên cứu
- Chuẩn bị cho kỳ thi tuyển sinh lớp 10
- Tăng cường luyện tập và ôn tập`
        };

        return `${baseGuidelines}
${gradeSpecific[gradeLevel as keyof typeof gradeSpecific] || ''}`;
    }

    /**
     * Format requirements for slide output
     */
    private static getFormatRequirements(): string {
        return `**Cho mỗi slide, cung cấp:**

1. **TIÊU ĐỀ SLIDE** (ngắn gọn, thu hút)
   - Tối đa 8-10 từ
   - Thể hiện rõ nội dung chính
   - Sử dụng font chữ lớn, dễ đọc

2. **NỘI DUNG CHÍNH** (3-5 bullet points)
   - Mỗi bullet point tối đa 1-2 dòng
   - Sử dụng từ khóa quan trọng
   - Trình bày logic, dễ hiểu
   - Tránh câu văn quá dài

3. **GỢI Ý HÌNH ẢNH/MINH HỌA**
   - Mô tả cụ thể loại hình ảnh cần thiết
   - Đề xuất biểu đồ, sơ đồ nếu phù hợp
   - Gợi ý màu sắc và bố cục
   - Đảm bảo phù hợp với nội dung

**Định dạng xuất:**
\`\`\`
SLIDE [SỐ]: [TIÊU ĐỀ]
• [Nội dung chính 1]
• [Nội dung chính 2]
• [Nội dung chính 3]
🖼️ Hình ảnh: [Mô tả gợi ý hình ảnh]
\`\`\``;
    }

    /**
     * Visual guidelines for images and layout
     */
    private static getVisualGuidelines(): string {
        return `**HƯỚNG DẪN HÌNH ẢNH VÀ MINH HỌA:**

**Loại hình ảnh phù hợp:**
- Ảnh thực tế liên quan đến bài học
- Sơ đồ, biểu đồ minh họa khái niệm
- Infographic đơn giản, dễ hiểu
- Hình vẽ minh họa phù hợp với lứa tuổi
- Bản đồ, timeline nếu cần thiết

**Nguyên tắc thiết kế:**
- Hình ảnh phải hỗ trợ nội dung, không chỉ trang trí
- Sử dụng màu sắc phù hợp với tâm lý học sinh THCS
- Đảm bảo hình ảnh rõ nét, chất lượng cao
- Tránh hình ảnh quá phức tạp hoặc gây phân tâm
- Cân bằng giữa text và hình ảnh

**Gợi ý bố cục:**
- 70% nội dung text, 30% hình ảnh
- Hình ảnh đặt ở vị trí thu hút sự chú ý
- Sử dụng không gian trắng hợp lý
- Font chữ lớn, dễ đọc từ xa
- Màu nền không làm mờ nội dung chính`;
    }
}