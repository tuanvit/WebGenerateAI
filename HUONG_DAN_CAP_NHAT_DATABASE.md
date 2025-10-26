# 📚 Hướng Dẫn Cập Nhật Database

## Tổng quan
Hướng dẫn này sẽ giúp bạn cập nhật database để thay đổi tất cả từ "giáo án" thành "kế hoạch bài dạy".

## ⚠️ QUAN TRỌNG: Backup Database Trước

```bash
# Nếu dùng PostgreSQL
pg_dump -U your_username -d your_database > backup_$(date +%Y%m%d_%H%M%S).sql

# Hoặc dùng pgAdmin để export database
```

## Phương án 1: Cập nhật SQL + Re-seed AI Tools (Khuyến nghị)

### Bước 1: Chạy SQL Migration
```bash
node scripts/simple-db-update.js
```

Script này sẽ:
- ✅ Cập nhật tất cả bảng trong database
- ✅ Thay thế "giáo án" → "kế hoạch bài dạy"
- ✅ Kiểm tra kết quả tự động

### Bước 2: Re-seed AI Tools
```bash
node scripts/reseed-ai-tools.js
```

Script này sẽ:
- ✅ Xóa AI tools cũ
- ✅ Tạo lại với dữ liệu mới
- ✅ Kiểm tra dữ liệu mới

### Bước 3: Kiểm tra
```bash
npm run dev
```

Truy cập các trang:
- http://localhost:3000 - Trang chủ
- http://localhost:3000/create-prompt - Tạo prompt
- http://localhost:3000/templates - Danh sách templates
- http://localhost:3000/admin/ai-tools - Quản lý AI tools (nếu có quyền admin)

## Phương án 2: Re-seed Toàn Bộ Database

### Bước 1: Xóa dữ liệu cũ (Cẩn thận!)
```bash
# Chỉ làm nếu bạn muốn reset toàn bộ database
npx prisma migrate reset
```

### Bước 2: Chạy seed mới
```bash
npm run seed
```

### Bước 3: Kiểm tra
```bash
npm run dev
```

## Phương án 3: Cập nhật thủ công qua SQL

### Kết nối database và chạy:

```sql
-- 1. Cập nhật templates
UPDATE templates 
SET name = REPLACE(name, 'giáo án', 'kế hoạch bài dạy'),
    description = REPLACE(description, 'giáo án', 'kế hoạch bài dạy'),
    "templateContent" = REPLACE("templateContent", 'giáo án', 'kế hoạch bài dạy');

UPDATE templates 
SET name = REPLACE(name, 'Giáo án', 'Kế hoạch bài dạy'),
    description = REPLACE(description, 'Giáo án', 'Kế hoạch bài dạy'),
    "templateContent" = REPLACE("templateContent", 'Giáo án', 'Kế hoạch bài dạy');

-- 2. Cập nhật ai_tools
UPDATE ai_tools 
SET description = REPLACE(description, 'giáo án', 'kế hoạch bài dạy'),
    "useCase" = REPLACE("useCase", 'giáo án', 'kế hoạch bài dạy'),
    features = REPLACE(features, 'giáo án', 'kế hoạch bài dạy');

UPDATE ai_tools 
SET description = REPLACE(description, 'Giáo án', 'Kế hoạch bài dạy'),
    "useCase" = REPLACE("useCase", 'Giáo án', 'Kế hoạch bài dạy'),
    features = REPLACE(features, 'Giáo án', 'Kế hoạch bài dạy');

-- 3. Cập nhật shared_content
UPDATE shared_content 
SET title = REPLACE(title, 'giáo án', 'kế hoạch bài dạy'),
    description = REPLACE(description, 'giáo án', 'kế hoạch bài dạy'),
    content = REPLACE(content, 'giáo án', 'kế hoạch bài dạy');

UPDATE shared_content 
SET title = REPLACE(title, 'Giáo án', 'Kế hoạch bài dạy'),
    description = REPLACE(description, 'Giáo án', 'Kế hoạch bài dạy'),
    content = REPLACE(content, 'Giáo án', 'Kế hoạch bài dạy');

-- 4. Kiểm tra kết quả
SELECT COUNT(*) as "Templates có kế hoạch bài dạy" 
FROM templates 
WHERE name LIKE '%kế hoạch bài dạy%' 
   OR description LIKE '%kế hoạch bài dạy%';

SELECT COUNT(*) as "AI Tools có kế hoạch bài dạy" 
FROM ai_tools 
WHERE description LIKE '%kế hoạch bài dạy%' 
   OR "useCase" LIKE '%kế hoạch bài dạy%';
```

