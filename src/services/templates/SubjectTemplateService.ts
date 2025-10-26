export interface PromptTemplate {
    id: string;
    name: string;
    description: string;
    subject: string;
    gradeLevel: (6 | 7 | 8 | 9)[];
    outputType: 'lesson-plan' | 'presentation' | 'assessment' | 'interactive' | 'research';
    template: string;
    variables: TemplateVariable[];
    recommendedTools: string[];
    examples: TemplateExample[];
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    compliance: string[]; // GDPT 2018, CV 5512, etc.
}

export interface TemplateVariable {
    name: string;
    label: string;
    description?: string;
    type: 'text' | 'textarea' | 'select' | 'multiselect';
    required: boolean;
    placeholder?: string;
    options?: string[];
    defaultValue?: string;
}

export interface TemplateExample {
    title: string;
    description: string;
    sampleInput: Record<string, string>;
    expectedOutput: string;
}

// Subject-specific templates based on KHTN_GDCD_CONG_NGHE_LS_DL_TOAN_VAN.md
export const SUBJECT_TEMPLATES: PromptTemplate[] = [
    // TOÁN HỌC TEMPLATES
    {
        id: 'toan-giao-an-cv5512',
        name: 'Kế hoạch bài dạy Toán theo CV 5512',
        description: 'Template soạn kế hoạch bài dạy môn Toán với cấu trúc 5 cột theo Công văn 5512',
        subject: 'Toán',
        gradeLevel: [6, 7, 8, 9],
        outputType: 'lesson-plan',
        template: `Bạn là một giáo viên Toán THCS chuyên nghiệp. Hãy soạn kế hoạch bài dạy chi tiết cho bài học "{{lessonName}}" lớp {{gradeLevel}} theo Công văn 5512 và GDPT 2018.

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
        variables: [
            { name: 'lessonName', label: 'Tên bài học', type: 'text', required: true, placeholder: 'VD: Phương trình bậc nhất một ẩn' },
            { name: 'gradeLevel', label: 'Lớp', type: 'select', required: true, options: ['6', '7', '8', '9'] },
            { name: 'objectives', label: 'Mục tiêu cụ thể', type: 'textarea', required: true, placeholder: 'Mục tiêu kiến thức, kỹ năng, thái độ...' },
            { name: 'topicContext', label: 'Bối cảnh thực tế', type: 'text', required: false, placeholder: 'VD: Tính toán chi phí, đo đạc thực tế...' },
            { name: 'explorationActivity', label: 'Hoạt động khám phá', type: 'textarea', required: false, placeholder: 'Mô tả hoạt động để HS tự khám phá kiến thức' },
            { name: 'recommendedTools', label: 'Công cụ hỗ trợ', type: 'multiselect', required: false, options: ['GeoGebra', 'Máy tính', 'Thước kẻ', 'Compa', 'Bảng số'] }
        ],
        recommendedTools: ['geogebra', 'desmos', 'canva-ai'],
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
        ],
        tags: ['CV5512', 'GDPT2018', 'NăngLựcToánHọc', 'TưDuyLogic'],
        difficulty: 'intermediate',
        compliance: ['GDPT 2018', 'CV 5512', 'Chuẩn năng lực Toán học']
    },

    // NGỮ VĂN TEMPLATES  
    {
        id: 'van-phan-tich-tac-pham',
        name: 'Phân tích tác phẩm văn học',
        description: 'Template phân tích tác phẩm văn học với phương pháp tiếp cận hiện đại',
        subject: 'Văn',
        gradeLevel: [6, 7, 8, 9],
        outputType: 'lesson-plan',
        template: `Bạn là giáo viên Ngữ văn THCS giàu kinh nghiệm. Hãy soạn kế hoạch bài dạy phân tích tác phẩm "{{workTitle}}" của tác giả {{author}} cho lớp {{gradeLevel}}.

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
        recommendedTools: ['chatgpt', 'gemini', 'canva-ai'],
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
        ],
        tags: ['VănHọc', 'PhânTích', 'CảmThụ', 'TưDuyVănHọc'],
        difficulty: 'intermediate',
        compliance: ['GDPT 2018', 'CV 5512', 'Chuẩn năng lực Ngữ văn']
    },

    // KHOA HỌC TỰ NHIÊN TEMPLATES
    {
        id: 'khtn-thi-nghiem-mo-phong',
        name: 'Thí nghiệm và mô phỏng KHTN',
        description: 'Template thiết kế bài học KHTN với thí nghiệm thực hành và mô phỏng',
        subject: 'Khoa học tự nhiên',
        gradeLevel: [6, 7, 8, 9],
        outputType: 'lesson-plan',
        template: `Bạn là giáo viên Khoa học tự nhiên THCS. Hãy thiết kế bài học "{{lessonName}}" lớp {{gradeLevel}} với trọng tâm là thí nghiệm và mô phỏng khoa học.

**THÔNG TIN BÀI HỌC:**
- Tên bài: {{lessonName}}
- Lĩnh vực: {{field}}
- Lớp: {{gradeLevel}}
- Thời gian: 45 phút
- Mục tiêu: {{objectives}}

**ĐỊNH HƯỚNG PHƯƠNG PHÁP KHTN:**
- Phát triển năng lực khoa học: quan sát, đặt câu hỏi, dự đoán, thí nghiệm, giải thích hiện tượng
- Phương pháp: khám phá, thí nghiệm, mô phỏng, thảo luận khoa học
- Công cụ hỗ trợ: {{experimentTools}}

**CHUẨN BỊ:**
**Dụng cụ thí nghiệm:** {{equipment}}
**Hóa chất/Vật liệu:** {{materials}}
**Công cụ mô phỏng:** {{simulationTools}}

**TIẾN TRÌNH DẠY HỌC:**

**1. KHỞI ĐỘNG - ĐẶT VẤN ĐỀ (5 phút)**
- Hiện tượng thực tế: {{realPhenomenon}}
- Câu hỏi khoa học: {{scientificQuestion}}
- Dự đoán của học sinh

**2. HÌNH THÀNH KIẾN THỨC (30 phút)**

**a) Thiết kế thí nghiệm (10 phút)**
- Xác định biến số: {{variables}}
- Thiết kế phương án thí nghiệm
- Dự đoán kết quả

**b) Thực hiện thí nghiệm (15 phút)**
- Hướng dẫn an toàn thí nghiệm
- HS thực hiện theo nhóm
- Quan sát và ghi chép kết quả
- Sử dụng mô phỏng hỗ trợ: {{simulationActivity}}

**c) Phân tích kết quả (5 phút)**
- So sánh kết quả thực tế với dự đoán
- Giải thích hiện tượng khoa học
- Rút ra quy luật/nguyên lý

**3. LUYỆN TẬP VÀ VẬN DỤNG (10 phút)**
- Bài tập vận dụng quy luật
- Giải thích hiện tượng tương tự
- Ứng dụng trong đời sống

**THÍ NGHIỆM CHI TIẾT:**

**Thí nghiệm 1: {{experiment1}}**
- Mục đích: {{purpose1}}
- Cách tiến hành: {{procedure1}}
- Kết quả mong đợi: {{expectedResult1}}

**Thí nghiệm 2: {{experiment2}}**
- Mục đích: {{purpose2}}
- Cách tiến hành: {{procedure2}}
- Kết quả mong đợi: {{expectedResult2}}

**MÔ PHỎNG HỖ TRỢ:**
- Sử dụng {{simulationTool}} để mô phỏng {{simulationContent}}
- HS tương tác với mô phỏng để hiểu sâu hơn về {{concept}}

**AN TOÀN THÍ NGHIỆM:**
- {{safetyRules}}
- Xử lý sự cố: {{emergencyProcedure}}

**ĐÁNH GIÁ:**
- Đánh giá kỹ năng thí nghiệm
- Đánh giá khả năng quan sát và ghi chép
- Đánh giá tư duy khoa học và giải thích hiện tượng

Hãy tạo bài học chi tiết với thí nghiệm cụ thể và hoạt động mô phỏng phù hợp.`,
        variables: [
            { name: 'lessonName', label: 'Tên bài học', type: 'text', required: true, placeholder: 'VD: Sự nở vì nhiệt của chất rắn' },
            { name: 'field', label: 'Lĩnh vực', type: 'select', required: true, options: ['Vật lý', 'Hóa học', 'Sinh học', 'Địa lý tự nhiên'] },
            { name: 'gradeLevel', label: 'Lớp', type: 'select', required: true, options: ['6', '7', '8', '9'] },
            { name: 'objectives', label: 'Mục tiêu bài học', type: 'textarea', required: true },
            { name: 'realPhenomenon', label: 'Hiện tượng thực tế', type: 'textarea', required: true, placeholder: 'Mô tả hiện tượng khởi động' },
            { name: 'scientificQuestion', label: 'Câu hỏi khoa học', type: 'text', required: true, placeholder: 'Câu hỏi cần giải quyết' },
            { name: 'equipment', label: 'Dụng cụ thí nghiệm', type: 'textarea', required: true },
            { name: 'materials', label: 'Vật liệu/Hóa chất', type: 'textarea', required: false },
            { name: 'simulationTools', label: 'Công cụ mô phỏng', type: 'multiselect', required: false, options: ['PhET Simulation', 'Labster', 'Virtual Lab', 'Tinkercad'] }
        ],
        recommendedTools: ['phet-simulation', 'labster', 'tinkercad'],
        examples: [
            {
                title: 'Sự nở vì nhiệt - Lớp 6',
                description: 'Thí nghiệm về sự nở vì nhiệt của chất rắn',
                sampleInput: {
                    lessonName: 'Sự nở vì nhiệt của chất rắn',
                    field: 'Vật lý',
                    gradeLevel: '6',
                    objectives: 'HS hiểu được sự nở vì nhiệt của chất rắn, biết ứng dụng trong đời sống',
                    realPhenomenon: 'Đường ray xe lửa có khe hở, dây điện chùng xuống mùa hè',
                    scientificQuestion: 'Tại sao các vật rắn lại nở ra khi bị đun nóng?'
                },
                expectedOutput: 'Bài học với thí nghiệm cụ thể và mô phỏng hỗ trợ...'
            }
        ],
        tags: ['ThíNghiệm', 'MôPhỏng', 'KhámPhá', 'TưDuyKhoaHọc'],
        difficulty: 'intermediate',
        compliance: ['GDPT 2018', 'CV 5512', 'Chuẩn năng lực KHTN']
    }
];

