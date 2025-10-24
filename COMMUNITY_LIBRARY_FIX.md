# Sửa lỗi hiển thị Community Library

## Vấn đề
- Dữ liệu đã được lưu vào database thành công
- API `/api/community/content` trả về dữ liệu đúng
- Nhưng giao diện không hiển thị các prompt đã chia sẻ

## Nguyên nhân
1. **Import sai module**: Các file API đang import `prisma` từ `@/lib/db-utils` thay vì `@/lib/db`
   - File `db-utils.ts` chỉ chứa utility functions, không export `prisma`
   - File `db.ts` mới là file export `prisma` client

2. **Thiếu email trong response**: API không trả về `email` của author, khiến việc so sánh quyền xóa không hoạt động đúng

## Các thay đổi đã thực hiện

### 1. Sửa import prisma trong các file API
Đã sửa các file sau từ `@/lib/db-utils` sang `@/lib/db`:
- `src/app/api/community/content/route.ts`
- `src/app/api/community/content/[id]/update/route.ts`
- `src/app/api/community/content/[id]/rating/route.ts`
- `src/app/api/community/content/[id]/delete/route.ts`
- `src/app/api/library/my-shared/route.ts`

**Giải pháp tốt hơn**: Thêm re-export `prisma` trong `src/lib/db-utils.ts` để tương thích ngược:
```typescript
export { prisma } from './db';
```

### 2. Thêm email vào API response
Trong `src/app/api/community/content/route.ts`:
- Thêm `email: true` vào author select
- Thêm `email: item.author?.email || ''` vào processed content

## Kiểm tra

### Test API
```powershell
# Kiểm tra API trả về dữ liệu
curl http://localhost:3000/api/community/content

# Kiểm tra với limit
curl http://localhost:3000/api/community/content?limit=2
```

### Kết quả mong đợi
API trả về:
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "...",
      "description": "...",
      "content": "...",
      "subject": "...",
      "gradeLevel": 7,
      "tags": [...],
      "rating": 4.5,
      "ratingCount": 12,
      "author": {
        "name": "...",
        "email": "...",
        "school": "..."
      },
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 9,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

## Hướng dẫn test trên giao diện

1. **Xóa cache browser**:
   - Mở DevTools (F12)
   - Vào tab Network
   - Tick "Disable cache"
   - Hard refresh (Ctrl+Shift+R hoặc Cmd+Shift+R)

2. **Kiểm tra trang Community Library**:
   - Truy cập: http://localhost:3000/library/community
   - Đăng nhập nếu chưa đăng nhập
   - Kiểm tra xem có hiển thị danh sách prompt không

3. **Kiểm tra Console**:
   - Mở DevTools Console
   - Xem các log: "API Response:", "Content data:", "Processed content:"
   - Kiểm tra có lỗi nào không

4. **Kiểm tra Network**:
   - Vào tab Network
   - Tìm request `/api/community/content`
   - Xem response có dữ liệu không

## Các tính năng đã hoạt động

✅ Chia sẻ prompt lên cộng đồng
✅ Lưu dữ liệu vào database
✅ API trả về dữ liệu đúng format
✅ Hiển thị danh sách prompt (sau khi sửa)
✅ Filter theo môn học, khối lớp
✅ Tìm kiếm prompt
✅ Xem chi tiết prompt
✅ Đánh giá prompt
✅ Lưu vào thư viện cá nhân
✅ Xóa prompt của mình

## Lưu ý

- Nếu vẫn không thấy dữ liệu, hãy:
  1. Restart Next.js dev server
  2. Xóa cache browser
  3. Kiểm tra console log
  4. Kiểm tra network request

- Component `CommunityLibraryBrowser` có 3 trạng thái hiển thị:
  1. Loading state (khi đang tải)
  2. Empty state (khi không có dữ liệu)
  3. Grid/List view (khi có dữ liệu)

- Đảm bảo đã đăng nhập để xem đầy đủ tính năng
