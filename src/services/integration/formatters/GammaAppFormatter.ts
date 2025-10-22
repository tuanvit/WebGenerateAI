import { BaseFormatter } from './BaseFormatter';

/**
 * Gamma App-specific prompt formatter
 * Optimizes prompts for Gamma's AI presentation creation tool
 */
export class GammaAppFormatter extends BaseFormatter {
    constructor() {
        super('Gamma App', 'https://gamma.app/');
    }

    formatPrompt(prompt: string): string {
        const educationalPrompt = this.addEducationalContext(prompt);
        const instructions = this.getUsageInstructions();
        const instructionsFooter = this.addInstructionsFooter(instructions);

        return `${educationalPrompt}

---
TỐI ƯU HÓA CHO GAMMA APP:
- Gamma App chuyên tạo presentation và document từ AI
- Hỗ trợ tạo slide tự động với layout chuyên nghiệp
- Phù hợp nhất cho việc tạo bài thuyết trình giáo dục
- Có thể tạo cả nội dung và thiết kế visual cùng lúc

ĐỊNH DẠNG TỐI ƯU:
- Nên cung cấp cấu trúc rõ ràng (đầu - thân - kết)
- Chỉ định số lượng slide cụ thể
- Mô tả loại nội dung cho từng slide
- Đề xuất hình ảnh hoặc biểu đồ nếu cần

${instructionsFooter}`;
    }

    getUsageInstructions(): string[] {
        return [
            'Sao chép toàn bộ prompt này',
            'Mở Gamma App và đăng nhập',
            'Chọn "Create with AI" hoặc "New presentation"',
            'Dán prompt vào ô mô tả nội dung',
            'Chọn template và style phù hợp',
            'Nhấn "Generate" để tạo presentation hoàn chỉnh'
        ];
    }
}