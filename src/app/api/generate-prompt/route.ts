import { NextRequest, NextResponse } from 'next/server';

interface PromptRequest {
    subject: string;
    grade: number;
    lessonName: string;
    objectives: string;
    language: string;
    style: string;
    outputType: string;
    uploadedContent?: string;
}

export async function POST(request: NextRequest) {
    try {
        const data: PromptRequest = await request.json();

        if (!data.lessonName?.trim()) {
            return NextResponse.json(
                { error: 'Tên bài học là bắt buộc' },
                { status: 400 }
            );
        }

        const prompt = generatePrompt(data);

        return NextResponse.json({
            prompt,
            metadata: {
                subject: data.subject,
                grade: data.grade,
                outputType: data.outputType,
                style: data.style,
                wordCount: prompt.split(/\s+/).length,
                charCount: prompt.length
            }
        });
    } catch (error) {
        console.error('Error generating prompt:', error);
        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi tạo prompt' },
            { status: 500 }
        );
    }
}

function generatePrompt(data: PromptRequest): string {
    const templates = {
        'giao-an': generateLessonPlanPrompt,
        'slide': generateSlidePrompt,
        'quiz': generateQuizPrompt,
        'rubric': generateRubricPrompt
    };

    const generator = templates[data.outputType as keyof typeof templates] || templates['giao-an'];
    return generator(data);
}

