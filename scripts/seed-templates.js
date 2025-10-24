const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sampleTemplates = [
    {
        name: 'Giáo án Toán lớp 6 - Phân số',
        description: 'Template tạo giáo án môn Toán về phân số cho lớp 6',
        subject: 'Toán',
        gradeLevel: JSON.stringify([6]),
        outputType: 'lesson-plan',
        templateContent: `Bạn là một giáo viên Toán THCS chuyên nghiệp. Hãy soạn giáo án chi tiết cho bài học "{{lessonName}}" lớp {{gradeLevel}} theo Công văn 5512 và GDPT 2018.

**THÔNG TIN BÀI HỌC:**
- Môn học: Toán
- Lớp: {{gradeLevel}}
- Tên bài: {{lessonName}}
- Thời gian: 45 phút
- Mục tiêu cụ thể: {{objectives}}

**TIẾN TRÌNH DẠY HỌC:**

**1. HOẠT ĐỘNG KHỞI ĐỘNG (5 phút)**
- Tạo tình huống thực tế về {{context}}
- Đặt câu hỏi gợi mở

**2. HÌNH THÀNH KIẾN THỨC (25 phút)**
- Hoạt động khám phá
- Xây dựng khái niệm
- Ví dụ minh họa

**3. LUYỆN TẬP (10 phút)**
- Bài tập nhận biết
- Bài tập thông hiểu
- Bài tập vận dụng

**4. VẬN DỤNG VÀ MỞ RỘNG (5 phút)**
- Bài toán thực tế
- Dặn dò bài tập về nhà`,
        difficulty: 'beginner',
        recommendedTools: JSON.stringify(['chatgpt', 'gemini']),
        tags: JSON.stringify(['CV5512', 'GDPT2018', 'Toán6']),
        compliance: JSON.stringify(['GDPT 2018', 'CV 5512']),
        variables: {
            create: [
                {
                    name: 'lessonName',
                    label: 'Tên bài học',
                    type: 'text',
                    required: true,
                    placeholder: 'VD: Phân số bằng nhau'
                },
                {
                    name: 'gradeLevel',
                    label: 'Lớp',
                    type: 'select',
                    required: true,
                    options: JSON.stringify(['6'])
                },
                {
                    name: 'objectives',
                    label: 'Mục tiêu bài học',
                    type: 'textarea',
                    required: true,
                    placeholder: 'Mục tiêu kiến thức, kỹ năng, thái độ...'
                },
                {
                    name: 'context',
                    label: 'Bối cảnh thực tế',
                    type: 'text',
                    required: false,
                    placeholder: 'VD: Chia bánh, chia kẹo...'
                }
            ]
        },
        examples: {
            create: [
                {
                    title: 'Phân số bằng nhau - Lớp 6',
                    description: 'Ví dụ giáo án về phân số bằng nhau',
                    sampleInput: JSON.stringify({
                        lessonName: 'Phân số bằng nhau',
                        gradeLevel: '6',
                        objectives: 'HS hiểu khái niệm phân số bằng nhau, biết nhận biết và tìm phân số bằng nhau',
                        context: 'Chia bánh pizza'
                    }),
                    expectedOutput: 'Giáo án chi tiết với các hoạt động cụ thể...'
                }
            ]
        }
    },
    {
        name: 'Bài thuyết trình Ngữ văn - Phân tích tác phẩm',
        description: 'Template tạo bài thuyết trình phân tích tác phẩm văn học',
        subject: 'Ngữ văn',
        gradeLevel: JSON.stringify([8, 9]),
        outputType: 'presentation',
        templateContent: `Bạn là một giáo viên Ngữ văn THCS. Hãy tạo bài thuyết trình phân tích tác phẩm "{{workTitle}}" của tác giả {{author}} cho lớp {{gradeLevel}}.

**THÔNG TIN TÁC PHẨM:**
- Tên tác phẩm: {{workTitle}}
- Tác giả: {{author}}
- Thể loại: {{genre}}
- Lớp: {{gradeLevel}}

**CẤU TRÚC BÀI THUYẾT TRÌNH:**

**Slide 1: Giới thiệu**
- Tên tác phẩm và tác giả
- Bối cảnh sáng tác

**Slide 2-3: Nội dung chính**
- Tóm tắt nội dung
- Nhân vật chính
- Chủ đề, ý tưởng

**Slide 4-5: Nghệ thuật**
- Ngôn ngữ, từ ngữ
- Biện pháp tu từ
- Cấu trúc, bố cục

**Slide 6: Ý nghĩa**
- Giá trị nội dung
- Giá trị nghệ thuật
- Ý nghĩa hiện thực

**Slide 7: Kết luận**
- Tổng kết những điểm nổi bật
- Bài học rút ra`,
        difficulty: 'intermediate',
        recommendedTools: JSON.stringify(['canva-ai', 'gamma-app', 'chatgpt']),
        tags: JSON.stringify(['VănHọc', 'PhânTích', 'Presentation']),
        compliance: JSON.stringify(['GDPT 2018']),
        variables: {
            create: [
                {
                    name: 'workTitle',
                    label: 'Tên tác phẩm',
                    type: 'text',
                    required: true,
                    placeholder: 'VD: Tự tình II'
                },
                {
                    name: 'author',
                    label: 'Tác giả',
                    type: 'text',
                    required: true,
                    placeholder: 'VD: Hồ Xuân Hương'
                },
                {
                    name: 'genre',
                    label: 'Thể loại',
                    type: 'select',
                    required: true,
                    options: JSON.stringify(['Thơ', 'Truyện ngắn', 'Truyện dài', 'Kịch'])
                },
                {
                    name: 'gradeLevel',
                    label: 'Lớp',
                    type: 'select',
                    required: true,
                    options: JSON.stringify(['8', '9'])
                }
            ]
        }
    },
    {
        name: 'Đề kiểm tra Khoa học tự nhiên',
        description: 'Template tạo đề kiểm tra môn Khoa học tự nhiên',
        subject: 'Khoa học tự nhiên',
        gradeLevel: JSON.stringify([6, 7]),
        outputType: 'assessment',
        templateContent: `Bạn là một giáo viên Khoa học tự nhiên THCS. Hãy tạo đề kiểm tra {{testType}} cho chủ đề "{{topic}}" lớp {{gradeLevel}}.

**THÔNG TIN ĐỀ KIỂM TRA:**
- Môn: Khoa học tự nhiên
- Lớp: {{gradeLevel}}
- Chủ đề: {{topic}}
- Thời gian: {{duration}} phút
- Loại đề: {{testType}}

**CẤU TRÚC ĐỀ:**

**PHẦN I: TRẮC NGHIỆM ({{multipleChoicePoints}} điểm)**
Chọn đáp án đúng nhất:

[Tạo {{multipleChoiceCount}} câu trắc nghiệm từ dễ đến khó]

**PHẦN II: TỰ LUẬN ({{essayPoints}} điểm)**

Câu 1: ({{question1Points}} điểm) {{question1Type}}
Câu 2: ({{question2Points}} điểm) {{question2Type}}
Câu 3: ({{question3Points}} điểm) {{question3Type}}

**ĐÁP ÁN VÀ BIỂU ĐIỂM:**
[Cung cấp đáp án chi tiết và thang điểm]

**YÊU CẦU:**
- Câu hỏi phù hợp với trình độ lớp {{gradeLevel}}
- Đảm bảo các mức độ nhận thức: Nhận biết, Thông hiểu, Vận dụng
- Liên hệ với thực tế đời sống`,
        difficulty: 'intermediate',
        recommendedTools: JSON.stringify(['chatgpt', 'gemini']),
        tags: JSON.stringify(['KiểmTra', 'KHTN', 'Assessment']),
        compliance: JSON.stringify(['GDPT 2018']),
        variables: {
            create: [
                {
                    name: 'topic',
                    label: 'Chủ đề kiểm tra',
                    type: 'text',
                    required: true,
                    placeholder: 'VD: Chuyển động cơ học'
                },
                {
                    name: 'gradeLevel',
                    label: 'Lớp',
                    type: 'select',
                    required: true,
                    options: JSON.stringify(['6', '7'])
                },
                {
                    name: 'testType',
                    label: 'Loại kiểm tra',
                    type: 'select',
                    required: true,
                    options: JSON.stringify(['15 phút', '1 tiết', 'Giữa kì', 'Cuối kì'])
                },
                {
                    name: 'duration',
                    label: 'Thời gian (phút)',
                    type: 'select',
                    required: true,
                    options: JSON.stringify(['15', '45', '60', '90'])
                },
                {
                    name: 'multipleChoiceCount',
                    label: 'Số câu trắc nghiệm',
                    type: 'select',
                    required: true,
                    options: JSON.stringify(['5', '8', '10', '12'])
                }
            ]
        }
    }
];

async function seedTemplates() {
    try {
        console.log('🌱 Bắt đầu seed templates...');

        // Clear existing templates
        await prisma.templateExample.deleteMany();
        await prisma.templateVariable.deleteMany();
        await prisma.template.deleteMany();

        console.log('🗑️ Đã xóa dữ liệu cũ');

        // Create new templates
        for (const templateData of sampleTemplates) {
            const template = await prisma.template.create({
                data: templateData,
                include: {
                    variables: true,
                    examples: true
                }
            });
            console.log(`✅ Đã tạo template: ${template.name}`);
        }

        console.log('🎉 Seed templates thành công!');
        console.log(`📊 Đã tạo ${sampleTemplates.length} templates`);

    } catch (error) {
        console.error('❌ Lỗi khi seed templates:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the seed function
seedTemplates()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });