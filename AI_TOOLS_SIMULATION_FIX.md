# Fix AI Tools Recommendation cho Mô phỏng

## Vấn đề
Khi chọn loại prompt "Mô phỏng", hệ thống gợi ý sai AI tools:
- Hiển thị: Google Gemini, ChatGPT, Canva AI (tools tạo văn bản/thuyết trình)
- Mong muốn: PhET, Labster, Tinkercad, CoSpaces Edu, Chemix AI (tools mô phỏng)

## Nguyên nhân
Mismatch giữa enum values và string mapping:
- **Enum definition**: `SIMULATION = 'simulation'` (lowercase)
- **Mapping function**: Trả về `'SIMULATION'` (uppercase)
- **API filtering**: Không tìm thấy tools vì case mismatch

## Giải pháp

### 1. Sửa mapping function trong AIToolSelector
```typescript
// TRƯỚC (sai)
const categoryMapping: Record<string, string> = {
    'simulation': 'SIMULATION',  // ❌ Uppercase
    // ...
};

// SAU (đúng)  
const categoryMapping: Record<string, string> = {
    'simulation': 'simulation',  // ✅ Lowercase
    // ...
};
```

### 2. Cải thiện API route type safety
```typescript
// Thêm explicit type conversion
const categoryEnum = category as AIToolCategory;
tools = getToolsByCategory(categoryEnum);
```

## Kết quả sau fix

### Khi chọn "Mô phỏng" sẽ gợi ý:
1. **PhET Interactive Simulations** 🔬
   - Mô phỏng tương tác Vật lý, Hóa học, Sinh học
   - Miễn phí, hỗ trợ tiếng Việt
   - Phù hợp lớp 6-9

2. **Labster** 🧪
   - Phòng thí nghiệm ảo 3D
   - Thí nghiệm an toàn, chi tiết
   - Phù hợp Khoa học tự nhiên

3. **Tinkercad** ⚡
   - Thiết kế 3D và mô phỏng mạch điện
   - Miễn phí, dễ sử dụng
   - Phù hợp Công nghệ, KHTN

### Tools khác trong category Simulation:
- **CoSpaces Edu** - Thế giới ảo 3D
- **Chemix AI** - Vẽ công thức hóa học
- **Google Earth** - Khám phá địa lí 3D
- **MakeCode** - Lập trình kéo thả
- **Scratch** - Lập trình trực quan
- **GeoGebra** - Toán học động
- **Desmos** - Máy tính đồ thị

## Files đã sửa
- `src/components/ai-tools/AIToolSelector.tsx` - Fix category mapping
- `src/app/api/ai-tools/route.ts` - Improve type safety

## Test kết quả
```bash
curl "http://localhost:3000/api/ai-tools?category=simulation&limit=3"
# ✅ Trả về: PhET, Labster, Tinkercad
```

## Tác động
- ✅ Gợi ý AI tools chính xác cho từng loại prompt
- ✅ Cải thiện trải nghiệm người dùng
- ✅ Tăng tính hữu ích của hệ thống recommendation
- ✅ Đảm bảo consistency giữa UI và backend

Bây giờ khi giáo viên chọn "Mô phỏng", họ sẽ nhận được gợi ý đúng các công cụ mô phỏng thay vì tools tạo văn bản!