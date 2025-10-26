export enum AIToolCategory {
    TEXT_GENERATION = "TEXT_GENERATION",
    PRESENTATION = "PRESENTATION",
    VIDEO = "VIDEO",
    SIMULATION = "SIMULATION",
    IMAGE = "IMAGE",
    DATA_ANALYSIS = "DATA_ANALYSIS",
    ASSESSMENT = "ASSESSMENT",
    SUBJECT_SPECIFIC = "SUBJECT_SPECIFIC",
}

export interface AITool {
    id: string;
    name: string;
    description: string;
    url: string;
    category: AIToolCategory;
    subjects: string[];
    gradeLevel: (6 | 7 | 8 | 9)[];
    useCase: string;
    vietnameseSupport: boolean;
    difficulty: "beginner" | "intermediate" | "advanced";
}

export interface AIToolDetails extends AITool {
    features: string[];
    pricingModel: "free" | "freemium" | "paid";
    integrationInstructions: string;
    samplePrompts: string[];
    relatedTools: string[];
}

export interface RecommendationCriteria {
    subject: string;
    gradeLevel: 6 | 7 | 8 | 9;
    teachingObjective:
    | "lesson-planning"
    | "presentation"
    | "assessment"
    | "interactive-content"
    | "research";
    outputType: "text" | "visual" | "video" | "interactive";
    difficultyPreference?: "beginner" | "intermediate" | "advanced";
}

export interface ToolFilters {
    category?: AIToolCategory;
    subject?: string;
    gradeLevel?: (6 | 7 | 8 | 9)[];
    vietnameseSupport?: boolean;
    pricingModel?: "free" | "freemium" | "paid";
    difficulty?: "beginner" | "intermediate" | "advanced";
}

export interface UserPreferences {
    favoriteTools: string[];
    recentlyUsedTools: string[];
    preferredDifficulty: "beginner" | "intermediate" | "advanced";
    preferredPricingModel: "free" | "freemium" | "paid" | "any";
    subjectExpertise: Record<string, "beginner" | "intermediate" | "advanced">;
}

