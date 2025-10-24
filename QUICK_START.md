# ⚡ Quick Start Guide

Hướng dẫn khởi động nhanh dự án AI Prompt Generator for Teachers trong 5 phút.

## 🚀 Cài đặt nhanh

### 1. Clone và cài đặt
```bash
git clone https://github.com/tuanvit/WebGenerateAI.git
cd WebGenerateAI
npm install
```

### 2. Cấu hình môi trường
```bash
cp .env.example .env
```

**Cập nhật file `.env`:**
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="bea0399a846df56c70733597f41c4848e4aa84cfc23c65dc3fff2b2917a17878"
NODE_ENV="development"
```

### 3. Thiết lập database
```bash
npx prisma db push
npm run seed
```

### 4. Khởi động
```bash
npm run dev
```

## 🎯 Truy cập ứng dụng

- **Trang chủ**: http://localhost:3000
- **Đăng nhập nhanh**: http://localhost:3000/auth/simple
- **Admin Dashboard**: http://localhost:3000/admin/dashboard

## 👤 Tài khoản demo

### Admin
- **Email**: `admin@example.com`
- **Tên**: `Admin User`
- **Quyền**: Toàn quyền quản trị

### Giáo viên
- **Email**: `giaovien@demo.com`
- **Tên**: `Cô Nguyễn Thị Lan`
- **Quyền**: Sử dụng tính năng tạo prompt

## 🔧 Lệnh hữu ích

```bash
# Khởi động development
npm run dev

# Xem database
npx prisma studio

# Chạy tests
npm test

# Build production
npm run build
npm run start
```

## ❓ Gặp lỗi?

**Database error:**
```bash
npx prisma db push
npx prisma generate
```

**Session error:**
```bash
curl -X POST http://localhost:3000/api/debug/clear-session
```

**Port 3000 đã sử dụng:**
```bash
# Thay đổi port trong package.json
"dev": "next dev -p 3001"
```

## 📱 Tính năng chính

1. **Tạo prompt AI** - Chuyển đổi yêu cầu giáo học thành prompt tối ưu
2. **Quản lý templates** - Thư viện mẫu cho các môn học
3. **AI Tools** - Tích hợp với ChatGPT, Gemini, Copilot
4. **Admin System** - Quản lý người dùng và nội dung
5. **Community** - Chia sẻ và đánh giá nội dung

## 🎓 Sử dụng cơ bản

1. Đăng nhập tại `/auth/simple`
2. Chọn tài khoản demo
3. Truy cập trang chủ
4. Chọn môn học và lớp
5. Nhập yêu cầu giáo học
6. Nhận prompt được tối ưu

---

**🚀 Chúc bạn sử dụng thành công!**

Xem [README.md](README.md) để biết hướng dẫn chi tiết.