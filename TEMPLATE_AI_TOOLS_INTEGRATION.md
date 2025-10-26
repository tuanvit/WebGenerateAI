# Template AI Tools Integration - Implementation Guide

## Overview

Đã thêm thành công logic để khi chọn template mẫu ở trang `/create-prompt`, phần "Công cụ AI đề xuất" sẽ hiển thị các AI tools từ template đó thay vì logic đề xuất mặc định.

## How It Works

### 1. Template Selection Mode
- **Khi chọn template**: Hiển thị AI tools từ field `recommendedTools` của template
- **Khi tạo tự do**: Sử dụng logic đề xuất dựa trên subject, grade level, và output type như cũ

### 2. UI Changes
- **Header thay đổi**: "🎯 Công cụ AI từ template đã chọn" khi sử dụng template
- **Description thay đổi**: Hiển thị tên template được chọn
- **Tools hiển thị**: Chỉ hiển thị các AI tools được khuyến nghị trong template

## Implementation Details

### 1. AIToolSelector Component Updates

**New Props Added:**
```typescript
interface AIToolSelectorProps {
    // ... existing props
    templateRecommendedTools?: string[]; // AI tools from selected template
    useTemplateRecommendations?: boolean; // Whether to use template recommendations
}
```

**Logic Flow:**
1. Kiểm tra `useTemplateRecommendations` và `templateRecommendedTools`
2. Nếu có template recommendations, fetch AI tools theo tên từ database
3. Nếu không, sử dụng logic đề xuất mặc định

### 2. API Enhancement

**Updated `/api/ai-tools` endpoint:**
- Thêm parameter `name` để tìm kiếm AI tools theo tên
- Hỗ trợ case-insensitive search
- Trả về thông tin đầy đủ của AI tool (url, useCase, features, etc.)

### 3. Create Prompt Page Integration

**Template Integration:**
```typescript
<AIToolSelector
    // ... existing props
    templateRecommendedTools={selectedTemplate?.recommendedTools}
    useTemplateRecommendations={useTemplate && !!selectedTemplate}
/>
```

## Example Usage

### Template với AI Tools
```json
{
    "name": "Kế hoạch bài dạy Toán theo CV 5512",
    "subject": "Toán",
    "gradeLevel": [6, 7, 8, 9],
    "outputType": "lesson-plan",
    "recommendedTools": ["ChatGPT", "GeoGebra", "Canva AI"],
    // ... other fields
}
```

### User Experience
1. **Chọn template** → AI tools section hiển thị "🎯 Công cụ AI từ template đã chọn"
2. **Hiển thị tools**: ChatGPT, GeoGebra, Canva AI (từ template)
3. **Chuyển sang tự do** → AI tools section hiển thị đề xuất dựa trên subject/grade/output type

## Files Modified

### Core Components
- `src/components/ai-tools/AIToolSelector.tsx` - Added template recommendations logic
- `src/app/create-prompt/page.tsx` - Integrated template AI tools
- `src/app/api/ai-tools/route.ts` - Added name-based search

### Key Features Added
1. **Template-based AI tool recommendations**
2. **Dynamic UI based on selection mode**
3. **Fallback to default logic when no template**
4. **Name-based AI tool search API**

## Testing Results

✅ **AI Tools Search by Name**: Successfully finds tools like "ChatGPT", "Gemini", "Canva AI"
✅ **Multiple Tools Fetch**: Can fetch multiple tools simultaneously
✅ **Template Integration**: Template recommendedTools field works correctly
✅ **UI Updates**: Headers and descriptions change based on mode
✅ **Fallback Logic**: Default recommendations work when no template selected

## Usage Instructions

### For Users:
1. Truy cập http://localhost:3000/create-prompt
2. Chọn môn học, lớp, loại đầu ra
3. **Chế độ Template**: 
   - Chọn template → AI tools sẽ hiển thị từ template
   - Header: "🎯 Công cụ AI từ template đã chọn"
4. **Chế độ Tự do**:
   - Không chọn template → AI tools đề xuất theo logic cũ
   - Header: "Công cụ AI đề xuất cho kế hoạch bài dạy"

### For Developers:
- Template phải có field `recommendedTools: string[]`
- AI tool names trong template phải khớp với names trong database
- Component tự động fallback nếu không tìm thấy tools

## Benefits

1. **Personalized Recommendations**: Mỗi template có AI tools phù hợp riêng
2. **Better User Experience**: Users thấy rõ tools được khuyến nghị cho template cụ thể
3. **Flexible System**: Vẫn giữ logic đề xuất mặc định cho chế độ tự do
4. **Scalable**: Dễ dàng thêm AI tools mới và cập nhật recommendations

## Next Steps

1. **Template Management**: Ensure all templates have appropriate recommendedTools
2. **AI Tools Database**: Keep expanding with more specialized tools
3. **User Feedback**: Collect data on which AI tools are most effective
4. **Advanced Matching**: Consider AI tool compatibility with specific template types