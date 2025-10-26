import { AIToolDetails, AIToolCategory } from './index';

// Comprehensive AI Tools Database for Vietnamese Middle School Education
// Based on KHTN_GDCD_CONG_NGHE_LS_DL_TOAN_VAN.md requirements
export const AI_TOOLS_DATABASE: AIToolDetails[] = [
    // 🎯 TEXT GENERATION TOOLS
    {
        id: 'chatgpt',
        name: 'ChatGPT',
        description: 'Công cụ AI tạo văn bản mạnh mẽ cho soạn kế hoạch bài dạy và câu hỏi',
        url: 'https://chat.openai.com/',
        category: AIToolCategory.TEXT_GENERATION,
        subjects: ['Toán', 'Văn', 'Khoa học tự nhiên', 'Lịch sử & Địa lí', 'Giáo dục công dân', 'Công nghệ'],
        gradeLevel: [6, 7, 8, 9],
        useCase: 'Soạn kế hoạch bài dạy, tạo câu hỏi, phát triển nội dung bài học',
        vietnameseSupport: true,
        difficulty: 'beginner',
        features: ['Tạo kế hoạch bài dạy theo CV 5512', 'Câu hỏi phân loại Bloom', 'Hỗ trợ tiếng Việt'],
        pricingModel: 'freemium',
        integrationInstructions: 'Dán prompt đã tạo vào ChatGPT và nhấn Enter',
        samplePrompts: [
            'Soạn kế hoạch bài dạy môn Toán lớp 8 bài "Phương trình bậc nhất một ẩn"',
            'Tạo 10 câu hỏi trắc nghiệm môn Văn về "Tự tình II" của Hồ Xuân Hương'
        ],
        relatedTools: ['gemini', 'copilot']
    },
    {
        id: 'gemini',
        name: 'Google Gemini',
        description: 'AI của Google hỗ trợ tạo nội dung giáo dục đa phương tiện',
        url: 'https://gemini.google.com/',
        category: AIToolCategory.TEXT_GENERATION,
        subjects: ['Toán', 'Văn', 'Khoa học tự nhiên', 'Lịch sử & Địa lí', 'Giáo dục công dân', 'Công nghệ'],
        gradeLevel: [6, 7, 8, 9],
        useCase: 'Tạo nội dung bài học, phân tích tài liệu, hỗ trợ nghiên cứu',
        vietnameseSupport: true,
        difficulty: 'beginner',
        features: ['Tích hợp Google Workspace', 'Phân tích hình ảnh', 'Tìm kiếm thông tin'],
        pricingModel: 'free',
        integrationInstructions: 'Truy cập Gemini và nhập prompt đã tạo',
        samplePrompts: [
            'Giải thích khái niệm "Cách mạng tháng Tám 1945" cho học sinh lớp 9',
            'Tạo sơ đồ tư duy về "Hệ tuần hoàn" cho môn Khoa học tự nhiên'
        ],
        relatedTools: ['chatgpt', 'copilot']
    },
    {
        id: 'copilot',
        name: 'Microsoft Copilot',
        description: 'AI assistant của Microsoft tích hợp Office 365',
        url: 'https://copilot.microsoft.com/',
        category: AIToolCategory.TEXT_GENERATION,
        subjects: ['Toán', 'Văn', 'Khoa học tự nhiên', 'Lịch sử & Địa lí', 'Giáo dục công dân', 'Công nghệ'],
        gradeLevel: [6, 7, 8, 9],
        useCase: 'Soạn kế hoạch bài dạy, tạo nội dung, phân tích dữ liệu Excel',
        vietnameseSupport: true,
        difficulty: 'beginner',
        features: ['Tích hợp Office 365', 'Excel Copilot', 'PowerPoint Designer'],
        pricingModel: 'freemium',
        integrationInstructions: 'Sử dụng trong Word, Excel, PowerPoint với tài khoản Microsoft',
        samplePrompts: [
            'Tạo bài thuyết trình về "Năng lượng tái tạo"',
            'Phân tích dữ liệu điểm số học sinh trong Excel'
        ],
        relatedTools: ['chatgpt', 'gemini']
    },
    {
        id: 'perplexity-ai',
        name: 'Perplexity AI',
        description: 'AI search engine cho nghiên cứu và tìm kiếm thông tin',
        url: 'https://www.perplexity.ai/',
        category: AIToolCategory.TEXT_GENERATION,
        subjects: ['Toán', 'Văn', 'Khoa học tự nhiên', 'Lịch sử & Địa lí', 'Giáo dục công dân', 'Công nghệ'],
        gradeLevel: [6, 7, 8, 9],
        useCase: 'Nghiên cứu chủ đề, tìm kiếm thông tin, xây dựng giả thuyết',
        vietnameseSupport: true,
        difficulty: 'intermediate',
        features: ['Real-time search', 'Source citations', 'Academic research'],
        pricingModel: 'freemium',
        integrationInstructions: 'Nhập câu hỏi nghiên cứu để tìm thông tin có nguồn',
        samplePrompts: [
            'Tìm hiểu về biến đổi khí hậu ở Việt Nam',
            'Nghiên cứu ảnh hưởng của công nghệ đến giáo dục'
        ],
        relatedTools: ['chatgpt', 'gemini']
    },

    // 🎨 PRESENTATION & DESIGN TOOLS
    {
        id: 'canva-ai',
        name: 'Canva AI',
        description: 'Công cụ thiết kế slide và infographic với AI',
        url: 'https://www.canva.com/ai/',
        category: AIToolCategory.PRESENTATION,
        subjects: ['Toán', 'Văn', 'Khoa học tự nhiên', 'Lịch sử & Địa lí', 'Giáo dục công dân', 'Công nghệ'],
        gradeLevel: [6, 7, 8, 9],
        useCase: 'Tạo slide bài giảng, poster, infographic giáo dục',
        vietnameseSupport: true,
        difficulty: 'beginner',
        features: ['Magic Presentation', 'Template giáo dục', 'Hình ảnh AI'],
        pricingModel: 'freemium',
        integrationInstructions: 'Sử dụng Magic Presentation hoặc Magic Write trong Canva',
        samplePrompts: [
            'Tạo slide về "Định lý Pythagoras" với hình ảnh minh họa',
            'Thiết kế poster tuyên truyền "An toàn giao thông" cho học sinh'
        ],
        relatedTools: ['gamma', 'tome']
    },
    {
        id: 'gamma',
        name: 'Gamma App',
        description: 'Tạo bài thuyết trình đẹp mắt với AI',
        url: 'https://gamma.app/',
        category: AIToolCategory.PRESENTATION,
        subjects: ['Toán', 'Văn', 'Khoa học tự nhiên', 'Lịch sử & Địa lí', 'Giáo dục công dân', 'Công nghệ'],
        gradeLevel: [6, 7, 8, 9],
        useCase: 'Tạo slide thuyết trình tự động từ prompt',
        vietnameseSupport: true,
        difficulty: 'beginner',
        features: ['Auto-generate slides', 'Beautiful templates', 'Interactive content'],
        pricingModel: 'freemium',
        integrationInstructions: 'Nhập prompt tại "Create with AI" để tạo slide tự động',
        samplePrompts: [
            'Tạo bài thuyết trình về "Hệ Mặt Trời" cho lớp 6',
            'Slide giới thiệu "Văn học dân gian Việt Nam"'
        ],
        relatedTools: ['canva-ai', 'tome']
    },
    {
        id: 'tome',
        name: 'Tome',
        description: 'AI storytelling platform cho giáo dục',
        url: 'https://tome.app/',
        category: AIToolCategory.PRESENTATION,
        subjects: ['Toán', 'Văn', 'Khoa học tự nhiên', 'Lịch sử & Địa lí', 'Giáo dục công dân', 'Công nghệ'],
        gradeLevel: [6, 7, 8, 9],
        useCase: 'Tạo câu chuyện tương tác, slide kể chuyện',
        vietnameseSupport: true,
        difficulty: 'intermediate',
        features: ['Story-driven presentations', 'Interactive elements', 'AI-generated content'],
        pricingModel: 'freemium',
        integrationInstructions: 'Sử dụng "Create Story with AI" để tạo nội dung kể chuyện',
        samplePrompts: [
            'Kể câu chuyện về "Cuộc đời Hồ Chí Minh" qua hình ảnh',
            'Tạo câu chuyện tương tác về "Chu trình nước"'
        ],
        relatedTools: ['gamma', 'canva-ai']
    },

    // 🖼️ IMAGE GENERATION TOOLS
    {
        id: 'microsoft-designer',
        name: 'Microsoft Designer',
        description: 'AI Image Creator của Microsoft',
        url: 'https://create.microsoft.com/',
        category: AIToolCategory.IMAGE,
        subjects: ['Toán', 'Văn', 'Khoa học tự nhiên', 'Lịch sử & Địa lí', 'Giáo dục công dân', 'Công nghệ'],
        gradeLevel: [6, 7, 8, 9],
        useCase: 'Tạo hình ảnh minh họa cho bài giảng',
        vietnameseSupport: true,
        difficulty: 'beginner',
        features: ['Text-to-image', 'Educational graphics', 'Free to use'],
        pricingModel: 'free',
        integrationInstructions: 'Nhập mô tả hình ảnh bằng tiếng Việt để tạo ảnh',
        samplePrompts: [
            'Tạo hình minh họa "Cấu trúc nguyên tử" cho môn Hóa học',
            'Hình ảnh "Bản đồ Việt Nam thời Lý" cho môn Lịch sử'
        ],
        relatedTools: ['leonardo-ai', 'dall-e']
    },
    {
        id: 'leonardo-ai',
        name: 'Leonardo AI',
        description: 'Tạo hình ảnh AI chất lượng cao cho giáo dục',
        url: 'https://leonardo.ai/',
        category: AIToolCategory.IMAGE,
        subjects: ['Toán', 'Văn', 'Khoa học tự nhiên', 'Lịch sử & Địa lí', 'Giáo dục công dân', 'Công nghệ'],
        gradeLevel: [6, 7, 8, 9],
        useCase: 'Tạo tranh minh họa, bản đồ chủ đề, infographic',
        vietnameseSupport: true,
        difficulty: 'intermediate',
        features: ['High-quality images', 'Educational illustrations', 'Custom styles'],
        pricingModel: 'freemium',
        integrationInstructions: 'Nhập prompt mô tả chi tiết, chọn style phù hợp',
        samplePrompts: [
            'Tạo bản đồ chuyên đề "Khí hậu Việt Nam" với chú giải',
            'Infographic timeline "Các triều đại Việt Nam"'
        ],
        relatedTools: ['microsoft-designer', 'dall-e']
    },

    // 🎬 VIDEO CREATION TOOLS
    {
        id: 'heygen',
        name: 'HeyGen',
        description: 'Tạo video với nhân vật ảo giọng Việt',
        url: 'https://heygen.com/',
        category: AIToolCategory.VIDEO,
        subjects: ['Toán', 'Văn', 'Khoa học tự nhiên', 'Lịch sử & Địa lí', 'Giáo dục công dân', 'Công nghệ'],
        gradeLevel: [6, 7, 8, 9],
        useCase: 'Tạo video giảng dạy với avatar ảo',
        vietnameseSupport: true,
        difficulty: 'intermediate',
        features: ['Vietnamese voice', 'Custom avatars', 'Educational templates'],
        pricingModel: 'freemium',
        integrationInstructions: 'Chọn avatar, nhập script tiếng Việt, tạo video',
        samplePrompts: [
            'Video giải thích "Định luật Newton" với giọng nữ',
            'Hướng dẫn "Cách viết đoạn văn tả người" bằng avatar'
        ],
        relatedTools: ['synthesia', 'pictory']
    },
    {
        id: 'synthesia',
        name: 'Synthesia',
        description: 'Nền tảng tạo video AI chuyên nghiệp',
        url: 'https://synthesia.io/',
        category: AIToolCategory.VIDEO,
        subjects: ['Toán', 'Văn', 'Khoa học tự nhiên', 'Lịch sử & Địa lí', 'Giáo dục công dân', 'Công nghệ'],
        gradeLevel: [6, 7, 8, 9],
        useCase: 'Tạo video thuyết minh chuyên nghiệp',
        vietnameseSupport: true,
        difficulty: 'intermediate',
        features: ['Professional avatars', 'Multi-language support', 'HD video quality'],
        pricingModel: 'paid',
        integrationInstructions: 'Upload script, chọn avatar và giọng nói, render video',
        samplePrompts: [
            'Video thuyết minh "Lịch sử Việt Nam" với avatar giáo viên',
            'Giải thích "Phương trình bậc hai" qua video'
        ],
        relatedTools: ['heygen', 'pictory']
    },
    {
        id: 'pictory',
        name: 'Pictory',
        description: 'Tạo video từ text và hình ảnh',
        url: 'https://pictory.ai/',
        category: AIToolCategory.VIDEO,
        subjects: ['Toán', 'Văn', 'Khoa học tự nhiên', 'Lịch sử & Địa lí', 'Giáo dục công dân', 'Công nghệ'],
        gradeLevel: [6, 7, 8, 9],
        useCase: 'Chuyển đổi text thành video có hình ảnh',
        vietnameseSupport: true,
        difficulty: 'beginner',
        features: ['Text-to-video', 'Stock footage', 'Auto-captions'],
        pricingModel: 'freemium',
        integrationInstructions: 'Paste text content, AI sẽ tạo video với hình ảnh phù hợp',
        samplePrompts: [
            'Tạo video từ bài văn "Tự tình II" của Hồ Xuân Hương',
            'Video minh họa "Quá trình quang hợp" từ text'
        ],
        relatedTools: ['heygen', 'synthesia']
    },
    {
        id: 'elevenlabs',
        name: 'ElevenLabs',
        description: 'AI voice generation với giọng Việt tự nhiên',
        url: 'https://elevenlabs.io/',
        category: AIToolCategory.VIDEO,
        subjects: ['Toán', 'Văn', 'Khoa học tự nhiên', 'Lịch sử & Địa lí', 'Giáo dục công dân', 'Công nghệ'],
        gradeLevel: [6, 7, 8, 9],
        useCase: 'Tạo giọng đọc cho video và audio giáo dục',
        vietnameseSupport: true,
        difficulty: 'intermediate',
        features: ['Natural Vietnamese voice', 'Voice cloning', 'Multiple accents'],
        pricingModel: 'freemium',
        integrationInstructions: 'Nhập text tiếng Việt, chọn giọng, tạo audio',
        samplePrompts: [
            'Tạo audio đọc bài thơ "Đất nước" của Nguyễn Đình Thi',
            'Giọng đọc bài giảng "Hệ thần kinh" cho học sinh'
        ],
        relatedTools: ['heygen', 'synthesia']
    },

    // 🔬 SIMULATION & EXPERIMENT TOOLS
    {
        id: 'phet-simulation',
        name: 'PhET Interactive Simulations',
        description: 'Mô phỏng tương tác cho Vật lý, Hóa học, Sinh học',
        url: 'https://phet.colorado.edu/vi/',
        category: AIToolCategory.SIMULATION,
        subjects: ['Khoa học tự nhiên', 'Toán'],
        gradeLevel: [6, 7, 8, 9],
        useCase: 'Mô phỏng thí nghiệm khoa học tương tác',
        vietnameseSupport: true,
        difficulty: 'beginner',
        features: ['Interactive simulations', 'Vietnamese interface', 'Free access'],
        pricingModel: 'free',
        integrationInstructions: 'Chọn simulation phù hợp, sử dụng trong lớp học',
        samplePrompts: [
            'Mô phỏng "Định luật Ohm" cho học sinh lớp 9',
            'Thí nghiệm ảo về "Sự nở vì nhiệt" lớp 6'
        ],
        relatedTools: ['labster', 'tinkercad']
    },
    {
        id: 'labster',
        name: 'Labster',
        description: 'Phòng thí nghiệm ảo 3D cho khoa học',
        url: 'https://www.labster.com/',
        category: AIToolCategory.SIMULATION,
        subjects: ['Khoa học tự nhiên'],
        gradeLevel: [6, 7, 8, 9],
        useCase: 'Thí nghiệm ảo 3D an toàn và chi tiết',
        vietnameseSupport: false,
        difficulty: 'intermediate',
        features: ['3D virtual labs', 'Safe experiments', 'Detailed protocols'],
        pricingModel: 'paid',
        integrationInstructions: 'Chọn lab phù hợp, hướng dẫn học sinh thực hành ảo',
        samplePrompts: [
            'Thí nghiệm "Phân tích DNA" trong phòng lab ảo',
            'Mô phỏng "Phản ứng hóa học" an toàn'
        ],
        relatedTools: ['phet-simulation', 'chemix-ai']
    },
    {
        id: 'tinkercad',
        name: 'Tinkercad',
        description: 'Thiết kế 3D và mô phỏng mạch điện',
        url: 'https://www.tinkercad.com/',
        category: AIToolCategory.SIMULATION,
        subjects: ['Công nghệ', 'Khoa học tự nhiên'],
        gradeLevel: [6, 7, 8, 9],
        useCase: 'Thiết kế 3D và mô phỏng mạch điện tử',
        vietnameseSupport: false,
        difficulty: 'beginner',
        features: ['3D design', 'Circuit simulation', 'Arduino programming'],
        pricingModel: 'free',
        integrationInstructions: 'Tạo tài khoản, sử dụng drag-and-drop để thiết kế',
        samplePrompts: [
            'Thiết kế mô hình "Nhà thông minh" 3D',
            'Mô phỏng mạch điện "Đèn LED nhấp nháy"'
        ],
        relatedTools: ['arduino-ai', 'makecode']
    },
    {
        id: 'cospaces-edu',
        name: 'CoSpaces Edu',
        description: 'Tạo thế giới ảo 3D cho giáo dục',
        url: 'https://edu.delightex.com/',
        category: AIToolCategory.SIMULATION,
        subjects: ['Toán', 'Khoa học tự nhiên', 'Lịch sử & Địa lí', 'Công nghệ'],
        gradeLevel: [6, 7, 8, 9],
        useCase: 'Tạo môi trường 3D tương tác cho học tập',
        vietnameseSupport: false,
        difficulty: 'intermediate',
        features: ['VR/AR support', '3D world creation', 'Interactive storytelling'],
        pricingModel: 'freemium',
        integrationInstructions: 'Tạo scene 3D, thêm objects và interactions',
        samplePrompts: [
            'Tạo tour ảo "Cung điện Huế" cho môn Lịch sử',
            'Mô phỏng 3D "Hệ Mặt Trời" tương tác'
        ],
        relatedTools: ['scratch', 'minecraft-edu']
    },
    {
        id: 'chemix-ai',
        name: 'Chemix AI',
        description: 'Vẽ công thức hóa học và phản ứng với AI',
        url: 'https://chemix.ai/',
        category: AIToolCategory.SIMULATION,
        subjects: ['Khoa học tự nhiên'],
        gradeLevel: [8, 9],
        useCase: 'Vẽ công thức hóa học và cân bằng phương trình',
        vietnameseSupport: false,
        difficulty: 'intermediate',
        features: ['Chemical formula drawing', 'Reaction balancing', 'Molecular visualization'],
        pricingModel: 'freemium',
        integrationInstructions: 'Nhập tên hợp chất hoặc phản ứng, AI sẽ vẽ công thức',
        samplePrompts: [
            'Vẽ công thức cấu tạo của "Glucose"',
            'Cân bằng phương trình "CaCO3 + HCl"'
        ],
        relatedTools: ['phet-simulation', 'labster']
    },

    // 📝 ASSESSMENT & QUIZ TOOLS
    {
        id: 'quizizz-ai',
        name: 'Quizizz AI',
        description: 'Tạo quiz và đánh giá tự động với AI',
        url: 'https://quizizz.com/quizizz-ai',
        category: AIToolCategory.ASSESSMENT,
        subjects: ['Toán', 'Văn', 'Khoa học tự nhiên', 'Lịch sử & Địa lí', 'Giáo dục công dân', 'Công nghệ'],
        gradeLevel: [6, 7, 8, 9],
        useCase: 'Tạo bài kiểm tra trắc nghiệm theo Bloom Taxonomy',
        vietnameseSupport: true,
        difficulty: 'beginner',
        features: ['Auto-generate questions', 'Bloom taxonomy', 'Real-time feedback'],
        pricingModel: 'freemium',
        integrationInstructions: 'Sử dụng AI Question Generator trong Quizizz',
        samplePrompts: [
            'Tạo 10 câu hỏi trắc nghiệm về "Phân số" cho lớp 6',
            'Quiz đánh giá hiểu biết về "Cách mạng tháng Tám"'
        ],
        relatedTools: ['questionwell', 'formative-ai']
    },
    {
        id: 'questionwell',
        name: 'QuestionWell',
        description: 'AI tạo câu hỏi chất lượng cao',
        url: 'https://questionwell.org/',
        category: AIToolCategory.ASSESSMENT,
        subjects: ['Toán', 'Văn', 'Khoa học tự nhiên', 'Lịch sử & Địa lí', 'Giáo dục công dân', 'Công nghệ'],
        gradeLevel: [6, 7, 8, 9],
        useCase: 'Tạo câu hỏi đánh giá theo chuẩn giáo dục',
        vietnameseSupport: true,
        difficulty: 'intermediate',
        features: ['High-quality questions', 'Educational standards', 'Multiple formats'],
        pricingModel: 'freemium',
        integrationInstructions: 'Nhập chủ đề và mức độ, AI tạo câu hỏi phù hợp',
        samplePrompts: [
            'Tạo câu hỏi đánh giá "Hàm số bậc nhất" mức vận dụng',
            'Câu hỏi phân tích "Chí Phèo" của Nam Cao'
        ],
        relatedTools: ['quizizz-ai', 'formative-ai']
    },
    {
        id: 'formative-ai',
        name: 'Formative AI',
        description: 'Đánh giá formative với AI insights',
        url: 'https://www.formative.com/',
        category: AIToolCategory.ASSESSMENT,
        subjects: ['Toán', 'Văn', 'Khoa học tự nhiên', 'Lịch sử & Địa lí', 'Giáo dục công dân', 'Công nghệ'],
        gradeLevel: [6, 7, 8, 9],
        useCase: 'Đánh giá quá trình học tập với phản hồi tức thì',
        vietnameseSupport: true,
        difficulty: 'intermediate',
        features: ['Real-time feedback', 'Progress tracking', 'AI insights'],
        pricingModel: 'freemium',
        integrationInstructions: 'Tạo formative assessment, AI phân tích kết quả',
        samplePrompts: [
            'Đánh giá hiểu biết "Định lý Pythagoras" theo thời gian thực',
            'Theo dõi tiến độ học "Ngữ pháp tiếng Việt"'
        ],
        relatedTools: ['quizizz-ai', 'questionwell']
    },
    {
        id: 'kahoot',
        name: 'Kahoot!',
        description: 'Game-based learning platform với AI',
        url: 'https://kahoot.com/',
        category: AIToolCategory.ASSESSMENT,
        subjects: ['Toán', 'Văn', 'Khoa học tự nhiên', 'Lịch sử & Địa lí', 'Giáo dục công dân', 'Công nghệ'],
        gradeLevel: [6, 7, 8, 9],
        useCase: 'Tạo game học tập tương tác',
        vietnameseSupport: true,
        difficulty: 'beginner',
        features: ['Game-based learning', 'Live competitions', 'Engagement analytics'],
        pricingModel: 'freemium',
        integrationInstructions: 'Tạo Kahoot quiz, học sinh join bằng PIN',
        samplePrompts: [
            'Game ôn tập "Bảng tuần hoàn" cho lớp 8',
            'Kahoot về "Danh từ và động từ" lớp 6'
        ],
        relatedTools: ['quizizz-ai', 'blooket']
    },

    // 🗺️ MAP & DATA VISUALIZATION TOOLS
    {
        id: 'google-earth',
        name: 'Google Earth',
        description: 'Khám phá địa lí thế giới với AI',
        url: 'https://earth.google.com/web',
        category: AIToolCategory.SIMULATION,
        subjects: ['Lịch sử & Địa lí', 'Khoa học tự nhiên'],
        gradeLevel: [6, 7, 8, 9],
        useCase: 'Khám phá địa lí, lịch sử qua bản đồ 3D',
        vietnameseSupport: true,
        difficulty: 'beginner',
        features: ['3D Earth exploration', 'Historical imagery', 'Vietnamese locations'],
        pricingModel: 'free',
        integrationInstructions: 'Tìm kiếm địa điểm, sử dụng timeline để xem thay đổi',
        samplePrompts: [
            'Khám phá "Vịnh Hạ Long" qua Google Earth',
            'Xem sự thay đổi "Thành phố Hồ Chí Minh" qua thời gian'
        ],
        relatedTools: ['arcgis-storymaps', 'gapminder']
    },
    {
        id: 'arcgis-storymaps',
        name: 'ArcGIS StoryMaps',
        description: 'Tạo câu chuyện tương tác với bản đồ',
        url: 'https://storymaps.arcgis.com/',
        category: AIToolCategory.PRESENTATION,
        subjects: ['Lịch sử & Địa lí', 'Khoa học tự nhiên'],
        gradeLevel: [6, 7, 8, 9],
        useCase: 'Kể chuyện qua bản đồ tương tác',
        vietnameseSupport: true,
        difficulty: 'intermediate',
        features: ['Interactive maps', 'Multimedia content', 'Story templates'],
        pricingModel: 'freemium',
        integrationInstructions: 'Tạo story map, thêm maps và multimedia content',
        samplePrompts: [
            'Story map về "Hành trình Hồ Chí Minh"',
            'Bản đồ tương tác "Thiên tai ở Việt Nam"'
        ],
        relatedTools: ['google-earth', 'flourish']
    },
    {
        id: 'gapminder',
        name: 'Gapminder Tools',
        description: 'Trực quan hóa dữ liệu thống kê thế giới',
        url: 'https://www.gapminder.org/tools/',
        category: AIToolCategory.DATA_ANALYSIS,
        subjects: ['Lịch sử & Địa lí', 'Khoa học tự nhiên'],
        gradeLevel: [7, 8, 9],
        useCase: 'Phân tích xu hướng dân số, kinh tế, xã hội',
        vietnameseSupport: false,
        difficulty: 'intermediate',
        features: ['Global statistics', 'Animated charts', 'Trend analysis'],
        pricingModel: 'free',
        integrationInstructions: 'Chọn indicators, tạo animated bubble charts',
        samplePrompts: [
            'So sánh "GDP và tuổi thọ" các nước ASEAN',
            'Xu hướng "Dân số và giáo dục" Việt Nam'
        ],
        relatedTools: ['flourish', 'datawrapper']
    },
    {
        id: 'flourish',
        name: 'Flourish Studio',
        description: 'Tạo biểu đồ và visualization tương tác',
        url: 'https://flourish.studio/',
        category: AIToolCategory.DATA_ANALYSIS,
        subjects: ['Toán', 'Lịch sử & Địa lí', 'Khoa học tự nhiên'],
        gradeLevel: [6, 7, 8, 9],
        useCase: 'Tạo biểu đồ, timeline, bản đồ dữ liệu',
        vietnameseSupport: true,
        difficulty: 'intermediate',
        features: ['Interactive charts', 'Timeline creation', 'Data storytelling'],
        pricingModel: 'freemium',
        integrationInstructions: 'Upload data, chọn template, customize visualization',
        samplePrompts: [
            'Timeline "Các triều đại Việt Nam"',
            'Biểu đồ "Kết quả học tập lớp 8A"'
        ],
        relatedTools: ['datawrapper', 'timelinejs']
    },
    {
        id: 'datawrapper',
        name: 'Datawrapper',
        description: 'Tạo biểu đồ chuyên nghiệp từ dữ liệu',
        url: 'https://www.datawrapper.de/',
        category: AIToolCategory.DATA_ANALYSIS,
        subjects: ['Toán', 'Lịch sử & Địa lí', 'Khoa học tự nhiên'],
        gradeLevel: [7, 8, 9],
        useCase: 'Tạo charts và maps từ dữ liệu Excel',
        vietnameseSupport: true,
        difficulty: 'beginner',
        features: ['Easy chart creation', 'Map visualization', 'Embed anywhere'],
        pricingModel: 'freemium',
        integrationInstructions: 'Upload CSV/Excel, chọn chart type, customize',
        samplePrompts: [
            'Biểu đồ "Dân số các tỉnh Việt Nam"',
            'Chart "Điểm trung bình các môn học"'
        ],
        relatedTools: ['flourish', 'gapminder']
    },

    // 🛠️ CODING & TECHNICAL TOOLS
    {
        id: 'makecode',
        name: 'Microsoft MakeCode',
        description: 'Lập trình kéo thả cho học sinh',
        url: 'https://www.microsoft.com/en-us/makecode',
        category: AIToolCategory.SIMULATION,
        subjects: ['Công nghệ', 'Toán'],
        gradeLevel: [6, 7, 8, 9],
        useCase: 'Học lập trình cơ bản, điều khiển micro:bit',
        vietnameseSupport: true,
        difficulty: 'beginner',
        features: ['Block-based coding', 'Micro:bit support', 'Simulator'],
        pricingModel: 'free',
        integrationInstructions: 'Kéo thả blocks để tạo chương trình',
        samplePrompts: [
            'Lập trình đèn LED nhấp nháy trên micro:bit',
            'Tạo game đơn giản với MakeCode'
        ],
        relatedTools: ['tinkercad', 'scratch']
    },
    {
        id: 'scratch',
        name: 'Scratch',
        description: 'Ngôn ngữ lập trình trực quan cho trẻ em',
        url: 'https://scratch.mit.edu/',
        category: AIToolCategory.SIMULATION,
        subjects: ['Công nghệ', 'Toán'],
        gradeLevel: [6, 7, 8, 9],
        useCase: 'Tạo game, animation, mô phỏng tương tác',
        vietnameseSupport: true,
        difficulty: 'beginner',
        features: ['Visual programming', 'Animation tools', 'Community sharing'],
        pricingModel: 'free',
        integrationInstructions: 'Kéo thả blocks để tạo chương trình',
        samplePrompts: [
            'Tạo game "Mèo bắt chuột" đơn giản',
            'Animation minh họa "Chu trình nước"'
        ],
        relatedTools: ['makecode', 'cospaces-edu']
    },

    // 📊 ADDITIONAL DATA ANALYSIS TOOLS
    {
        id: 'timelinejs',
        name: 'TimelineJS',
        description: 'Tạo timeline tương tác từ Google Sheets',
        url: 'https://timeline.knightlab.com/',
        category: AIToolCategory.DATA_ANALYSIS,
        subjects: ['Lịch sử & Địa lí', 'Văn'],
        gradeLevel: [6, 7, 8, 9],
        useCase: 'Tạo dòng thời gian sự kiện lịch sử, văn học',
        vietnameseSupport: true,
        difficulty: 'beginner',
        features: ['Google Sheets integration', 'Media support', 'Responsive design'],
        pricingModel: 'free',
        integrationInstructions: 'Tạo Google Sheet theo template, publish timeline',
        samplePrompts: [
            'Timeline "Cuộc kháng chiến chống Pháp"',
            'Dòng thời gian "Văn học Việt Nam hiện đại"'
        ],
        relatedTools: ['flourish', 'arcgis-storymaps']
    },

    // 🎮 GAMIFICATION TOOLS
    {
        id: 'blooket',
        name: 'Blooket',
        description: 'Game-based learning với nhiều format',
        url: 'https://www.blooket.com/',
        category: AIToolCategory.ASSESSMENT,
        subjects: ['Toán', 'Văn', 'Khoa học tự nhiên', 'Lịch sử & Địa lí', 'Giáo dục công dân', 'Công nghệ'],
        gradeLevel: [6, 7, 8, 9],
        useCase: 'Tạo game học tập đa dạng format',
        vietnameseSupport: true,
        difficulty: 'beginner',
        features: ['Multiple game modes', 'Custom questions', 'Student engagement'],
        pricingModel: 'freemium',
        integrationInstructions: 'Tạo question set, chọn game mode, share với học sinh',
        samplePrompts: [
            'Game "Tower Defense" ôn tập Toán lớp 7',
            'Battle Royale về "Địa lí Việt Nam"'
        ],
        relatedTools: ['kahoot', 'quizizz-ai']
    },

    // 🔍 RESEARCH & ANALYSIS TOOLS
    {
        id: 'wolfram-alpha',
        name: 'Wolfram Alpha',
        description: 'Computational knowledge engine cho Toán và Khoa học',
        url: 'https://www.wolframalpha.com/',
        category: AIToolCategory.DATA_ANALYSIS,
        subjects: ['Toán', 'Khoa học tự nhiên'],
        gradeLevel: [7, 8, 9],
        useCase: 'Giải toán, phân tích dữ liệu khoa học',
        vietnameseSupport: false,
        difficulty: 'intermediate',
        features: ['Step-by-step solutions', 'Scientific calculations', 'Data analysis'],
        pricingModel: 'freemium',
        integrationInstructions: 'Nhập phương trình hoặc câu hỏi khoa học',
        samplePrompts: [
            'Giải phương trình bậc hai x² + 5x + 6 = 0',
            'Phân tích dữ liệu nhiệt độ Hà Nội'
        ],
        relatedTools: ['geogebra', 'desmos']
    },

    // 📐 MATH VISUALIZATION TOOLS
    {
        id: 'geogebra',
        name: 'GeoGebra',
        description: 'Phần mềm toán học động với AI hỗ trợ',
        url: 'https://www.geogebra.org/',
        category: AIToolCategory.SIMULATION,
        subjects: ['Toán'],
        gradeLevel: [6, 7, 8, 9],
        useCase: 'Vẽ đồ thị, hình học động, mô phỏng toán học',
        vietnameseSupport: true,
        difficulty: 'intermediate',
        features: ['Dynamic geometry', 'Graphing calculator', 'Interactive worksheets'],
        pricingModel: 'free',
        integrationInstructions: 'Sử dụng tools để vẽ và tương tác với đối tượng toán học',
        samplePrompts: [
            'Vẽ đồ thị hàm số y = 2x + 3',
            'Mô phỏng định lý Pythagoras'
        ],
        relatedTools: ['desmos', 'wolfram-alpha']
    },
    {
        id: 'desmos',
        name: 'Desmos Graphing Calculator',
        description: 'Máy tính đồ thị trực tuyến mạnh mẽ',
        url: 'https://www.desmos.com/calculator',
        category: AIToolCategory.SIMULATION,
        subjects: ['Toán'],
        gradeLevel: [7, 8, 9],
        useCase: 'Vẽ đồ thị hàm số, phân tích toán học',
        vietnameseSupport: false,
        difficulty: 'beginner',
        features: ['Advanced graphing', 'Function analysis', 'Interactive sliders'],
        pricingModel: 'free',
        integrationInstructions: 'Nhập phương trình để vẽ đồ thị tự động',
        samplePrompts: [
            'Vẽ đồ thị parabol y = x²',
            'Phân tích hàm số bậc nhất'
        ],
        relatedTools: ['geogebra', 'wolfram-alpha']
    }
];