function generateLessonPlanPrompt(data: PromptRequest): string {
    const styleInstructions = {
        'ngan': 'Tạo kế hoạch bài dạy ngắn gọn, tập trung vào các hoạt động chính.',
        'chi-tiet': 'Tạo kế hoạch bài dạy chi tiết với mô tả cụ thể từng hoạt động.',
        'day-du': 'Tạo kế hoạch bài dạy đầy đủ với tất cả các thành phần và phụ lục.'
    };

    return `# PROMPT TẠO KẾ HOẠCH BÀI DẠY CHUYÊN NGHIỆP

## THÔNG TIN CƠ BẢN
- **Môn học:** ${data.subject}
- **Lớp:** ${data.grade}
- **Tên bài:** ${data.lessonName}
- **Mục tiêu:** ${data.objectives || 'Học sinh nắm được kiến thức cơ bản về bài học'}

## YÊU CẦU CHUYÊN MÔN
Bạn là một giáo viên ${data.subject} có 10+ năm kinh nghiệm. Hãy tạo một kế hoạch bài dạy hoàn chỉnh tuân thủ:
- ✅ Chuẩn GDPT 2018 (Chương trình Giáo dục phổ thông)
- ✅ Công văn 5512/BGDĐT-GDTrH về đổi mới phương pháp dạy học
- ✅ Phương pháp dạy học tích cực, lấy học sinh làm trung tâm

## ĐỊNH DẠNG KẾ HOẠCH BÀI DẠY 5 CỘT

| Hoạt động của GV | Hoạt động của HS | Nội dung kiến thức | Phương tiện dạy học | Ghi chú |
|------------------|------------------|-------------------|-------------------|---------|
| [Mô tả chi tiết] | [Mô tả chi tiết] | [Kiến thức cụ thể] | [Công cụ/tài liệu] | [Lưu ý] |

## CẤU TRÚC BÀI HỌC (45 phút)

### 1. KHỞI ĐỘNG (5 phút)
- Hoạt động khởi động hấp dẫn
- Kết nối với kiến thức cũ
- Đặt vấn đề dẫn dắt

### 2. HÌNH THÀNH KIẾN THỨC (30 phút)
- Hoạt động 1: [Tên hoạt động]
- Hoạt động 2: [Tên hoạt động]  
- Hoạt động 3: [Tên hoạt động]

### 3. LUYỆN TẬP - VẬN DỤNG (8 phút)
- Bài tập cá nhân
- Hoạt động nhóm
- Thảo luận lớp

### 4. TÓM TẮT - ĐÁNH GIÁ (2 phút)
- Tóm tắt kiến thức chính
- Đánh giá quá trình học
- Giao bài tập về nhà

## YÊU CẦU ĐẶC BIỆT
${styleInstructions[data.style as keyof typeof styleInstructions]}

- Sử dụng phương pháp dạy học tích cực (thảo luận nhóm, học tập hợp tác, giải quyết vấn đề)
- Tích hợp công nghệ thông tin phù hợp
- Phân hóa giáo dục cho học sinh có năng lực khác nhau
- Đánh giá đa dạng (đánh giá quá trình, sản phẩm, thái độ)

${data.uploadedContent ? `\n## TÀI LIỆU THAM KHẢO\n${data.uploadedContent}\n` : ''}

## OUTPUT MONG MUỐN
Hãy tạo kế hoạch bài dạy hoàn chỉnh bằng tiếng Việt, bao gồm:
1. Bảng kế hoạch bài dạy 5 cột chi tiết
2. Phụ lục: Bài tập, tài liệu phát tay (nếu có)
3. Gợi ý mở rộng cho học sinh giỏi
4. Hỗ trợ cho học sinh yếu

**Lưu ý:** Đảm bảo nội dung phù hợp với độ tuổi và trình độ học sinh lớp ${data.grade}.`;
}

function generateSlidePrompt(data: PromptRequest): string {
    return `# PROMPT TẠO SLIDE THUYẾT TRÌNH

## THÔNG TIN CƠ BẢN
- **Môn học:** ${data.subject}
- **Lớp:** ${data.grade}
- **Chủ đề:** ${data.lessonName}
- **Mục tiêu:** ${data.objectives || 'Trình bày kiến thức một cách sinh động và dễ hiểu'}

## YÊU CẦU THIẾT KẾ
Tạo dàn ý cho bộ slide thuyết trình gồm 10-12 slide với cấu trúc:

### SLIDE 1: TIÊU ĐỀ
- Tên bài học
- Môn học và lớp
- Họ tên giáo viên

### SLIDE 2: MỤC TIÊU BÀI HỌC
- 3-4 mục tiêu cụ thể
- Sử dụng động từ hành động

### SLIDE 3-4: KIẾN THỨC CŨ
- Ôn tập kiến thức liên quan
- Câu hỏi kích hoạt tư duy

### SLIDE 5-9: NỘI DUNG CHÍNH
- Chia thành 3-5 ý chính
- Mỗi slide 1 ý chính
- Có hình ảnh minh họa
- Ví dụ cụ thể

### SLIDE 10: LUYỆN TẬP
- Bài tập áp dụng
- Hoạt động tương tác

### SLIDE 11: TÓM TẮT
- Những điểm chính của bài
- Sơ đồ tư duy

### SLIDE 12: BÀI TẬP VỀ NHÀ
- Câu hỏi ôn tập
- Bài tập thực hành

## GỢI Ý HÌNH ẢNH
Đề xuất hình ảnh, biểu đồ, video phù hợp cho từng slide.

${data.uploadedContent ? `\n## TÀI LIỆU THAM KHẢO\n${data.uploadedContent}\n` : ''}

Hãy tạo dàn ý chi tiết bằng tiếng Việt, phù hợp với học sinh lớp ${data.grade}.`;
}

function generateQuizPrompt(data: PromptRequest): string {
    return `# PROMPT TẠO CÂU HỎI TRẮC NGHIỆM

## THÔNG TIN CƠ BẢN
- **Môn học:** ${data.subject}
- **Lớp:** ${data.grade}
- **Chủ đề:** ${data.lessonName}
- **Mục tiêu đánh giá:** ${data.objectives || 'Kiểm tra hiểu biết của học sinh về bài học'}

## YÊU CẦU TẠO CÂU HỎI

### CẤU TRÚC BỘ ĐỀ
- **Tổng số:** 15 câu hỏi trắc nghiệm
- **Thời gian:** 15 phút
- **Hình thức:** 4 đáp án A, B, C, D

### PHÂN BỐ THEO THANG BLOOM
1. **Nhận biết (40% - 6 câu):** Nhớ lại kiến thức cơ bản
2. **Hiểu (40% - 6 câu):** Giải thích, so sánh, phân loại
3. **Vận dụng (20% - 3 câu):** Áp dụng vào tình huống mới

### ĐỊNH DẠNG CÂU HỎI
**Câu [số]: [Nội dung câu hỏi]**
A. [Đáp án A]
B. [Đáp án B]  
C. [Đáp án C]
D. [Đáp án D]

**Đáp án:** [Đáp án đúng]
**Giải thích:** [Lý do tại sao đáp án này đúng]

## YÊU CẦU CHẤT LƯỢNG
- Câu hỏi rõ ràng, không gây nhầm lẫn
- Đáp án sai hợp lý, không quá dễ loại trừ
- Phù hợp với trình độ học sinh lớp ${data.grade}
- Bao quát nội dung chính của bài học

${data.uploadedContent ? `\n## TÀI LIỆU THAM KHẢO\n${data.uploadedContent}\n` : ''}

Hãy tạo bộ câu hỏi hoàn chỉnh bằng tiếng Việt với đáp án và giải thích chi tiết.`;
}

function generateRubricPrompt(data: PromptRequest): string {
    return `# PROMPT TẠO THANG ĐÁNH GIÁ (RUBRIC)

## THÔNG TIN CƠ BẢN
- **Môn học:** ${data.subject}
- **Lớp:** ${data.grade}
- **Hoạt động đánh giá:** ${data.lessonName}
- **Mục tiêu:** ${data.objectives || 'Đánh giá năng lực học sinh một cách toàn diện'}

## CẤU TRÚC THANG ĐÁNH GIÁ

### 4 MỨC ĐỘ ĐÁNH GIÁ
1. **Xuất sắc (4 điểm):** Vượt mong đợi
2. **Tốt (3 điểm):** Đạt mong đợi  
3. **Đạt (2 điểm):** Gần đạt mong đợi
4. **Chưa đạt (1 điểm):** Dưới mong đợi

### 6 TIÊU CHÍ ĐÁNH GIÁ

#### 1. KIẾN THỨC NỘI DUNG
- Mức 4: [Mô tả cụ thể]
- Mức 3: [Mô tả cụ thể]
- Mức 2: [Mô tả cụ thể]  
- Mức 1: [Mô tả cụ thể]

#### 2. KỸ NĂNG VẬN DỤNG
- Mức 4: [Mô tả cụ thể]
- Mức 3: [Mô tả cụ thể]
- Mức 2: [Mô tả cụ thể]
- Mức 1: [Mô tả cụ thể]

#### 3. THÁI ĐỘ HỌC TẬP
- Mức 4: [Mô tả cụ thể]
- Mức 3: [Mô tả cụ thể]
- Mức 2: [Mô tả cụ thể]
- Mức 1: [Mô tả cụ thể]

#### 4. KỸ NĂNG GIAO TIẾP
- Mức 4: [Mô tả cụ thể]
- Mức 3: [Mô tả cụ thể]
- Mức 2: [Mô tả cụ thể]
- Mức 1: [Mô tả cụ thể]

#### 5. TƯ DUY SÁNG TẠO
- Mức 4: [Mô tả cụ thể]
- Mức 3: [Mô tả cụ thể]
- Mức 2: [Mô tả cụ thể]
- Mức 1: [Mô tả cụ thể]

#### 6. HỢP TÁC NHÓM
- Mức 4: [Mô tả cụ thể]
- Mức 3: [Mô tả cụ thể]
- Mức 2: [Mô tả cụ thể]
- Mức 1: [Mô tả cụ thể]

## BẢNG TỔNG KẾT ĐIỂM
- **Tổng điểm tối đa:** 24 điểm
- **Phân loại:**
  - Xuất sắc: 22-24 điểm
  - Tốt: 18-21 điểm  
  - Đạt: 12-17 điểm
  - Chưa đạt: Dưới 12 điểm

${data.uploadedContent ? `\n## TÀI LIỆU THAM KHẢO\n${data.uploadedContent}\n` : ''}

Hãy tạo thang đánh giá chi tiết bằng tiếng Việt, phù hợp với học sinh lớp ${data.grade} và đặc thù môn ${data.subject}.`;
}