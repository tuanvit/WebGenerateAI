import { BaseFormatter } from './BaseFormatter';

/**
 * Canva AI-specific prompt formatter
 * Optimizes prompts for Canva's AI writing and design tools
 */
export class CanvaAIFormatter extends BaseFormatter {
    constructor() {
        super('Canva AI', 'https://www.canva.com/magic-write/');
    }

    formatPrompt(prompt: string): string {
        const educationalPrompt = this.addEducationalContext(prompt);
        const instructions = this.getUsageInstructions();
        const instructionsFooter = this.addInstructionsFooter(instructions);

        return `${educationalPrompt}

---
TỐI ƯU HÓA CHO CANVA AI:
- Canva AI (Magic Write) phù hợp cho nội dung ngắn gọn và có cấu trúc
- Tích hợp trực tiếp với công cụ thiết kế Canva
- Hỗ trợ tạo nội dung cho slide, poster, infographic giáo dục
- Kết quả có thể được sử dụng ngay trong thiết kế Canva

LƯU Ý ĐẶC BIỆT:
- Nên chia nhỏ prompt thành các phần ngắn hơn nếu nội dung quá dài
- Tập trung vào nội dung cốt lõi, tránh quá chi tiết
- Phù hợp nhất cho việc tạo outline và bullet points

${instructionsFooter}`;
    }

    getUsageInstructions(): string[] {
        return [
            'Sao chép prompt này (có thể chia nhỏ nếu quá dài)',
            'Mở Canva và tạo design mới hoặc chọn template',
            'Tìm và nhấn vào "Magic Write" hoặc biểu tượng AI',
            'Dán prompt vào ô Magic Write',
            'Nhấn "Generate" để tạo nội dung',
            'Sử dụng kết quả trực tiếp trong thiết kế Canva'
        ];
    }
}