// Using built-in fetch (Node.js 18+)

const testTemplate = {
    name: 'Test Template - Lịch sử lớp 7',
    description: 'Template test tạo giáo án môn Lịch sử cho lớp 7',
    subject: 'Lịch sử',
    gradeLevel: [7],
    outputType: 'lesson-plan',
    templateContent: `Bạn là một giáo viên Lịch sử THCS. Hãy soạn giáo án cho bài "{{lessonName}}" lớp {{gradeLevel}}.

**THÔNG TIN BÀI HỌC:**
- Môn: Lịch sử
- Lớp: {{gradeLevel}}
- Bài: {{lessonName}}
- Thời gian: {{duration}} phút

**MỤC TIÊU:**
{{objectives}}

**TIẾN TRÌNH DẠY HỌC:**
1. Khởi động: {{warmup}}
2. Bài mới: {{newLesson}}
3. Củng cố: {{consolidation}}
4. Dặn dò: {{homework}}`,
    difficulty: 'beginner',
    recommendedTools: ['chatgpt', 'gemini'],
    tags: ['LịchSử', 'GDPT2018'],
    compliance: ['GDPT 2018'],
    variables: [
        {
            name: 'lessonName',
            label: 'Tên bài học',
            type: 'text',
            required: true,
            placeholder: 'VD: Cuộc kháng chiến chống Mông - Nguyên'
        },
        {
            name: 'gradeLevel',
            label: 'Lớp',
            type: 'select',
            required: true,
            options: ['7']
        },
        {
            name: 'duration',
            label: 'Thời gian (phút)',
            type: 'select',
            required: true,
            options: ['45']
        },
        {
            name: 'objectives',
            label: 'Mục tiêu bài học',
            type: 'textarea',
            required: true,
            placeholder: 'Kiến thức, kỹ năng, thái độ...'
        }
    ],
    examples: [
        {
            title: 'Cuộc kháng chiến chống Mông - Nguyên',
            description: 'Ví dụ giáo án về cuộc kháng chiến chống Mông - Nguyên',
            sampleInput: {
                lessonName: 'Cuộc kháng chiến chống Mông - Nguyên',
                gradeLevel: '7',
                duration: '45',
                objectives: 'HS hiểu được nguyên nhân, diễn biến và ý nghĩa của cuộc kháng chiến'
            },
            expectedOutput: 'Giáo án chi tiết với các hoạt động cụ thể...'
        }
    ]
};

async function testCreateTemplate() {
    try {
        console.log('🧪 Bắt đầu test tạo template...');

        const response = await fetch('http://localhost:3000/api/admin/templates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testTemplate)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ Template đã được tạo thành công!');
        console.log('📋 ID:', result.id);
        console.log('📝 Tên:', result.name);
        console.log('📚 Môn học:', result.subject);
        console.log('🎯 Loại:', result.outputType);
        console.log('📊 Số biến:', result.variables?.length || 0);
        console.log('💡 Số ví dụ:', result.examples?.length || 0);

        // Test lấy template vừa tạo
        console.log('\n🔍 Test lấy template vừa tạo...');
        const getResponse = await fetch(`http://localhost:3000/api/admin/templates`);
        const templates = await getResponse.json();

        const createdTemplate = templates.data.find(t => t.id === result.id);
        if (createdTemplate) {
            console.log('✅ Template đã được lưu vào database và có thể truy xuất!');
        } else {
            console.log('❌ Không tìm thấy template trong database');
        }

    } catch (error) {
        console.error('❌ Lỗi khi test tạo template:', error.message);
    }
}

// Run the test
testCreateTemplate();