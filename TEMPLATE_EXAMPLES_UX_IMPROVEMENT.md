# Template Examples UX Improvement

## Problem Solved

**Before**: Người dùng phải nhập JSON thủ công trong textarea, rất khó hiểu và dễ gây lỗi:
```json
{"bien1": "gia_tri1", "bien2": "gia_tri2"}
```

**After**: Form động dựa trên các biến đã định nghĩa, dễ sử dụng và trực quan.

## New Features

### 1. Dynamic Form Generation
- Tự động tạo form inputs dựa trên variables đã định nghĩa
- Hỗ trợ tất cả loại input: text, textarea, select, multiselect
- Hiển thị label, description, placeholder từ variable definition
- Đánh dấu required fields với dấu sao đỏ

### 2. Smart Input Types
- **Text**: Input field đơn giản
- **Textarea**: Multi-line input với rows=2
- **Select**: Dropdown với options từ variable definition
- **Multiselect**: Checkbox group cho multiple selection

### 3. JSON Preview
- Hiển thị JSON structure được tạo tự động
- Real-time update khi user thay đổi input
- Giúp user hiểu cấu trúc dữ liệu

### 4. Auto-Generate Expected Output
- Nút "Tự động tạo" để generate kết quả mong đợi
- Thay thế variables trong template content với sample values
- Xử lý array values (multiselect) bằng cách join với dấu phẩy

### 5. Better Initialization
- Tự động khởi tạo sampleInput với default values từ variables
- Multiselect fields được khởi tạo với empty array
- Text fields được khởi tạo với defaultValue hoặc empty string

## Implementation Details

### Form Structure
```typescript
// For each variable in formData.variables
{variable.type === 'text' && (
    <Input
        value={example.sampleInput[variable.name] || ''}
        onChange={(e) => updateSampleInput(variable.name, e.target.value)}
        placeholder={variable.placeholder}
    />
)}

{variable.type === 'select' && (
    <Select
        value={example.sampleInput[variable.name] || ''}
        onValueChange={(value) => updateSampleInput(variable.name, value)}
    >
        {variable.options?.map(option => (
            <SelectItem key={option} value={option}>{option}</SelectItem>
        ))}
    </Select>
)}

{variable.type === 'multiselect' && (
    <CheckboxGroup
        options={variable.options}
        values={example.sampleInput[variable.name] || []}
        onChange={(values) => updateSampleInput(variable.name, values)}
    />
)}
```

### Auto-Generate Logic
```typescript
const generateExpectedOutput = () => {
    let result = formData.templateContent;
    Object.entries(example.sampleInput).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        const displayValue = Array.isArray(value) ? value.join(', ') : value;
        result = result.replace(regex, displayValue || `[${key}]`);
    });
    updateExample(index, 'expectedOutput', result);
};
```

## User Experience Improvements

### Before (JSON Input)
```
❌ Khó hiểu: {"lessonName": "Phương trình", "grade": "8"}
❌ Dễ lỗi syntax: {"lessonName": "Phương trình", "grade": 8,}
❌ Không validation: Có thể nhập sai tên biến
❌ Không gợi ý: Không biết biến nào available
```

### After (Dynamic Form)
```
✅ Trực quan: Form fields với labels rõ ràng
✅ Validation: Required fields được đánh dấu
✅ Type-safe: Select/multiselect với options có sẵn
✅ Auto-complete: Placeholder và description hướng dẫn
✅ Preview: JSON structure hiển thị real-time
✅ Auto-generate: Tự động tạo expected output
```

## Workflow Example

### 1. Define Variables (Tab "Biến")
```
Variable 1:
- Name: chu_de
- Label: Chủ đề bài học
- Type: text
- Required: true
- Placeholder: VD: Phương trình bậc nhất

Variable 2:
- Name: lop
- Label: Lớp học
- Type: select
- Options: ["6", "7", "8", "9"]
- Required: true

Variable 3:
- Name: phuong_phap
- Label: Phương pháp dạy học
- Type: multiselect
- Options: ["Thảo luận nhóm", "Thực hành", "Giảng giải"]
```

### 2. Create Example (Tab "Ví dụ")
```
Example Form sẽ hiển thị:

[Chủ đề bài học *]
[Input field] → "Phương trình bậc nhất một ẩn"

[Lớp học *]
[Dropdown] → "8"

[Phương pháp dạy học]
☑ Thảo luận nhóm
☑ Thực hành
☐ Giảng giải

JSON Preview:
{
  "chu_de": "Phương trình bậc nhất một ẩn",
  "lop": "8",
  "phuong_phap": ["Thảo luận nhóm", "Thực hành"]
}

[Tự động tạo] → Generates expected output
```

## Error Prevention

### 1. Variable Dependency
- Nếu chưa có variables, hiển thị warning: "⚠️ Vui lòng tạo biến ở tab 'Biến' trước khi tạo ví dụ"
- Form chỉ hiển thị khi có ít nhất 1 variable

### 2. Required Field Validation
- Required variables được đánh dấu với dấu sao đỏ
- Form validation sẽ check required fields

### 3. Type Safety
- Select fields chỉ cho phép chọn từ options có sẵn
- Multiselect trả về array, không phải string
- Text/textarea luôn trả về string

## Benefits

1. **Reduced Learning Curve**: Không cần hiểu JSON syntax
2. **Error Prevention**: Type-safe inputs, validation
3. **Better Productivity**: Auto-generate features
4. **User-Friendly**: Intuitive form interface
5. **Maintainable**: Consistent với variable definitions

## Files Modified

- `src/components/admin/templates/TemplateForm.tsx`
  - Replaced JSON textarea with dynamic form
  - Added auto-generate expected output button
  - Improved example initialization logic
  - Added JSON preview for transparency

## Next Steps

1. **Add Validation**: Client-side validation for required fields
2. **Better Error Messages**: Specific error messages for each field type
3. **Import/Export**: Allow importing examples from JSON for advanced users
4. **Templates**: Pre-built example templates for common use cases