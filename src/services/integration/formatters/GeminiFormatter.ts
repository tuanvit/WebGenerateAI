import { BaseFormatter } from './BaseFormatter';

/**
 * Google Gemini-specific prompt formatter
 * Optimizes prompts for Google's Gemini AI interface and capabilities
 */
export class GeminiFormatter extends BaseFormatter {
    constructor() {
        super('Google Gemini', 'https://gemini.google.com/');
    }

    formatPrompt(prompt: string): string {
        const educationalPrompt = this.addEducationalContext(prompt);
        const instructions = this.getUsageInstructions();
        const instructionsFooter = this.addInstructionsFooter(instructions);

        return `${educationalPrompt}

---
TỐI ƯU HÓA CHO GOOGLE GEMINI:
- Gemini có khả năng hiểu ngữ cảnh tốt và xử lý tiếng Việt chính xác
- Hỗ trợ tạo nội dung sáng tạo và có cấu trúc logic
- Có thể tích hợp với các dịch vụ Google khác
- Phù hợp cho việc tạo nội dung giáo dục đa dạng

${instructionsFooter}`;
    }

    getUsageInstructions(): string[] {
        return [
            'Sao chép toàn bộ prompt này',
            'Mở Google Gemini trong tab mới',
            'Dán prompt vào ô nhập liệu',
            'Nhấn Enter hoặc biểu tượng gửi',
            'Chờ Gemini phân tích và tạo nội dung',
            'Có thể tiếp tục hội thoại để tinh chỉnh kết quả'
        ];
    }
}