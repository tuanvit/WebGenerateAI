import { TargetAITool } from '../../../types/prompt';

/**
 * Base class for AI tool prompt formatters
 * Provides common formatting functionality and interface
 */
export abstract class BaseFormatter {
    protected readonly toolName: string;
    protected readonly toolUrl: string;

    constructor(toolName: string, toolUrl: string) {
        this.toolName = toolName;
        this.toolUrl = toolUrl;
    }

    /**
     * Formats the prompt for the specific AI tool
     */
    abstract formatPrompt(prompt: string): string;

    /**
     * Gets usage instructions for the specific tool
     */
    abstract getUsageInstructions(): string[];

    /**
     * Gets the tool's display name
     */
    getToolName(): string {
        return this.toolName;
    }

    /**
     * Gets the tool's URL
     */
    getToolUrl(): string {
        return this.toolUrl;
    }

    /**
     * Adds common Vietnamese educational context to prompts
     */
    protected addEducationalContext(prompt: string): string {
        return `${prompt}

---
LƯU Ý QUAN TRỌNG:
- Vui lòng tạo nội dung phù hợp với Chương trình Giáo dục Phổ thông 2018 (GDPT 2018)
- Tuân thủ các quy định trong Công văn 5512 về xây dựng kế hoạch bài dạy
- Sử dụng thuật ngữ sư phạm Việt Nam phù hợp
- Nội dung phải phù hợp với học sinh lớp 6-9`;
    }

    /**
     * Adds tool-specific instructions footer
     */
    protected addInstructionsFooter(instructions: string[]): string {
        return `
---
HƯỚNG DẪN SỬ DỤNG VỚI ${this.toolName.toUpperCase()}:
${instructions.map((instruction, index) => `${index + 1}. ${instruction}`).join('\n')}

💡 Mẹo: Sau khi có kết quả, bạn có thể yêu cầu AI điều chỉnh hoặc bổ sung thêm thông tin cụ thể.`;
    }
}