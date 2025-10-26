/**
 * Script to seed database with AI tools
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const aiToolsData = [
    {
        name: 'ChatGPT',
        description: 'Công cụ AI tạo văn bản mạnh mẽ của OpenAI, hỗ trợ tạo nội dung giáo dục đa dạng',
        url: 'https://chat.openai.com',
        category: 'TEXT_GENERATION',
        subjects: JSON.stringify(['Toán', 'Văn', 'Khoa học tự nhiên', 'Lịch sử & Địa lí', 'Giáo dục công dân', 'Công nghệ']),
        gradeLevel: JSON.stringify([6, 7, 8, 9]),
        useCase: 'Tạo kế hoạch bài dạy, câu hỏi kiểm tra, bài tập, giải thích khái niệm',
        vietnameseSupport: true,
        difficulty: 'beginner',
        features: JSON.stringify(['Tạo văn bản', 'Trả lời câu hỏi', 'Giải thích khái niệm', 'Tạo bài tập', 'Dịch thuật']),
        pricingModel: 'freemium',
        integrationInstructions: 'Sao chép prompt được tạo và dán vào ChatGPT. Có thể tùy chỉnh thêm theo nhu cầu cụ thể.',
        samplePrompts: JSON.stringify([
            'Tạo kế hoạch bài dạy môn Toán lớp 8 về phương trình bậc nhất',
            'Giải thích khái niệm hàm số cho học sinh lớp 9',
            'Tạo 10 câu hỏi trắc nghiệm về lịch sử Việt Nam'
        ]),
        relatedTools: JSON.stringify(['Gemini', 'Claude'])
    },
    {
        name: 'Gemini',
        description: 'AI của Google hỗ trợ tạo nội dung và phân tích dữ liệu, đặc biệt mạnh về xử lý đa phương tiện',
        url: 'https://gemini.google.com',
        category: 'TEXT_GENERATION',
        subjects: JSON.stringify(['Toán', 'Văn', 'Khoa học tự nhiên', 'Lịch sử & Địa lí', 'Giáo dục công dân', 'Công nghệ']),
        gradeLevel: JSON.stringify([6, 7, 8, 9]),
        useCase: 'Tạo nội dung giáo dục, phân tích hình ảnh, tạo bài thuyết trình',
        vietnameseSupport: true,
        difficulty: 'beginner',
        features: JSON.stringify(['Tạo văn bản', 'Phân tích hình ảnh', 'Tạo bảng biểu', 'Giải toán', 'Tóm tắt nội dung']),
        pricingModel: 'freemium',
        integrationInstructions: 'Truy cập Gemini và nhập prompt. Có thể upload hình ảnh để phân tích và tạo nội dung liên quan.',
        samplePrompts: JSON.stringify([
            'Phân tích bức tranh này và tạo bài học lịch sử',
            'Tạo sơ đồ tư duy về hệ tuần hoàn',
            'Giải bài toán hình học này từng bước'
        ]),
        relatedTools: JSON.stringify(['ChatGPT', 'Claude'])
    },
    {
        name: 'GitHub Copilot',
        description: 'AI hỗ trợ lập trình và tạo code, phù hợp cho môn Công nghệ và Tin học',
        url: 'https://github.com/features/copilot',
        category: 'TEXT_GENERATION',
        subjects: JSON.stringify(['Công nghệ', 'Toán']),
        gradeLevel: JSON.stringify([8, 9]),
        useCase: 'Dạy lập trình, tạo ví dụ code, giải thích thuật toán',
        vietnameseSupport: false,
        difficulty: 'advanced',
        features: JSON.stringify(['Tạo code', 'Giải thích code', 'Debug', 'Tối ưu thuật toán']),
        pricingModel: 'paid',
        integrationInstructions: 'Cần cài đặt trong VS Code hoặc IDE khác. Sử dụng comment để mô tả yêu cầu.',
        samplePrompts: JSON.stringify([
            '// Tạo hàm tính giai thừa',
            '// Viết chương trình sắp xếp mảng',
            '// Tạo game đơn giản bằng Python'
        ]),
        relatedTools: JSON.stringify(['Replit', 'CodePen'])
    },
    {
        name: 'Canva AI',
        description: 'Công cụ thiết kế với AI, tạo poster, slide thuyết trình và tài liệu giáo dục đẹp mắt',
        url: 'https://www.canva.com',
        category: 'PRESENTATION',
        subjects: JSON.stringify(['Toán', 'Văn', 'Khoa học tự nhiên', 'Lịch sử & Địa lí', 'Giáo dục công dân', 'Công nghệ']),
        gradeLevel: JSON.stringify([6, 7, 8, 9]),
        useCase: 'Tạo slide bài giảng, poster giáo dục, infographic, worksheet',
        vietnameseSupport: true,
        difficulty: 'beginner',
        features: JSON.stringify(['Thiết kế slide', 'Tạo poster', 'Infographic', 'Tạo logo', 'Chỉnh sửa ảnh']),
        pricingModel: 'freemium',
        integrationInstructions: 'Sử dụng Magic Design hoặc Text to Image. Nhập mô tả bằng tiếng Việt để tạo thiết kế.',
        samplePrompts: JSON.stringify([
            'Tạo slide thuyết trình về hệ mặt trời',
            'Thiết kế poster về bảo vệ môi trường',
            'Tạo infographic về chu kỳ nước'
        ]),
        relatedTools: JSON.stringify(['Gamma', 'Beautiful.AI'])
    },
    {
        name: 'Gamma App',
        description: 'AI tạo bài thuyết trình và trang web tự động từ văn bản mô tả',
        url: 'https://gamma.app',
        category: 'PRESENTATION',
        subjects: JSON.stringify(['Toán', 'Văn', 'Khoa học tự nhiên', 'Lịch sử & Địa lí', 'Giáo dục công dân', 'Công nghệ']),
        gradeLevel: JSON.stringify([6, 7, 8, 9]),
        useCase: 'Tạo bài thuyết trình tự động, trang web giáo dục, báo cáo',
        vietnameseSupport: true,
        difficulty: 'beginner',
        features: JSON.stringify(['Tạo slide tự động', 'Tạo website', 'Tạo document', 'AI design', 'Collaboration']),
        pricingModel: 'freemium',
        integrationInstructions: 'Nhập outline hoặc mô tả chi tiết bài thuyết trình. AI sẽ tự động tạo slide với thiết kế đẹp.',
        samplePrompts: JSON.stringify([
            'Tạo bài thuyết trình về lịch sử Việt Nam thế kỷ 20',
            'Slide giới thiệu về năng lượng tái tạo',
            'Bài thuyết trình về văn học Việt Nam hiện đại'
        ]),
        relatedTools: JSON.stringify(['Canva', 'Beautiful.AI'])
    },
    {
        name: 'GeoGebra',
        description: 'Phần mềm toán học động với AI hỗ trợ, tạo đồ thị và mô phỏng toán học',
        url: 'https://www.geogebra.org',
        category: 'SIMULATION',
        subjects: JSON.stringify(['Toán', 'Khoa học tự nhiên']),
        gradeLevel: JSON.stringify([6, 7, 8, 9]),
        useCase: 'Vẽ đồ thị hàm số, mô phỏng hình học, giải phương trình',
        vietnameseSupport: true,
        difficulty: 'intermediate',
        features: JSON.stringify(['Vẽ đồ thị', 'Hình học động', 'Giải phương trình', 'Thống kê', 'Tính toán']),
        pricingModel: 'free',
        integrationInstructions: 'Sử dụng trực tiếp trên web hoặc tải app. Có thể nhúng vào slide hoặc tài liệu.',
        samplePrompts: JSON.stringify([
            'Vẽ đồ thị hàm số y = 2x + 1',
            'Mô phỏng chuyển động của hình tròn',
            'Tạo biểu đồ thống kê dữ liệu'
        ]),
        relatedTools: JSON.stringify(['Desmos', 'Wolfram Alpha'])
    },
    {
        name: 'Desmos',
        description: 'Máy tính đồ thị trực tuyến mạnh mẽ cho toán học',
        url: 'https://www.desmos.com',
        category: 'SIMULATION',
        subjects: JSON.stringify(['Toán']),
        gradeLevel: JSON.stringify([7, 8, 9]),
        useCase: 'Vẽ đồ thị hàm số, giải phương trình, mô phỏng toán học',
        vietnameseSupport: false,
        difficulty: 'intermediate',
        features: JSON.stringify(['Đồ thị hàm số', 'Giải phương trình', 'Thống kê', 'Hình học', 'Animation']),
        pricingModel: 'free',
        integrationInstructions: 'Truy cập website và nhập phương trình. Có thể chia sẻ đồ thị qua link.',
        samplePrompts: JSON.stringify([
            'y = x^2 + 2x - 3',
            'x^2 + y^2 = 25',
            'y = sin(x) + cos(x)'
        ]),
        relatedTools: JSON.stringify(['GeoGebra', 'Wolfram Alpha'])
    },
    {
        name: 'Quizizz',
        description: 'Nền tảng tạo quiz và đánh giá trực tuyến với AI hỗ trợ',
        url: 'https://quizizz.com',
        category: 'ASSESSMENT',
        subjects: JSON.stringify(['Toán', 'Văn', 'Khoa học tự nhiên', 'Lịch sử & Địa lí', 'Giáo dục công dân', 'Công nghệ']),
        gradeLevel: JSON.stringify([6, 7, 8, 9]),
        useCase: 'Tạo bài kiểm tra, quiz tương tác, đánh giá học sinh',
        vietnameseSupport: true,
        difficulty: 'beginner',
        features: JSON.stringify(['Tạo quiz', 'Báo cáo chi tiết', 'Game hóa', 'Thi trực tuyến', 'AI tạo câu hỏi']),
        pricingModel: 'freemium',
        integrationInstructions: 'Tạo tài khoản và sử dụng AI để tạo câu hỏi từ nội dung bài học.',
        samplePrompts: JSON.stringify([
            'Tạo 10 câu hỏi về phương trình bậc hai',
            'Quiz về lịch sử Việt Nam thế kỷ 19',
            'Câu hỏi trắc nghiệm về hệ tuần hoàn'
        ]),
        relatedTools: JSON.stringify(['Kahoot', 'Google Forms'])
    }
];

async function seedAITools() {
    try {
        console.log('Starting AI tools seeding...');

        // Check if AI tools already exist
        const existingCount = await prisma.aITool.count();

        if (existingCount > 0) {
            console.log(`Database already has ${existingCount} AI tools. Skipping seed.`);
            return;
        }

        console.log('Database is empty. Creating AI tools...');

        for (const toolData of aiToolsData) {
            try {
                const created = await prisma.aITool.create({
                    data: toolData
                });
                console.log(`✓ Created AI tool: ${created.name} (ID: ${created.id})`);
            } catch (error) {
                console.error(`✗ Failed to create AI tool: ${toolData.name}`, error);
            }
        }

        console.log('AI tools seeding completed!');

    } catch (error) {
        console.error('Error seeding AI tools:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Export for use in other scripts
export { seedAITools, aiToolsData };

// Run if called directly
if (require.main === module) {
    seedAITools()
        .then(() => {
            console.log('AI tools seeding completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('AI tools seeding failed:', error);
            process.exit(1);
        });
}