// Sample AI Tools Database
export const AI_TOOLS_DATABASE: AIToolDetails[] = [
    {
        id: "chatgpt",
        name: "ChatGPT",
        description:
            "Công cụ AI tạo văn bản mạnh mẽ cho soạn kế hoạch bài dạy và câu hỏi",
        url: "https://chat.openai.com/",
        category: AIToolCategory.TEXT_GENERATION,
        subjects: [
            "Toán",
            "Văn",
            "Khoa học tự nhiên",
            "Lịch sử & Địa lí",
            "Giáo dục công dân",
            "Công nghệ",
        ],
        gradeLevel: [6, 7, 8, 9],
        useCase: "Soạn kế hoạch bài dạy, tạo câu hỏi, phát triển nội dung bài học",
        vietnameseSupport: true,
        difficulty: "beginner",
        features: [
            "Tạo kế hoạch bài dạy theo CV 5512",
            "Câu hỏi phân loại Bloom",
            "Hỗ trợ tiếng Việt",
        ],
        pricingModel: "freemium",
        integrationInstructions: "Dán prompt đã tạo vào ChatGPT và nhấn Enter",
        samplePrompts: [
            'Soạn kế hoạch bài dạy môn Toán lớp 8 bài "Phương trình bậc nhất một ẩn"',
            'Tạo 10 câu hỏi trắc nghiệm môn Văn về "Tự tình II" của Hồ Xuân Hương',
        ],
        relatedTools: ["gemini", "copilot"],
    },
    {
        id: "gemini",
        name: "Google Gemini",
        description:
            "AI của Google hỗ trợ tạo nội dung giáo dục đa phương tiện",
        url: "https://gemini.google.com/",
        category: AIToolCategory.TEXT_GENERATION,
        subjects: [
            "Toán",
            "Văn",
            "Khoa học tự nhiên",
            "Lịch sử & Địa lí",
            "Giáo dục công dân",
            "Công nghệ",
        ],
        gradeLevel: [6, 7, 8, 9],
        useCase: "Tạo nội dung bài học, phân tích tài liệu, hỗ trợ nghiên cứu",
        vietnameseSupport: true,
        difficulty: "beginner",
        features: [
            "Tích hợp Google Workspace",
            "Phân tích hình ảnh",
            "Tìm kiếm thông tin",
        ],
        pricingModel: "free",
        integrationInstructions: "Truy cập Gemini và nhập prompt đã tạo",
        samplePrompts: [
            'Giải thích khái niệm "Cách mạng tháng Tám 1945" cho học sinh lớp 9',
            'Tạo sơ đồ tư duy về "Hệ tuần hoàn" cho môn Khoa học tự nhiên',
        ],
        relatedTools: ["chatgpt", "copilot"],
    },
    {
        id: "canva-ai",
        name: "Canva AI",
        description: "Công cụ thiết kế slide và infographic với AI",
        url: "https://www.canva.com/ai/",
        category: AIToolCategory.PRESENTATION,
        subjects: [
            "Toán",
            "Văn",
            "Khoa học tự nhiên",
            "Lịch sử & Địa lí",
            "Giáo dục công dân",
            "Công nghệ",
        ],
        gradeLevel: [6, 7, 8, 9],
        useCase: "Tạo slide bài giảng, poster, infographic giáo dục",
        vietnameseSupport: true,
        difficulty: "beginner",
        features: ["Magic Presentation", "Template giáo dục", "Hình ảnh AI"],
        pricingModel: "freemium",
        integrationInstructions:
            "Sử dụng Magic Presentation hoặc Magic Write trong Canva",
        samplePrompts: [
            'Tạo slide về "Định lý Pythagoras" với hình ảnh minh họa',
            'Thiết kế poster tuyên truyền "An toàn giao thông" cho học sinh',
        ],
        relatedTools: ["gamma", "tome"],
    },
    {
        id: "geogebra",
        name: "GeoGebra",
        description: "Công cụ toán học động với AI hỗ trợ",
        url: "https://www.geogebra.org/",
        category: AIToolCategory.SUBJECT_SPECIFIC,
        subjects: ["Toán"],
        gradeLevel: [6, 7, 8, 9],
        useCase: "Tạo hình học động, đồ thị, mô phỏng toán học",
        vietnameseSupport: true,
        difficulty: "intermediate",
        features: [
            "Interactive geometry",
            "Graphing calculator",
            "Vietnamese interface",
        ],
        pricingModel: "free",
        integrationInstructions:
            "Sử dụng GeoGebra Classroom để tạo bài tập tương tác",
        samplePrompts: [
            "Tạo mô hình hình học minh họa định lý Pythagoras",
            "Vẽ đồ thị hàm số y = ax² + bx + c với thanh trượt",
        ],
        relatedTools: ["desmos", "mathigon"],
    },
    {
        id: "quizizz-ai",
        name: "Quizizz AI",
        description: "Tạo quiz và đánh giá tự động với AI",
        url: "https://quizizz.com/quizizz-ai",
        category: AIToolCategory.ASSESSMENT,
        subjects: [
            "Toán",
            "Văn",
            "Khoa học tự nhiên",
            "Lịch sử & Địa lí",
            "Giáo dục công dân",
            "Công nghệ",
        ],
        gradeLevel: [6, 7, 8, 9],
        useCase: "Tạo bài kiểm tra trắc nghiệm theo Bloom Taxonomy",
        vietnameseSupport: true,
        difficulty: "beginner",
        features: [
            "Auto-generate questions",
            "Bloom taxonomy",
            "Real-time feedback",
        ],
        pricingModel: "freemium",
        integrationInstructions: "Sử dụng AI Question Generator trong Quizizz",
        samplePrompts: [
            'Tạo 10 câu hỏi trắc nghiệm về "Phân số" cho lớp 6',
            'Quiz đánh giá hiểu biết về "Cách mạng tháng Tám"',
        ],
        relatedTools: ["questionwell", "formative-ai"],
    },
];

