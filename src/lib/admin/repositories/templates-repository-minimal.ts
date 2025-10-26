/**
 * Minimal Templates Repository for testing
 */

export interface TemplateData {
    id?: string;
    name: string;
    description: string;
    subject: string;
    gradeLevel: number[];
    outputType: 'lesson-plan' | 'presentation' | 'assessment' | 'interactive' | 'research';
    templateContent: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface TemplateFilters {
    page?: number;
    limit?: number;
    search?: string;
    subject?: string;
    outputType?: string;
}

export interface AdminPaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export class TemplatesRepository {
    // In-memory storage for templates
    private templates: TemplateData[] = [
        {
            id: 'template-1',
            name: 'Kế hoạch bài dạy Toán lớp 6',
            description: 'Template tạo kế hoạch bài dạy môn Toán cho lớp 6',
            subject: 'Toán',
            gradeLevel: [6],
            outputType: 'lesson-plan',
            templateContent: 'Nội dung template...',
            difficulty: 'beginner'
        }
    ];

    async getTemplates(filters: TemplateFilters = {}): Promise<AdminPaginatedResponse<TemplateData>> {
        // Use the stored templates instead of fixed mock data
        const mockData = this.templates;

        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const total = mockData.length;
        const totalPages = Math.ceil(total / limit);

        return {
            data: mockData,
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        };
    }

    async createTemplate(data: TemplateData): Promise<TemplateData> {
        // Generate a unique ID
        const newTemplate: TemplateData = {
            ...data,
            id: 'template-' + Date.now()
        };

        // Add to the in-memory storage
        this.templates.push(newTemplate);

        return newTemplate;
    }

    async getTemplateById(id: string): Promise<TemplateData | null> {
        return this.templates.find(t => t.id === id) || null;
    }

    async updateTemplate(id: string, data: Partial<TemplateData>): Promise<TemplateData> {
        const index = this.templates.findIndex(t => t.id === id);
        if (index === -1) {
            throw new Error('Template not found');
        }

        this.templates[index] = { ...this.templates[index], ...data };
        return this.templates[index];
    }

    async deleteTemplate(id: string): Promise<void> {
        const index = this.templates.findIndex(t => t.id === id);
        if (index === -1) {
            throw new Error('Template not found');
        }

        this.templates.splice(index, 1);
    }

    async bulkUpdateTemplates(ids: string[], updates: Partial<TemplateData>): Promise<number> {
        let count = 0;
        for (const id of ids) {
            const index = this.templates.findIndex(t => t.id === id);
            if (index !== -1) {
                this.templates[index] = { ...this.templates[index], ...updates };
                count++;
            }
        }
        return count;
    }

    async bulkDeleteTemplates(ids: string[]): Promise<number> {
        let count = 0;
        for (const id of ids) {
            const index = this.templates.findIndex(t => t.id === id);
            if (index !== -1) {
                this.templates.splice(index, 1);
                count++;
            }
        }
        return count;
    }

    async getTemplatesStats(): Promise<{
        total: number;
        bySubject: Record<string, number>;
        byDifficulty: Record<string, number>;
        byOutputType: Record<string, number>;
    }> {
        const total = this.templates.length;

        const bySubject: Record<string, number> = {};
        const byDifficulty: Record<string, number> = {};
        const byOutputType: Record<string, number> = {};

        for (const template of this.templates) {
            // Count by subject
            bySubject[template.subject] = (bySubject[template.subject] || 0) + 1;

            // Count by difficulty
            byDifficulty[template.difficulty] = (byDifficulty[template.difficulty] || 0) + 1;

            // Count by output type
            byOutputType[template.outputType] = (byOutputType[template.outputType] || 0) + 1;
        }

        return {
            total,
            bySubject,
            byDifficulty,
            byOutputType
        };
    }
}

// Export singleton instance
const templatesRepositoryInstance = new TemplatesRepository();
export default templatesRepositoryInstance;