// Helper functions for filtering and searching
export const getToolsByCategory = (category: AIToolCategory): AIToolDetails[] => {
    return AI_TOOLS_DATABASE.filter(tool => tool.category === category);
};

export const getToolsBySubject = (subject: string): AIToolDetails[] => {
    return AI_TOOLS_DATABASE.filter(tool => tool.subjects.includes(subject));
};

export const getToolsByGradeLevel = (gradeLevel: 6 | 7 | 8 | 9): AIToolDetails[] => {
    return AI_TOOLS_DATABASE.filter(tool => tool.gradeLevel.includes(gradeLevel));
};

export const getToolsByDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced'): AIToolDetails[] => {
    return AI_TOOLS_DATABASE.filter(tool => tool.difficulty === difficulty);
};

export const getVietnameseSupportedTools = (): AIToolDetails[] => {
    return AI_TOOLS_DATABASE.filter(tool => tool.vietnameseSupport);
};

export const getFreeTools = (): AIToolDetails[] => {
    return AI_TOOLS_DATABASE.filter(tool => tool.pricingModel === 'free');
};

export const searchTools = (query: string): AIToolDetails[] => {
    const lowercaseQuery = query.toLowerCase();
    return AI_TOOLS_DATABASE.filter(tool =>
        tool.name.toLowerCase().includes(lowercaseQuery) ||
        tool.description.toLowerCase().includes(lowercaseQuery) ||
        tool.useCase.toLowerCase().includes(lowercaseQuery) ||
        tool.subjects.some(subject => subject.toLowerCase().includes(lowercaseQuery))
    );
};

