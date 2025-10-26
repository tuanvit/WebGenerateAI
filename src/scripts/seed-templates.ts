/**
 * Script to seed database with sample templates
 */

import { TemplatesService } from '@/lib/admin/services/templates-service';
import { TemplateData } from '@/lib/admin/repositories/templates-repository-db';

const sampleTemplates: TemplateData[] = [
    {
        name: 'Kế hoạch bài dạy Toán theo CV 5512',
        description: 'Template soạn kế hoạch bài dạy môn Toán với cấu trúc 5 cột theo Công văn 5512',
        subject: 'Toán',
        gradeLevel: [6, 7, 8, 9],
        outputType: 'lesson-plan',
        templateContent: `Bạn là một giáo viên Toán THCS chuyên nghiệp. Hãy soạn kế hoạch bài dạy chi tiết cho bài học "{{lessonName}}" lớp {{gradeLevel}} theo Công văn 5512 và GDPT 2018.

**THÔNG TIN BÀI HỌC:**
- Môn học: Toán
- Lớp: {{gradeLevel}}
- Tên bài: {{lessonName}}
- Thời gian: 45 phút
- Mục tiêu cụ thể: {{objectives}}

**YÊU CẦU CHUYÊN MÔN TOÁN:**
- Phát triển năng lực toán học: tư duy và lập luận toán học, mô hình hóa toán học, giải quyết vấn đề toán học, giao tiếp toán học, sử dụng công cụ và phương tiện học toán
- Áp dụng phương pháp dạy học tích cực: khám phá, giải quyết vấn đề, hợp tác nhóm
- Sử dụng công cụ hỗ trợ: {{recommendedTools}}

**CẤU TRÚC KẾ HOẠCH BÀI DẠY 5 CỘT:**
| Hoạt động của GV | Hoạt động của HS | Nội dung kiến thức | Phương tiện dạy học | Ghi chú |

**TIẾN TRÌNH DẠY HỌC:**

**1. HOẠT ĐỘNG KHỞI ĐỘNG (5 phút)**
- Mục tiêu: Tạo hứng thú, liên hệ kiến thức cũ
- Tình huống thực tế liên quan đến {{topicContext}}
- Câu hỏi gợi mở tư duy toán học

**2. HÌNH THÀNH KIẾN THỨC (25 phút)**
- Hoạt động khám phá: {{explorationActivity}}
- Xây dựng khái niệm/định lý/công thức
- Ví dụ minh họa với các mức độ khó tăng dần
- Củng cố kiến thức qua bài tập

**3. LUYỆN TẬP (10 phút)**
- Bài tập nhận biết (2 bài)
- Bài tập thông hiểu (2 bài)  
- Bài tập vận dụng (1 bài)

**4. VẬN DỤNG VÀ MỞ RỘNG (5 phút)**
- Bài toán thực tế ứng dụng kiến thức
- Liên hệ với các môn học khác
- Dặn dò bài tập về nhà

**ĐÁNH GIÁ:**
- Đánh giá quá trình: quan sát hoạt động HS
- Đánh giá kết quả: câu hỏi kiểm tra, bài tập
- Tiêu chí đánh giá theo 4 mức độ: Xuất sắc, Tốt, Đạt, Chưa đạt

Vui lòng tạo kế hoạch bài dạy chi tiết theo cấu trúc trên, đảm bảo tuân thủ CV 5512 và phát triển năng lực toán học cho học sinh.`,
        difficulty: 'intermediate',
        recommendedTools: ['geogebra', 'desmos', 'canva-ai'],
        tags: ['CV5512', 'GDPT2018', 'NăngLựcToánHọc', 'TưDuyLogic'],
        compliance: ['GDPT 2018', 'CV 5512', 'Chuẩn năng lực Toán học'],
        variables: [
            { name: 'lessonName', label: 'Tên bài học', type: 'text', required: true, placeholder: 'VD: Phương trình bậc nhất một ẩn' },
            { name: 'gradeLevel', label: 'Lớp', type: 'select', required: true, options: ['6', '7', '8', '9'] },
            { name: 'objectives', label: 'Mục tiêu cụ thể', type: 'textarea', required: true, placeholder: 'Mục tiêu kiến thức, kỹ năng, thái độ...' },
            { name: 'topicContext', label: 'Bối cảnh thực tế', type: 'text', required: false, placeholder: 'VD: Tính toán chi phí, đo đạc thực tế...' },
            { name: 'explorationActivity', label: 'Hoạt động khám phá', type: 'textarea', required: false, placeholder: 'Mô tả hoạt động để HS tự khám phá kiến thức' },
            { name: 'recommendedTools', label: 'Công cụ hỗ trợ', type: 'multiselect', required: false, options: ['GeoGebra', 'Máy tính', 'Thước kẻ', 'Compa', 'Bảng số'] }
        ],
        examples: [
            {
                title: 'Phương trình bậc nhất - Lớp 8',
                description: 'Ví dụ kế hoạch bài dạy về phương trình bậc nhất một ẩn',
                sampleInput: {
                    lessonName: 'Phương trình bậc nhất một ẩn',
                    gradeLevel: '8',
                    objectives: 'HS hiểu khái niệm phương trình bậc nhất, biết giải và ứng dụng vào bài toán thực tế',
                    topicContext: 'Tính tuổi, tính chi phí mua hàng',
                    explorationActivity: 'Cho HS giải bài toán tìm số tự nhiên, dẫn đến phương trình'
                },
                expectedOutput: 'Kế hoạch bài dạy 5 cột chi tiết với các hoạt động cụ thể...'
            }
        ]
    },
    {
        name: 'Phân tích tác phẩm văn học',
        description: 'Template phân tích tác phẩm văn học với phương pháp tiếp cận hiện đại',
        subject: 'Văn',
        gradeLevel: [6, 7, 8, 9],
        outputType: 'lesson-plan',
        templateContent: `Bạn là giáo viên Ngữ văn THCS giàu kinh nghiệm. Hãy soạn kế hoạch bài dạy phân tích tác phẩm "{{workTitle}}" của tác giả {{author}} cho lớp {{gradeLevel}}.

**THÔNG TIN TÁC PHẨM:**
- Tên tác phẩm: {{workTitle}}
- Tác giả: {{author}}
- Thể loại: {{genre}}
- Lớp: {{gradeLevel}}
- Mục tiêu: {{objectives}}

**ĐỊNH HƯỚNG PHƯƠNG PHÁP:**
- Phát triển năng lực đọc hiểu: nhận biết, thông hiểu, vận dụng, phân tích, tổng hợp, đánh giá
- Phát triển năng lực văn học: cảm thụ văn học, tư duy sáng tạo về văn học
- Phương pháp: đàm thoại, thảo luận nhóm, trải nghiệm cá nhân

**TIẾN TRÌNH DẠY HỌC:**

**1. KHỞI ĐỘNG (7 phút)**
- Tạo tình huống gợi mở: {{openingSituation}}
- Giới thiệu tác giả và bối cảnh sáng tác
- Đặt vấn đề cho bài học

**2. HÌNH THÀNH KIẾN THỨC (30 phút)**

**a) Đọc và cảm nhận ban đầu (10 phút)**
- HS đọc thầm/nghe đọc tác phẩm
- Chia sẻ cảm nhận, ấn tượng đầu tiên
- GV ghi nhận và định hướng

**b) Phân tích nội dung (10 phút)**
- Nội dung chính: {{mainContent}}
- Nhân vật: {{characters}}
- Hoàn cảnh, bối cảnh: {{setting}}
- Tình huống, sự việc: {{plot}}

**c) Phân tích nghệ thuật (10 phút)**
- Ngôn ngữ, từ ngữ: {{language}}
- Biện pháp tu từ: {{rhetoricalDevices}}
- Cấu trúc, bố cục: {{structure}}
- Giọng điệu, âm hưởng: {{tone}}

**3. LUYỆN TẬP VÀ VẬN DỤNG (8 phút)**
- Câu hỏi đọc hiểu các mức độ
- Liên hệ với thực tế đời sống
- Rút ra bài học, ý nghĩa

**CÂU HỎI PHÂN TÍCH:**
1. Nhận biết: {{recognitionQuestions}}
2. Thông hiểu: {{comprehensionQuestions}}  
3. Vận dụng: {{applicationQuestions}}
4. Phân tích: {{analysisQuestions}}
5. Đánh giá: {{evaluationQuestions}}

**HOẠT ĐỘNG NHÓM:**
- Chia lớp thành 4 nhóm, mỗi nhóm phân tích một khía cạnh
- Thời gian thảo luận: 5 phút
- Báo cáo kết quả: mỗi nhóm 2 phút

**ĐÁNH GIÁ:**
- Đánh giá khả năng đọc hiểu và cảm thụ văn học
- Đánh giá kỹ năng phân tích, lập luận
- Đánh giá thái độ học tập và tham gia hoạt động

Hãy tạo kế hoạch bài dạy chi tiết theo hướng dẫn trên, phù hợp với đặc điểm tác phẩm và trình độ học sinh.`,
        difficulty: 'intermediate',
        recommendedTools: ['chatgpt', 'gemini', 'canva-ai'],
        tags: ['VănHọc', 'PhânTích', 'CảmThụ', 'TưDuyVănHọc'],
        compliance: ['GDPT 2018', 'CV 5512', 'Chuẩn năng lực Ngữ văn'],
        variables: [
            { name: 'workTitle', label: 'Tên tác phẩm', type: 'text', required: true, placeholder: 'VD: Tự tình II' },
            { name: 'author', label: 'Tác giả', type: 'text', required: true, placeholder: 'VD: Hồ Xuân Hương' },
            { name: 'genre', label: 'Thể loại', type: 'select', required: true, options: ['Thơ', 'Truyện ngắn', 'Truyện dài', 'Kịch', 'Tản văn'] },
            { name: 'gradeLevel', label: 'Lớp', type: 'select', required: true, options: ['6', '7', '8', '9'] },
            { name: 'objectives', label: 'Mục tiêu bài học', type: 'textarea', required: true },
            { name: 'openingSituation', label: 'Tình huống khởi động', type: 'textarea', required: false },
            { name: 'mainContent', label: 'Nội dung chính', type: 'textarea', required: false },
            { name: 'characters', label: 'Nhân vật', type: 'text', required: false },
            { name: 'language', label: 'Đặc điểm ngôn ngữ', type: 'textarea', required: false }
        ],
        examples: [
            {
                title: 'Tự tình II - Hồ Xuân Hương',
                description: 'Phân tích bài thơ Tự tình II',
                sampleInput: {
                    workTitle: 'Tự tình II',
                    author: 'Hồ Xuân Hương',
                    genre: 'Thơ',
                    gradeLevel: '9',
                    objectives: 'Hiểu nội dung và nghệ thuật của bài thơ, cảm nhận tâm trạng của tác giả'
                },
                expectedOutput: 'Kế hoạch bài dạy phân tích chi tiết bài thơ với các hoạt động cụ thể...'
            }
        ]
    }
];

async function seedTemplates() {
    try {
        console.log('Starting template seeding...');

        const templatesService = new TemplatesService();

        // Check if templates already exist
        const existingTemplates = await templatesService.getTemplates({ limit: 1 });

        if (existingTemplates.total > 0) {
            console.log(`Database already has ${existingTemplates.total} templates. Skipping seed.`);
            return;
        }

        console.log('Database is empty. Creating sample templates...');

        for (const templateData of sampleTemplates) {
            try {
                const created = await templatesService.createTemplate(templateData, 'system');
                console.log(`✓ Created template: ${created.name} (ID: ${created.id})`);
            } catch (error) {
                console.error(`✗ Failed to create template: ${templateData.name}`, error);
            }
        }

        console.log('Template seeding completed!');

    } catch (error) {
        console.error('Error seeding templates:', error);
        throw error;
    }
}

// Export for use in other scripts
export { seedTemplates, sampleTemplates };

// Run if called directly
if (require.main === module) {
    seedTemplates()
        .then(() => {
            console.log('Seeding completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Seeding failed:', error);
            process.exit(1);
        });
}