export class AIToolRecommendationService {
    private tools: AIToolDetails[] = AI_TOOLS_DATABASE;
    private dbToolsLoaded: boolean = false;

    /**
     * Load tools from database and merge with static data
     * This ensures admin-added tools are available
     */
    private async loadToolsFromDatabase(): Promise<void> {
        if (this.dbToolsLoaded) return;

        try {
            // Dynamic import to avoid circular dependencies
            const { AIToolsService } = await import('@/lib/admin/services/ai-tools-service');
            const aiToolsService = new AIToolsService();

            const result = await aiToolsService.getAITools({ limit: 1000 });

            if (result.data && result.data.length > 0) {
                // Convert database tools to AIToolDetails format
                const dbTools: AIToolDetails[] = result.data.map(tool => ({
                    id: tool.id,
                    name: tool.name,
                    description: tool.description,
                    url: tool.url,
                    category: tool.category as AIToolCategory,
                    subjects: tool.subjects,
                    gradeLevel: tool.gradeLevel as (6 | 7 | 8 | 9)[],
                    useCase: tool.useCase,
                    vietnameseSupport: tool.vietnameseSupport,
                    difficulty: tool.difficulty as "beginner" | "intermediate" | "advanced",
                    features: tool.features,
                    pricingModel: tool.pricingModel as "free" | "freemium" | "paid",
                    integrationInstructions: (tool as any).integrationGuide || tool.useCase,
                    samplePrompts: tool.samplePrompts,
                    relatedTools: tool.relatedTools
                }));

                // Merge database tools with static tools (database takes priority)
                const staticToolIds = new Set(AI_TOOLS_DATABASE.map(t => t.id));
                const newDbTools = dbTools.filter(t => !staticToolIds.has(t.id));

                this.tools = [...dbTools.filter(t => staticToolIds.has(t.id)), ...newDbTools, ...AI_TOOLS_DATABASE.filter(t => !dbTools.some(db => db.id === t.id))];
                this.dbToolsLoaded = true;
            }
        } catch (error) {
            console.warn('Could not load tools from database, using static data:', error);
            // Continue with static data
        }
    }

    async getRecommendedTools(
        criteria: RecommendationCriteria,
        userPreferences?: UserPreferences
    ): Promise<AITool[]> {
        await this.loadToolsFromDatabase();

        let filteredTools = this.tools.filter((tool) => {
            const subjectMatch =
                tool.subjects.includes(criteria.subject) ||
                tool.subjects.includes("Tất cả môn học");
            const gradeMatch = tool.gradeLevel.includes(criteria.gradeLevel);
            const difficultyMatch =
                !criteria.difficultyPreference ||
                tool.difficulty === criteria.difficultyPreference;

            return subjectMatch && gradeMatch && difficultyMatch;
        });

        filteredTools = this.sortByRelevance(
            filteredTools,
            criteria,
            userPreferences
        );
        return filteredTools.slice(0, 6);
    }

    async getTrendingTools(limit: number = 10): Promise<AITool[]> {
        await this.loadToolsFromDatabase();

        const trendingTools = this.tools
            .filter((tool) => tool.vietnameseSupport)
            .sort((a, b) => {
                let scoreA = 0;
                let scoreB = 0;

                if (a.pricingModel === "free") scoreA += 10;
                if (b.pricingModel === "free") scoreB += 10;

                if (a.difficulty === "beginner") scoreA += 8;
                if (b.difficulty === "beginner") scoreB += 8;

                scoreA += a.subjects.length * 2;
                scoreB += b.subjects.length * 2;

                scoreA += a.features.length;
                scoreB += b.features.length;

                return scoreB - scoreA;
            })
            .slice(0, limit);

        return trendingTools;
    }

    async getToolDetails(toolId: string): Promise<AIToolDetails | null> {
        await this.loadToolsFromDatabase();

        return this.tools.find((tool) => tool.id === toolId) || null;
    }