export class SubjectTemplateService {
    private templates: PromptTemplate[] = SUBJECT_TEMPLATES;

    async getTemplatesBySubject(subject: string): Promise<PromptTemplate[]> {
        console.log('Searching templates for subject:', subject);
        console.log('Available subjects:', this.templates.map(t => t.subject));

        // Flexible matching for Vietnamese characters
        const normalizedSubject = this.normalizeVietnamese(subject.toLowerCase().trim());
        const results = this.templates.filter(template => {
            const templateSubject = this.normalizeVietnamese(template.subject.toLowerCase().trim());
            return templateSubject === normalizedSubject ||
                templateSubject.includes(normalizedSubject) ||
                normalizedSubject.includes(templateSubject);
        });

        console.log('Found templates:', results.length);
        return results;
    }

    async getTemplatesByOutputType(outputType: string): Promise<PromptTemplate[]> {
        return this.templates.filter(template => template.outputType === outputType);
    }

    async getRecommendedTemplates(subject: string, gradeLevel: number, outputType: string): Promise<PromptTemplate[]> {
        return this.templates.filter(template =>
            template.subject === subject &&
            template.gradeLevel.includes(gradeLevel as 6 | 7 | 8 | 9) &&
            template.outputType === outputType
        ).sort((a, b) => {
            // Prioritize templates by difficulty and compliance
            let scoreA = 0;
            let scoreB = 0;

            if (a.difficulty === 'beginner') scoreA += 10;
            if (b.difficulty === 'beginner') scoreB += 10;

            scoreA += a.compliance.length * 5;
            scoreB += b.compliance.length * 5;

            return scoreB - scoreA;
        });
    }

