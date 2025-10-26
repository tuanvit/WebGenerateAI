# ⚡ Cập Nhật Database Nhanh

## Cách nhanh nhất (3 bước)

### 1️⃣ Backup Database
```bash
# PostgreSQL
pg_dump -U your_username -d your_database > backup.sql
```

### 2️⃣ Chạy Migration
```bash
node scripts/simple-db-update.js
```

### 3️⃣ Re-seed AI Tools
```bash
node scripts/reseed-ai-tools.js
```

### ✅ Xong! Kiểm tra
```bash
npm run dev
```

---

## Hoặc chạy tất cả một lần

```bash
node scripts/full-migration.js
```

Script này sẽ hỏi bạn từng bước và tự động thực hiện.

---

## Kết quả mong đợi

✅ Tất cả "giáo án" → "kế hoạch bài dạy"
✅ UI hiển thị đúng
✅ Database đã cập nhật
✅ AI tools có dữ liệu mới

---

## Nếu có lỗi

### Lỗi kết nối database:
```bash
# Kiểm tra .env
cat .env | grep DATABASE_URL

# Kiểm tra database đang chạy
# PostgreSQL: pg_isready
```

### Lỗi Prisma:
```bash
npx prisma generate
```

### Rollback:
```bash
psql -U your_username -d your_database < backup.sql
```

---

## Chi tiết đầy đủ

Xem file: `HUONG_DAN_CAP_NHAT_DATABASE.md`
