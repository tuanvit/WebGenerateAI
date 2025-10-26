# Cải Tiến Giao Diện Động Theo Loại Đầu Ra

## Tổng Quan
Đã cải thiện trải nghiệm người dùng trong trang tạo prompt bằng cách thay đổi động các thành phần giao diện theo loại đầu ra được chọn.

## Các Thay Đổi Chính

### 1. Cấu Hình Loại Đầu Ra (Output Type Configuration)

Đã thêm object `outputTypeConfig` trong `src/app/create-prompt/page.tsx` để quản lý cấu hình cho từng loại đầu ra:

```typescript
const outputTypeConfig = {
    'lesson-plan': {
        label: 'Kế hoạch bài dạy',
        icon: '📚',
        buttonText: 'Tạo Prompt Kế Hoạch Bài Dạy',
        recommendedTools: ['chatgpt', 'gemini', 'copilot'],
        description: 'Tạo kế hoạch bài dạy chi tiết tuân thủ GDPT 2018'
    },
    'presentation': {
        label: 'Bài thuyết trình',
        icon: '📊',
        buttonText: 'Tạo Prompt Thuyết Trình',
        recommendedTools: ['gamma', 'canva', 'chatgpt'],
        description: 'Tạo bài thuyết trình hấp dẫn và chuyên nghiệp'
    },
    'assessment': {
        label: 'Đánh giá/Kiểm tra',
        icon: '📝',
        buttonText: 'Tạo Prompt Đánh Giá',
        recommendedTools: ['chatgpt', 'gemini', 'copilot'],
        description: 'Tạo câu hỏi và bài kiểm tra theo Bloom\'s Taxonomy'
    },
    'interactive': {
        label: 'Hoạt động tương tác',
        icon: '🎮',
        buttonText: 'Tạo Prompt Hoạt Động',
        recommendedTools: ['canva', 'gamma', 'chatgpt'],
        description: 'Tạo hoạt động học tập tương tác và sáng tạo'
    },
    'research': {
        label: 'Nghiên cứu',
        icon: '🔬',
        buttonText: 'Tạo Prompt Nghiên Cứu',
        recommendedTools: ['chatgpt', 'gemini', 'copilot'],
        description: 'Tạo đề cương và hướng dẫn nghiên cứu'
    }
};
```

### 2. Thay Đổi Text Nút Tạo Prompt

**Trước:**
- Nút luôn hiển thị: "📚 Tạo Prompt Giáo Trình"

**Sau:**
- Nút thay đổi theo loại đầu ra:
  - Kế hoạch bài dạy: "📚 Tạo Prompt Kế Hoạch Bài Dạy"
  - Thuyết trình: "📊 Tạo Prompt Thuyết Trình"
  - Đánh giá: "📝 Tạo Prompt Đánh Giá"
  - Hoạt động tương tác: "🎮 Tạo Prompt Hoạt Động"
  - Nghiên cứu: "🔬 Tạo Prompt Nghiên Cứu"

### 3. Thay Đổi Công Cụ AI Đề Xuất

**Trước:**
- Luôn hiển thị: "📚 Công cụ AI đề xuất cho tạo giáo trình"
- Không có mô tả
- Không ưu tiên công cụ theo loại đầu ra

**Sau:**
- Tiêu đề thay đổi theo loại đầu ra với icon phù hợp
- Thêm mô tả ngắn gọn về mục đích
- Ưu tiên hiển thị công cụ phù hợp nhất:
  - **Kế hoạch bài dạy**: ChatGPT, Gemini, Copilot
  - **Thuyết trình**: Gamma, Canva, ChatGPT
  - **Đánh giá**: ChatGPT, Gemini, Copilot
  - **Hoạt động tương tác**: Canva, Gamma, ChatGPT
  - **Nghiên cứu**: ChatGPT, Gemini, Copilot

### 4. Cập Nhật AIToolSelector Component

Đã thêm prop `recommendedTools` vào component `AIToolSelector`:

```typescript
interface AIToolSelectorProps {
    subject: string;
    gradeLevel: 6 | 7 | 8 | 9;
    outputType: string;
    onToolSelect: (tool: AITool) => void;
    selectedTool?: AITool | null;
    recommendedTools?: string[]; // NEW: Array of tool IDs or names to prioritize
}
```

Logic sắp xếp công cụ AI:
1. **Ưu tiên cao nhất**: Công cụ trong danh sách `recommendedTools`
2. **Ưu tiên thứ hai**: Công cụ hỗ trợ tiếng Việt
3. **Còn lại**: Các công cụ khác

### 5. Cải Thiện Nhãn và Placeholder

Tất cả các nhãn và placeholder đều thay đổi động theo loại đầu ra:

- **Tiêu đề card**: "Thông tin kế hoạch bài dạy" → "Thông tin [loại đầu ra]"
- **Chủ đề**: "Chủ đề kế hoạch bài dạy" → "Chủ đề [loại đầu ra]"
- **Mục tiêu**: "Mục tiêu bài học" → "Mục tiêu [loại đầu ra]"
- **Placeholder**: Thay đổi ví dụ phù hợp với từng loại

## Lợi Ích

### 1. Trải Nghiệm Người Dùng Tốt Hơn
- Giao diện phản hồi ngay lập tức khi người dùng thay đổi loại đầu ra
- Người dùng hiểu rõ hơn về chức năng đang sử dụng
- Giảm nhầm lẫn về loại nội dung sẽ được tạo

### 2. Công Cụ AI Phù Hợp Hơn
- Đề xuất công cụ tối ưu cho từng loại đầu ra
- Ví dụ: Gamma và Canva được ưu tiên cho thuyết trình
- ChatGPT và Gemini được ưu tiên cho kế hoạch bài dạy và đánh giá

### 3. Tính Nhất Quán
- Tất cả các thành phần UI đều đồng bộ với loại đầu ra
- Icon, màu sắc, và ngôn ngữ nhất quán trong toàn bộ trang

### 4. Dễ Mở Rộng
- Dễ dàng thêm loại đầu ra mới bằng cách cập nhật `outputTypeConfig`
- Không cần thay đổi nhiều nơi trong code

## Cách Sử Dụng

1. Người dùng chọn loại đầu ra từ dropdown
2. Giao diện tự động cập nhật:
   - Icon và tiêu đề card
   - Text nút tạo prompt
   - Nhãn và placeholder các trường input
   - Công cụ AI được đề xuất
3. Người dùng điền thông tin và tạo prompt với trải nghiệm phù hợp

## Files Đã Thay Đổi

1. **src/app/create-prompt/page.tsx**
   - Thêm `outputTypeConfig` object
   - Thêm `currentConfig` variable
   - Cập nhật tất cả các thành phần UI để sử dụng `currentConfig`

2. **src/components/ai-tools/AIToolSelector.tsx**
   - Thêm prop `recommendedTools`
   - Cập nhật logic sắp xếp công cụ AI
   - Thêm dependency `recommendedTools` vào useEffect

## Kiểm Tra

✅ Không có lỗi TypeScript
✅ Tất cả các loại đầu ra đều có cấu hình đầy đủ
✅ Logic ưu tiên công cụ AI hoạt động chính xác
✅ Giao diện cập nhật mượt mà khi thay đổi loại đầu ra

## Ghi Chú Kỹ Thuật

- Sử dụng computed property `currentConfig` để tránh lặp lại code
- Fallback về 'lesson-plan' nếu loại đầu ra không tồn tại
- Hỗ trợ đầy đủ TypeScript với type safety
- Tương thích ngược với code hiện tại
