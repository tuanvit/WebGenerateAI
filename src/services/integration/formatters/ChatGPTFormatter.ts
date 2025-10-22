import { BaseFormatter } from './BaseFormatter';

/**
 * ChatGPT-specific prompt formatter
 * Optimizes prompts for OpenAI's ChatGPT interface and capabilities
 */
export class ChatGPTFormatter extends BaseFormatter {
    constructor() {
        super('ChatGPT', 'https://chat.openai.com/');
    }

    formatPrompt(prompt: string): string {
        const educationalPrompt = this.addEducationalContext(prompt);
        const instructions = this.getUsageInstructions();
        const instructionsFooter = this.addInstructionsFooter(instructions);

        return `${educationalPrompt}

---
TỐI ƯU HÓA CHO CHATGPT:
- Sử dụng cấu trúc prompt rõ ràng với vai trò (role), nhiệm vụ (task), và định dạng (format)
- ChatGPT hoạt động tốt với các yêu cầu chi tiết và có cấu trúc
- Có thể xử lý văn bản tiếng Việt một cách tự nhiên
- Hỗ trợ tạo nội dung dài và phức tạp

${instructionsFooter}`;
    }

    getUsageInstructions(): string[] {
        return [
            'Sao chép toàn bộ prompt này',
            'Mở ChatGPT trong tab mới',
            'Dán prompt vào ô chat',
            'Nhấn Enter hoặc nút Send để bắt đầu',
            'Đợi ChatGPT tạo nội dung hoàn chỉnh',
            'Có thể yêu cầu điều chỉnh bằng cách gửi thêm tin nhắn'
        ];
    }
}