    async searchTools(query: string, filters?: ToolFilters): Promise<AITool[]> {
        await this.loadToolsFromDatabase();

        if (!query || query.trim() === "") {
            return [];
        }

        let results = this.tools.filter(
            (tool) =>
                tool.name.toLowerCase().includes(query.toLowerCase()) ||
                tool.description.toLowerCase().includes(query.toLowerCase()) ||
                tool.useCase.toLowerCase().includes(query.toLowerCase())
        );

        if (filters) {
            results = this.applyFilters(results, filters);
        }

        return results;
    }

    async getToolsByCategory(category: AIToolCategory): Promise<AITool[]> {
        await this.loadToolsFromDatabase();

        return this.tools.filter((tool) => tool.category === category);
    }

    async getSubjectSpecificTools(subject: string): Promise<AITool[]> {
        await this.loadToolsFromDatabase();

        return this.tools.filter(
            (tool) =>
                tool.subjects.includes(subject) ||
                tool.subjects.includes("Tất cả môn học")
        );
    }

    private sortByRelevance(
        tools: AIToolDetails[],
        criteria: RecommendationCriteria,
        userPreferences?: UserPreferences
    ): AIToolDetails[] {
        return tools.sort((a, b) => {
            const scoreA = this.calculateRelevanceScore(
                a,
                criteria,
                userPreferences
            );
            const scoreB = this.calculateRelevanceScore(
                b,
                criteria,
                userPreferences
            );
            return scoreB - scoreA;
        });
    }

    private calculateRelevanceScore(
        tool: AIToolDetails,
        criteria: RecommendationCriteria,
        userPreferences?: UserPreferences
    ): number {
        let score = 0;

        if (tool.subjects.includes(criteria.subject)) {
            score += 20;
        } else if (tool.subjects.includes("Tất cả môn học")) {
            score += 10;
        }

        if (this.matchesTeachingObjective(tool, criteria.teachingObjective)) {
            score += 15;
        }

        if (tool.vietnameseSupport) {
            score += 8;
        }

        if (tool.pricingModel === "free") {
            score += 5;
        } else if (tool.pricingModel === "freemium") {
            score += 3;
        }

        if (tool.gradeLevel.includes(criteria.gradeLevel)) {
            score += 4;
        }

        return score;
    }

    private matchesTeachingObjective(
        tool: AIToolDetails,
        objective: string
    ): boolean {
        const objectiveMapping = {
            "lesson-planning": [AIToolCategory.TEXT_GENERATION],
            presentation: [AIToolCategory.PRESENTATION, AIToolCategory.IMAGE],
            assessment: [AIToolCategory.ASSESSMENT],
            "interactive-content": [
                AIToolCategory.SIMULATION,
                AIToolCategory.VIDEO,
            ],
            research: [
                AIToolCategory.DATA_ANALYSIS,
                AIToolCategory.TEXT_GENERATION,
            ],
        };

        return (
            objectiveMapping[
                objective as keyof typeof objectiveMapping
            ]?.includes(tool.category) || false
        );
    }

    private applyFilters(
        tools: AIToolDetails[],
        filters: ToolFilters
    ): AIToolDetails[] {
        return tools.filter((tool) => {
            if (filters.category && tool.category !== filters.category)
                return false;
            if (filters.subject && !tool.subjects.includes(filters.subject))
                return false;
            if (
                filters.vietnameseSupport !== undefined &&
                tool.vietnameseSupport !== filters.vietnameseSupport
            )
                return false;
            if (
                filters.pricingModel &&
                tool.pricingModel !== filters.pricingModel
            )
                return false;
            if (filters.difficulty && tool.difficulty !== filters.difficulty)
                return false;
            if (
                filters.gradeLevel &&
                !filters.gradeLevel.some((grade) =>
                    tool.gradeLevel.includes(grade)
                )
            )
                return false;

            return true;
        });
    }
}

export const aiToolRecommendationService = new AIToolRecommendationService();