## Kiểm tra sau khi cập nhật

### 1. Kiểm tra Database
```bash
# Kết nối database và chạy
SELECT COUNT(*) FROM templates WHERE name LIKE '%giáo án%';
SELECT COUNT(*) FROM ai_tools WHERE description LIKE '%giáo án%';
SELECT COUNT(*) FROM shared_content WHERE title LIKE '%giáo án%';

# Kết quả mong đợi: 0 hoặc rất ít
```

### 2. Kiểm tra UI
- [ ] Trang chủ hiển thị "kế hoạch bài dạy"
- [ ] Form tạo prompt có label "Kế hoạch bài dạy"
- [ ] Dropdown output type hiển thị "📚 Kế hoạch bài dạy"
- [ ] Templates list hiển thị đúng
- [ ] AI tools descriptions đã cập nhật

### 3. Kiểm tra chức năng
- [ ] Tạo prompt mới với output type "lesson-plan"
- [ ] Xem chi tiết template
- [ ] Sử dụng template để generate prompt
- [ ] Lưu vào library
- [ ] Chia sẻ lên community

## Xử lý lỗi

### Lỗi: "Cannot find module"
```bash
# Cài đặt dependencies
npm install
```

### Lỗi: "Database connection failed"
```bash
# Kiểm tra DATABASE_URL trong .env
# Đảm bảo database đang chạy
```

### Lỗi: "Prisma Client not generated"
```bash
npx prisma generate
```

### Lỗi: "Migration failed"
```bash
# Kiểm tra database có đang được sử dụng không
# Đóng tất cả connections
# Thử lại
```

## Rollback (Nếu cần)

### Nếu có backup:
```bash
# PostgreSQL
psql -U your_username -d your_database < backup_file.sql
```

### Nếu dùng Git:
```bash
# Revert code changes
git checkout HEAD~1 -- src/
git checkout HEAD~1 -- scripts/

# Re-seed database
npm run seed
```

## Scripts Có Sẵn

| Script | Mô tả | Khi nào dùng |
|--------|-------|--------------|
| `simple-db-update.js` | Chạy SQL migration | Cập nhật dữ liệu có sẵn |
| `reseed-ai-tools.js` | Re-seed AI tools | Sau khi update code |
| `update-db-giao-an.js` | Full update | Cập nhật toàn diện |
| `migrate-giao-an-to-ke-hoach.js` | Update code files | Đã chạy rồi |
| `migrate-docs-giao-an.js` | Update docs | Đã chạy rồi |

## Câu hỏi thường gặp

### Q: Có mất dữ liệu không?
A: Không, chỉ thay đổi text. Nhưng nên backup để đảm bảo.

### Q: Mất bao lâu?
A: 1-2 phút cho SQL migration, 30 giây cho re-seed AI tools.

### Q: Có cần downtime không?
A: Nên tắt app trong lúc update để tránh conflict.

### Q: Làm sao biết đã thành công?
A: Chạy script sẽ hiển thị kết quả. Kiểm tra UI để chắc chắn.

### Q: Nếu có lỗi thì sao?
A: Restore từ backup và liên hệ để được hỗ trợ.

## Liên hệ hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra logs trong console
2. Xem file backup
3. Đọc error message cẩn thận
4. Thử rollback nếu cần

---

**Lưu ý cuối cùng**: Luôn backup trước khi thực hiện bất kỳ thay đổi nào với database!