    async getAllTemplates(): Promise<PromptTemplate[]> {
        return this.templates;
    }

    async getTemplateById(templateId: string): Promise<PromptTemplate | null> {
        return this.templates.find(template => template.id === templateId) || null;
    }

    async renderTemplate(templateId: string, variables: Record<string, string>): Promise<string> {
        const template = await this.getTemplateById(templateId);
        if (!template) {
            throw new Error(`Template with ID ${templateId} not found`);
        }

        let renderedTemplate = template.template;

        // Replace template variables
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            renderedTemplate = renderedTemplate.replace(regex, value || '');
        }

        // Clean up any remaining unreplaced variables
        renderedTemplate = renderedTemplate.replace(/{{[^}]+}}/g, '[Chưa điền]');

        return renderedTemplate;
    }

    async searchTemplates(query: string): Promise<PromptTemplate[]> {
        const lowercaseQuery = query.toLowerCase();
        return this.templates.filter(template =>
            template.name.toLowerCase().includes(lowercaseQuery) ||
            template.description.toLowerCase().includes(lowercaseQuery) ||
            template.subject.toLowerCase().includes(lowercaseQuery) ||
            template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
        );
    }

    async getTemplatePreview(templateId: string, variables: Record<string, string>): Promise<string> {
        const template = await this.getTemplateById(templateId);
        if (!template) {
            throw new Error(`Template with ID ${templateId} not found`);
        }

        // Return first 500 characters of rendered template as preview
        const rendered = await this.renderTemplate(templateId, variables);
        return rendered.substring(0, 500) + (rendered.length > 500 ? '...' : '');
    }

    private normalizeVietnamese(text: string): string {
        // Remove Vietnamese diacritics for flexible matching
        return text
            .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
            .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
            .replace(/[ìíịỉĩ]/g, 'i')
            .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
            .replace(/[ùúụủũưừứựửữ]/g, 'u')
            .replace(/[ỳýỵỷỹ]/g, 'y')
            .replace(/đ/g, 'd')
            .replace(/[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/g, 'A')
            .replace(/[ÈÉẸẺẼÊỀẾỆỂỄ]/g, 'E')
            .replace(/[ÌÍỊỈĨ]/g, 'I')
            .replace(/[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/g, 'O')
            .replace(/[ÙÚỤỦŨƯỪỨỰỬỮ]/g, 'U')
            .replace(/[ỲÝỴỶỸ]/g, 'Y')
            .replace(/Đ/g, 'D');
    }
}

export const subjectTemplateService = new SubjectTemplateService();