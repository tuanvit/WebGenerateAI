# 🎓 AI Prompt Generator for Teachers

Ứng dụng web hỗ trợ giáo viên Việt Nam tạo prompt AI chuyên nghiệp cho việc giảng dạy, tuân thủ chương trình GDPT 2018 và Thông tư 5512.

## 🚀 Tính năng chính

- **Tạo prompt AI thông minh**: Chuyển đổi yêu cầu giáo học thành prompt tối ưu
- **Hỗ trợ đa công cụ AI**: ChatGPT, Gemini, Copilot, Canva AI, Gamma App
- **Thư viện cộng đồng**: Chia sẻ và đánh giá nội dung giáo dục
- **Quản lý cá nhân**: Lưu trữ và phiên bản hóa prompt
- **Hệ thống Admin**: Quản lý templates, AI tools, và người dùng
- **Tuân thủ chuẩn**: GDPT 2018 và Thông tư 5512

## 📋 Yêu cầu hệ thống

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0 hoặc **yarn**: >= 1.22.0
- **Git**: Để clone repository

## 🛠️ Hướng dẫn cài đặt

### Bước 1: Clone repository

```bash
git clone https://github.com/tuanvit/WebGenerateAI.git
cd WebGenerateAI
```

### Bước 2: Cài đặt dependencies

```bash
npm install
# hoặc
yarn install
```

### Bước 3: Cấu hình môi trường

1. **Copy file cấu hình:**
```bash
cp .env.example .env
```

2. **Cập nhật file `.env`:**
```env
# Database Configuration
DATABASE_URL="file:./dev.db"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Google OAuth (Tùy chọn)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Application Settings
NODE_ENV="development"
```

3. **Tạo NEXTAUTH_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Bước 4: Thiết lập database

```bash
# Tạo và migrate database
npx prisma db push

# Seed dữ liệu mẫu
npm run seed
```

### Bước 5: Khởi động ứng dụng

```bash
npm run dev
# hoặc
yarn dev
```

Ứng dụng sẽ chạy tại: **http://localhost:3000**

## 🔐 Đăng nhập và sử dụng

### Đăng nhập nhanh (Demo)
- Truy cập: http://localhost:3000/auth/simple
- **Admin**: `admin@example.com` / `Admin User`
- **Giáo viên**: `giaovien@demo.com` / `Cô Nguyễn Thị Lan`

### Đăng nhập Google OAuth
1. Tạo Google OAuth credentials tại [Google Cloud Console](https://console.cloud.google.com/)
2. Cập nhật `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` trong `.env`
3. Truy cập: http://localhost:3000/auth/signin

## 📁 Cấu trúc dự án

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Trang quản trị
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   └── templates/         # Template management
│   ├── components/            # React components
│   │   ├── admin/             # Admin components
│   │   ├── templates/         # Template components
│   │   └── ui/                # UI components
│   ├── lib/                   # Utilities và configurations
│   │   ├── admin/             # Admin logic
│   │   └── auth.ts            # NextAuth configuration
│   └── types/                 # TypeScript type definitions
├── prisma/                    # Database schema và migrations
├── docs/                      # Documentation
├── scripts/                   # Utility scripts
└── e2e/                       # End-to-end tests
```

## 🎯 Sử dụng cơ bản

### 1. Tạo prompt AI
1. Truy cập trang chủ
2. Chọn môn học và lớp
3. Nhập yêu cầu giáo học
4. Chọn công cụ AI đích
5. Nhận prompt được tối ưu

### 2. Quản lý Admin (chỉ Admin)
- **Dashboard**: http://localhost:3000/admin/dashboard
- **AI Tools**: http://localhost:3000/admin/ai-tools
- **Templates**: http://localhost:3000/admin/templates
- **Settings**: http://localhost:3000/admin/settings

### 3. Thư viện Templates
- **Duyệt templates**: http://localhost:3000/templates
- **Chi tiết template**: http://localhost:3000/templates/[id]

## 🧪 Testing

### Unit Tests
```bash
npm test
# hoặc
npm run test:watch
```

### End-to-End Tests
```bash
npm run test:e2e
```

### Integration Tests
```bash
npm run test:integration
```

## 📊 Scripts hữu ích

```bash
# Development
npm run dev              # Khởi động dev server
npm run build           # Build production
npm run start           # Khởi động production server

# Database
npm run db:push         # Push schema changes
npm run db:studio       # Mở Prisma Studio
npm run seed            # Seed dữ liệu mẫu

# Testing
npm test               # Unit tests
npm run test:e2e       # E2E tests
npm run lint           # ESLint
npm run format         # Prettier

# Admin utilities
npm run migrate:templates    # Migrate templates
npm run migrate:ai-tools    # Migrate AI tools
```

## 🔧 Cấu hình Google OAuth (Tùy chọn)

1. **Tạo project tại Google Cloud Console**
2. **Bật Google+ API**
3. **Tạo OAuth 2.0 credentials:**
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
4. **Cập nhật `.env`:**
```env
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

## 🐛 Troubleshooting

### Lỗi thường gặp

**1. Database connection error:**
```bash
npx prisma db push
npx prisma generate
```

**2. NextAuth session error:**
```bash
# Xóa session cũ
curl -X POST http://localhost:3000/api/debug/clear-session
```

**3. Google OAuth error:**
- Kiểm tra GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET
- Đảm bảo redirect URI đúng

### Debug endpoints
- **Check sessions**: http://localhost:3000/api/debug/check-sessions
- **Database info**: http://localhost:3000/api/debug/database
- **User info**: http://localhost:3000/debug/users

## 📚 Documentation

- **Admin Guide**: [docs/admin-user-guide.md](docs/admin-user-guide.md)
- **Troubleshooting**: [docs/admin-troubleshooting.md](docs/admin-troubleshooting.md)
- **FAQ**: [docs/admin-faq.md](docs/admin-faq.md)

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Tạo Pull Request

## 📄 License

Dự án này được phân phối dưới MIT License. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 👥 Tác giả

- **Nguyễn Tuấn Việt** - *Initial work* - [tuanvit](https://github.com/tuanvit)

## 🙏 Acknowledgments

- Chương trình Giáo dục phổ thông 2018 (GDPT 2018)
- Thông tư 5512 về đánh giá học sinh
- Cộng đồng giáo viên Việt Nam

---

**📞 Hỗ trợ**: Nếu gặp vấn đề, vui lòng tạo [Issue](https://github.com/tuanvit/WebGenerateAI/issues) hoặc liên hệ qua email.

**🌟 Nếu dự án hữu ích, hãy cho một star để ủng hộ!**