export const getCurriculumCreationTools = (subject?: string, gradeLevel?: 6 | 7 | 8 | 9): AIToolDetails[] => {
    // Tools specifically good for curriculum/textbook creation
    const curriculumToolIds = [
        // Primary text generation tools for curriculum content
        'chatgpt', 'gemini', 'copilot', 'perplexity-ai',
        // Presentation tools for visual curriculum materials
        'canva-ai', 'gamma', 'tome',
        // Assessment tools for exercises and questions
        'quizizz-ai', 'questionwell', 'formative-ai',
        // Image tools for illustrations
        'microsoft-designer', 'leonardo-ai',
        // Data visualization for educational charts
        'flourish', 'datawrapper'
    ];

    let tools = AI_TOOLS_DATABASE.filter(tool => curriculumToolIds.includes(tool.id));

    // Filter by subject if provided
    if (subject) {
        tools = tools.filter(tool => tool.subjects.includes(subject));
    }

    // Filter by grade level if provided
    if (gradeLevel) {
        tools = tools.filter(tool => tool.gradeLevel.includes(gradeLevel));
    }

    // Sort by relevance for curriculum creation:
    // 1. Vietnamese support first
    // 2. Free/freemium tools first
    // 3. Beginner-friendly tools first
    return tools.sort((a, b) => {
        if (a.vietnameseSupport && !b.vietnameseSupport) return -1;
        if (!a.vietnameseSupport && b.vietnameseSupport) return 1;

        if (a.pricingModel === 'free' && b.pricingModel !== 'free') return -1;
        if (a.pricingModel !== 'free' && b.pricingModel === 'free') return 1;

        if (a.difficulty === 'beginner' && b.difficulty !== 'beginner') return -1;
        if (a.difficulty !== 'beginner' && b.difficulty === 'beginner') return 1;

        return 0;
    });
};