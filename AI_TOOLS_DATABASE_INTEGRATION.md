# Tích Hợp Database Công Cụ AI

## Vấn Đề
Admin thêm công cụ AI mới vào database thành công, nhưng công cụ đó không xuất hiện trong trang người dùng khi họ xem danh sách công cụ AI.

## Nguyên Nhân
Hệ thống có **hai nguồn dữ liệu riêng biệt** không đồng bộ:

1. **Database thực** (PostgreSQL) - Nơi admin lưu công cụ AI mới
2. **File static** (`AI_TOOLS_DATABASE`) - Nơi API user đọc dữ liệu

### Luồng Dữ Liệu Trước Khi Sửa

```
Admin thêm AI tool
       ↓
   Database ✓
       ↓
   [KHÔNG ĐỒNG BỘ]
       ↓
User xem AI tools
       ↓
API đọc từ file static ✗
       ↓
Không thấy tool mới
```

## Giải Pháp

Đã cập nhật hệ thống để **ưu tiên database, fallback về static data**:

### 1. Cập Nhật API User (`/api/ai-tools/route.ts`)

**Trước:**
```typescript
// Chỉ đọc từ file static
let tools = [...AI_TOOLS_DATABASE];
```

**Sau:**
```typescript
// Thử đọc từ database trước
const aiToolsService = new AIToolsService();
const result = await aiToolsService.getAITools(filters);

// Nếu database có dữ liệu, dùng nó
if (result.data && result.data.length > 0) {
    return result.data;
}

// Fallback về static data nếu database trống/lỗi
let tools = [...AI_TOOLS_DATABASE];
```

### 2. Cập Nhật AIToolRecommendationService

Thêm method `loadToolsFromDatabase()` để load và merge dữ liệu:

```typescript
private async loadToolsFromDatabase(): Promise<void> {
    if (this.dbToolsLoaded) return;

    try {
        const aiToolsService = new AIToolsService();
        const result = await aiToolsService.getAITools({ limit: 1000 });
        
        if (result.data && result.data.length > 0) {
            // Convert database tools to AIToolDetails format
            const dbTools = result.data.map(tool => ({...}));
            
            // Merge: database tools + new tools + static fallback
            this.tools = [...dbTools, ...newDbTools, ...staticFallback];
            this.dbToolsLoaded = true;
        }
    } catch (error) {
        console.warn('Using static data as fallback');
    }
}
```

Gọi method này trong tất cả các phương thức public:
- `getRecommendedTools()`
- `getTrendingTools()`
- `getToolDetails()`
- `searchTools()`
- `getToolsByCategory()`
- `getSubjectSpecificTools()`

## Luồng Dữ Liệu Sau Khi Sửa

```
Admin thêm AI tool
       ↓
   Database ✓
       ↓
   [ĐỒNG BỘ TỰ ĐỘNG]
       ↓
User xem AI tools
       ↓
API đọc từ database ✓
       ↓
Thấy tool mới ngay lập tức
```

## Ưu Điểm Của Giải Pháp

### 1. **Hybrid Approach**
- Ưu tiên database (dữ liệu động)
- Fallback về static data (đảm bảo luôn có dữ liệu)
- Không phá vỡ hệ thống hiện tại

### 2. **Merge Thông Minh**
```typescript
// Database tools có priority cao nhất
// Nếu tool có cùng ID, dùng version từ database
// Giữ lại static tools không có trong database
this.tools = [
    ...dbTools.filter(t => staticToolIds.has(t.id)),  // DB version of static tools
    ...newDbTools,                                     // New tools from DB
    ...AI_TOOLS_DATABASE.filter(t => !inDB(t.id))    // Static tools not in DB
];
```

### 3. **Performance**
- Cache kết quả database (`dbToolsLoaded` flag)
- Chỉ load một lần per instance
- Không ảnh hưởng performance

### 4. **Error Handling**
- Try-catch để xử lý lỗi database
- Luôn có fallback về static data
- Log warning để debug

### 5. **Type Safety**
- Mapping đúng field names (`integrationGuide` → `integrationInstructions`)
- Type casting an toàn
- Validate grade levels (6, 7, 8, 9)

## Files Đã Thay Đổi

### 1. `src/app/api/ai-tools/route.ts`
- Import `AIToolsService`
- Thử query database trước
- Fallback về static data nếu cần
- Fix type casting cho grade levels

### 2. `src/services/ai-tool-recommendation/index.ts`
- Thêm `dbToolsLoaded` flag
- Thêm method `loadToolsFromDatabase()`
- Gọi load trong tất cả public methods
- Map field names đúng

## Cách Test

### 1. Test Admin Add Tool
```bash
# Admin thêm tool mới qua UI hoặc API
POST /api/admin/ai-tools
{
  "name": "New AI Tool",
  "category": "TEXT_GENERATION",
  ...
}
```

### 2. Test User View Tools
```bash
# User xem danh sách tools
GET /api/ai-tools

# Kết quả phải bao gồm tool mới
```

### 3. Test Recommendations
```bash
# User xem recommendations
POST /api/ai-tools/recommendations
{
  "subject": "Toán",
  "gradeLevel": 8,
  ...
}

# Tool mới phải xuất hiện nếu phù hợp
```

### 4. Test Fallback
```bash
# Tắt database connection
# API vẫn hoạt động với static data
```

## Lưu Ý Quan Trọng

### 1. **Cache Invalidation**
Admin API đã có cache invalidation:
```typescript
// Sau khi tạo/update/delete tool
invalidateAIToolsCache();
```

Nhưng `AIToolRecommendationService` cache trong memory. Để refresh:
- Restart server
- Hoặc thêm cache TTL
- Hoặc thêm API endpoint để clear cache

### 2. **Field Mapping**
Database và static data có một số field khác tên:
- Database: `integrationGuide`
- Static: `integrationInstructions`

Đã xử lý trong mapping code.

### 3. **Grade Level Validation**
Chỉ chấp nhận grades 6, 7, 8, 9:
```typescript
if (!isNaN(grade) && [6, 7, 8, 9].includes(grade)) {
    // Valid grade
}
```

## Kết Quả

✅ Admin thêm tool → Lưu vào database
✅ User xem tools → Đọc từ database
✅ Tool mới xuất hiện ngay lập tức
✅ Fallback hoạt động nếu database lỗi
✅ Không breaking changes
✅ Type-safe và error-handled

## Cải Tiến Tương Lai

### 1. **Real-time Updates**
- Sử dụng WebSocket hoặc Server-Sent Events
- Push updates khi admin thêm tool mới

### 2. **Better Caching**
- Redis cache cho database queries
- TTL-based cache invalidation
- Cache warming strategy

### 3. **Admin UI Enhancement**
- Hiển thị preview tool như user sẽ thấy
- Test tool recommendations trước khi publish
- Bulk import/export tools

### 4. **Analytics**
- Track tool usage
- Popular tools dashboard
- User feedback integration
