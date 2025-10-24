const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const additionalTemplates = [
    // Ngữ văn templates
    {
        name: 'Giáo án Ngữ văn - Phân tích văn bản',
        description: 'Template tạo giáo án phân tích văn bản cho môn Ngữ văn',
        subject: 'Ngữ văn',
        gradeLevel: JSON.stringify([8, 9]),
        outputType: 'lesson-plan',
        templateContent: `Bạn là một giáo viên Ngữ văn THCS chuyên nghiệp. Hãy soạn giáo án phân tích văn bản "{{workTitle}}" của tác giả {{author}} cho lớp {{gradeLevel}}.

**THÔNG TIN VĂN BẢN:**
- Tác phẩm: {{workTitle}}
- Tác giả: {{author}}
- Thể loại: {{genre}}
- Lớp: {{gradeLevel}}
- Thời gian: 45 phút

**MỤC TIÊU BÀI HỌC:**
- Kiến thức: {{knowledgeObjectives}}
- Kỹ năng: {{skillObjectives}}
- Thái độ: {{attitudeObjectives}}

**TIẾN TRÌNH DẠY HỌC:**

**1. HOẠT ĐỘNG KHỞI ĐỘNG (5 phút)**
- Giới thiệu tác giả và bối cảnh sáng tác
- Tạo tình huống gợi mở: {{openingSituation}}

**2. HÌNH THÀNH KIẾN THỨC (30 phút)**

**a) Đọc và cảm nhận ban đầu (8 phút)**
- HS đọc thầm/nghe đọc văn bản
- Chia sẻ cảm nhận đầu tiên

**b) Phân tích nội dung (12 phút)**
- Nội dung chính: {{mainContent}}
- Nhân vật: {{characters}}
- Tình huống: {{situation}}

**c) Phân tích nghệ thuật (10 phút)**
- Ngôn ngữ: {{language}}
- Biện pháp tu từ: {{rhetoricalDevices}}
- Cấu trúc: {{structure}}

**3. LUYỆN TẬP VÀ VẬN DỤNG (10 phút)**
- Câu hỏi đọc hiểu
- Liên hệ thực tế
- Rút ra bài học

**ĐÁNH GIÁ:**
- Đánh giá khả năng đọc hiểu và cảm thụ văn học
- Đánh giá kỹ năng phân tích và lập luận`,
        difficulty: 'intermediate',
        recommendedTools: JSON.stringify(['chatgpt', 'gemini']),
        tags: JSON.stringify(['NgữVăn', 'PhânTích', 'VănBản']),
        compliance: JSON.stringify(['GDPT 2018', 'CV 5512']),
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
                    options: JSON.stringify(['Thơ', 'Truyện ngắn', 'Truyện dài', 'Kịch', 'Tản văn'])
                },
                {
                    name: 'gradeLevel',
                    label: 'Lớp',
                    type: 'select',
                    required: true,
                    options: JSON.stringify(['8', '9'])
                },
                {
                    name: 'knowledgeObjectives',
                    label: 'Mục tiêu kiến thức',
                    type: 'textarea',
                    required: true,
                    placeholder: 'HS hiểu được nội dung, nghệ thuật của tác phẩm...'
                }
            ]
        }
    },

    // Khoa học tự nhiên templates
    {
        name: 'Giáo án KHTN - Thí nghiệm khoa học',
        description: 'Template tạo giáo án thí nghiệm cho môn Khoa học tự nhiên',
        subject: 'Khoa học tự nhiên',
        gradeLevel: JSON.stringify([6, 7]),
        outputType: 'lesson-plan',
        templateContent: `Bạn là một giáo viên Khoa học tự nhiên THCS. Hãy thiết kế bài học thí nghiệm "{{experimentName}}" cho lớp {{gradeLevel}}.

**THÔNG TIN BÀI HỌC:**
- Tên thí nghiệm: {{experimentName}}
- Lĩnh vực: {{field}}
- Lớp: {{gradeLevel}}
- Thời gian: 45 phút

**MỤC TIÊU:**
- Kiến thức: {{knowledgeGoals}}
- Kỹ năng: Phát triển kỹ năng quan sát, thí nghiệm, rút ra kết luận
- Thái độ: Yêu thích khoa học, tính cẩn thận trong thí nghiệm

**CHUẨN BỊ:**
- Dụng cụ: {{equipment}}
- Hóa chất/Vật liệu: {{materials}}
- An toàn: {{safetyMeasures}}

**TIẾN TRÌNH DẠY HỌC:**

**1. KHỞI ĐỘNG (5 phút)**
- Hiện tượng thực tế: {{realPhenomenon}}
- Đặt câu hỏi khoa học: {{scientificQuestion}}

**2. HÌNH THÀNH KIẾN THỨC (30 phút)**

**a) Thiết kế thí nghiệm (10 phút)**
- Xác định mục đích thí nghiệm
- Dự đoán kết quả: {{hypothesis}}
- Lên kế hoạch thí nghiệm

**b) Thực hiện thí nghiệm (15 phút)**
- Hướng dẫn an toàn
- HS thực hiện theo nhóm
- Quan sát và ghi chép kết quả

**c) Phân tích kết quả (5 phút)**
- So sánh với dự đoán
- Giải thích hiện tượng
- Rút ra quy luật

**3. VẬN DỤNG (10 phút)**
- Ứng dụng trong đời sống: {{applications}}
- Bài tập vận dụng

**ĐÁNH GIÁ:**
- Kỹ năng thí nghiệm và quan sát
- Khả năng giải thích hiện tượng khoa học`,
        difficulty: 'intermediate',
        recommendedTools: JSON.stringify(['chatgpt', 'phet-simulation']),
        tags: JSON.stringify(['KHTN', 'ThíNghiệm', 'KhámPhá']),
        compliance: JSON.stringify(['GDPT 2018', 'CV 5512']),
        variables: {
            create: [
                {
                    name: 'experimentName',
                    label: 'Tên thí nghiệm',
                    type: 'text',
                    required: true,
                    placeholder: 'VD: Sự nở vì nhiệt của chất rắn'
                },
                {
                    name: 'field',
                    label: 'Lĩnh vực',
                    type: 'select',
                    required: true,
                    options: JSON.stringify(['Vật lý', 'Hóa học', 'Sinh học'])
                },
                {
                    name: 'gradeLevel',
                    label: 'Lớp',
                    type: 'select',
                    required: true,
                    options: JSON.stringify(['6', '7'])
                },
                {
                    name: 'knowledgeGoals',
                    label: 'Mục tiêu kiến thức',
                    type: 'textarea',
                    required: true,
                    placeholder: 'HS hiểu được...'
                },
                {
                    name: 'equipment',
                    label: 'Dụng cụ thí nghiệm',
                    type: 'textarea',
                    required: true,
                    placeholder: 'Cốc thủy tinh, đèn cồn, nhiệt kế...'
                }
            ]
        }
    },

    // Lịch sử & Địa lí templates
    {
        name: 'Giáo án Lịch sử - Sự kiện lịch sử',
        description: 'Template tạo giáo án về sự kiện lịch sử quan trọng',
        subject: 'Lịch sử & Địa lí',
        gradeLevel: JSON.stringify([6, 7, 8, 9]),
        outputType: 'lesson-plan',
        templateContent: `Bạn là một giáo viên Lịch sử THCS. Hãy soạn giáo án về sự kiện "{{eventName}}" cho lớp {{gradeLevel}}.

**THÔNG TIN BÀI HỌC:**
- Sự kiện: {{eventName}}
- Thời gian: {{timeperiod}}
- Lớp: {{gradeLevel}}
- Thời lượng: 45 phút

**MỤC TIÊU:**
- Kiến thức: {{knowledgeObjectives}}
- Kỹ năng: Phát triển kỹ năng phân tích sử liệu, tư duy lịch sử
- Thái độ: {{attitudeObjectives}}

**TIẾN TRÌNH DẠY HỌC:**

**1. KHỞI ĐỘNG (5 phút)**
- Tình huống mở đầu: {{openingSituation}}
- Đặt vấn đề: {{problemStatement}}

**2. BÀI MỚI (30 phút)**

**a) Bối cảnh lịch sử (8 phút)**
- Hoàn cảnh trước sự kiện: {{context}}
- Nguyên nhân: {{causes}}

**b) Diễn biến sự kiện (12 phút)**
- Thời gian: {{timeline}}
- Nhân vật chính: {{keyFigures}}
- Diễn biến chính: {{mainEvents}}

**c) Kết quả và ý nghĩa (10 phút)**
- Kết quả trực tiếp: {{immediateResults}}
- Ý nghĩa lịch sử: {{historicalSignificance}}
- Bài học rút ra: {{lessons}}

**3. CỦNG CỐ (10 phút)**
- Câu hỏi kiểm tra hiểu bài
- Liên hệ với hiện tại
- Dặn dò bài tập

**TÀI LIỆU THAM KHẢO:**
- Sử liệu: {{sources}}
- Hình ảnh minh họa: {{illustrations}}

**ĐÁNH GIÁ:**
- Hiểu biết về sự kiện lịch sử
- Kỹ năng phân tích và đánh giá`,
        difficulty: 'intermediate',
        recommendedTools: JSON.stringify(['chatgpt', 'canva-ai']),
        tags: JSON.stringify(['LịchSử', 'SựKiện', 'PhânTích']),
        compliance: JSON.stringify(['GDPT 2018', 'CV 5512']),
        variables: {
            create: [
                {
                    name: 'eventName',
                    label: 'Tên sự kiện',
                    type: 'text',
                    required: true,
                    placeholder: 'VD: Cuộc kháng chiến chống Mông - Nguyên'
                },
                {
                    name: 'timeperiod',
                    label: 'Thời gian',
                    type: 'text',
                    required: true,
                    placeholder: 'VD: Thế kỷ XIII'
                },
                {
                    name: 'gradeLevel',
                    label: 'Lớp',
                    type: 'select',
                    required: true,
                    options: JSON.stringify(['6', '7', '8', '9'])
                },
                {
                    name: 'knowledgeObjectives',
                    label: 'Mục tiêu kiến thức',
                    type: 'textarea',
                    required: true,
                    placeholder: 'HS hiểu được nguyên nhân, diễn biến, ý nghĩa...'
                }
            ]
        }
    },

    // Presentation templates
    {
        name: 'Bài thuyết trình Toán học',
        description: 'Template tạo bài thuyết trình cho môn Toán',
        subject: 'Toán',
        gradeLevel: JSON.stringify([6, 7, 8, 9]),
        outputType: 'presentation',
        templateContent: `Bạn là một giáo viên Toán THCS. Hãy tạo bài thuyết trình về chủ đề "{{topic}}" cho lớp {{gradeLevel}}.

**THÔNG TIN THUYẾT TRÌNH:**
- Chủ đề: {{topic}}
- Lớp: {{gradeLevel}}
- Thời gian: {{duration}} phút
- Mục tiêu: {{objectives}}

**CẤU TRÚC BÀI THUYẾT TRÌNH:**

**Slide 1: Tiêu đề**
- Chủ đề: {{topic}}
- Lớp {{gradeLevel}}
- Tên giáo viên

**Slide 2: Mục tiêu bài học**
- {{objectives}}

**Slide 3: Kiến thức cần nhớ**
- Ôn tập kiến thức liên quan: {{prerequisiteKnowledge}}

**Slide 4-6: Nội dung chính**
- Khái niệm cơ bản: {{basicConcepts}}
- Công thức/Định lý: {{formulas}}
- Ví dụ minh họa: {{examples}}

**Slide 7-8: Bài tập thực hành**
- Bài tập mẫu có lời giải
- Bài tập cho học sinh thực hành

**Slide 9: Ứng dụng thực tế**
- {{realWorldApplications}}

**Slide 10: Tóm tắt**
- Những điểm chính cần nhớ
- Công thức quan trọng

**Slide 11: Câu hỏi và thảo luận**
- Câu hỏi kiểm tra hiểu bài
- Thảo luận nhóm

**GHI CHÚ CHO GIÁO VIÊN:**
- Sử dụng hình ảnh, sơ đồ minh họa
- Tương tác với học sinh qua câu hỏi
- Sử dụng công cụ hỗ trợ: {{supportTools}}`,
        difficulty: 'intermediate',
        recommendedTools: JSON.stringify(['canva-ai', 'gamma-app', 'powerpoint']),
        tags: JSON.stringify(['Toán', 'Presentation', 'Thuyết trình']),
        compliance: JSON.stringify(['GDPT 2018']),
        variables: {
            create: [
                {
                    name: 'topic',
                    label: 'Chủ đề thuyết trình',
                    type: 'text',
                    required: true,
                    placeholder: 'VD: Phương trình bậc nhất'
                },
                {
                    name: 'gradeLevel',
                    label: 'Lớp',
                    type: 'select',
                    required: true,
                    options: JSON.stringify(['6', '7', '8', '9'])
                },
                {
                    name: 'duration',
                    label: 'Thời gian (phút)',
                    type: 'select',
                    required: true,
                    options: JSON.stringify(['15', '20', '30', '45'])
                },
                {
                    name: 'objectives',
                    label: 'Mục tiêu bài học',
                    type: 'textarea',
                    required: true,
                    placeholder: 'HS hiểu được khái niệm, biết giải...'
                }
            ]
        }
    }
];

async function seedMoreTemplates() {
    try {
        console.log('🌱 Bắt đầu seed thêm templates...');

        // Create new templates
        for (const templateData of additionalTemplates) {
            const template = await prisma.template.create({
                data: templateData,
                include: {
                    variables: true,
                    examples: true
                }
            });
            console.log(`✅ Đã tạo template: ${template.name}`);
        }

        console.log('🎉 Seed thêm templates thành công!');
        console.log(`📊 Đã tạo thêm ${additionalTemplates.length} templates`);

        // Show total count
        const totalCount = await prisma.template.count();
        console.log(`📈 Tổng số templates hiện tại: ${totalCount}`);

    } catch (error) {
        console.error('❌ Lỗi khi seed thêm templates:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the seed function
seedMoreTemplates()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });