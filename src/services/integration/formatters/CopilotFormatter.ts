import { BaseFormatter } from './BaseFormatter';

/**
 * Microsoft Copilot-specific prompt formatter
 * Optimizes prompts for Microsoft Copilot interface and capabilities
 */
export class CopilotFormatter extends BaseFormatter {
    constructor() {
        super('Microsoft Copilot', 'https://copilot.microsoft.com/');
    }

    formatPrompt(prompt: string): string {
        const educationalPrompt = this.addEducationalContext(prompt);
        const instructions = this.getUsageInstructions();
        const instructionsFooter = this.addInstructionsFooter(instructions);

        return `${educationalPrompt}

---
TỐI ƯU HÓA CHO MICROSOFT COPILOT:
- Copilot tích hợp tốt với hệ sinh thái Microsoft (Word, PowerPoint, Teams)
- Hỗ trợ tạo nội dung có thể xuất trực tiếp ra các ứng dụng Office
- Phù hợp cho việc tạo tài liệu giáo dục chuyên nghiệp
- Có khả năng tìm kiếm và tham khảo thông tin từ web

${instructionsFooter}`;
    }

    getUsageInstructions(): string[] {
        return [
            'Sao chép toàn bộ prompt này',
            'Mở Microsoft Copilot trong tab mới',
            'Dán prompt vào ô chat',
            'Nhấn Enter để gửi yêu cầu',
            'Copilot sẽ tạo nội dung và có thể đề xuất xuất ra Office',
            'Có thể yêu cầu chỉnh sửa hoặc xuất sang Word/PowerPoint'
        ];
    }
}