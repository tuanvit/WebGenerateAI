# AI Prompt Generator for Teachers

Hệ thống thông minh tạo prompt AI cho giáo viên Việt Nam, tuân thủ GDPT 2018 và Công văn 5512.

## ✨ Tính năng chính

### 🎯 **Template System thông minh**
- 50+ template chuyên môn cho các môn học
- Intelligent recommendations với scoring algorithm
- Template cho Toán, Văn, Khoa học tự nhiên, Lịch sử & Địa lí, GDCD, Công nghệ

### 🤖 **AI Tool Integration**
- Tích hợp 50+ công cụ AI giáo dục
- Smart recommendations dựa trên môn học và lớp
- Direct integration với ChatGPT, Gemini, Canva AI, GeoGebra...

### 📚 **Prompt Generation**
- Tạo prompt cho giáo án, slide thuyết trình, câu hỏi đánh giá
- Tuân thủ chuẩn GDPT 2018 và Công văn 5512
- Hỗ trợ tiếng Việt hoàn toàn

### 👥 **Community Features**
- Personal library để lưu prompt
- Community sharing với rating system
- Template customization và versioning

## 🚀 Công nghệ sử dụng

- **Framework**: Next.js 15 với TypeScript
- **Database**: PostgreSQL với Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Deployment**: Vercel ready

## 📦 Cài đặt

```bash
# Clone repository
git clone <repository-url>
cd ai-prompt-generator

# Cài đặt dependencies
npm install

# Thiết lập environment variables
cp .env.example .env.local
# Cập nhật các biến môi trường trong .env.local

# Chạy database migrations
npx prisma migrate dev

# Khởi động development server
npm run dev
```

## 🌐 Truy cập

- **Development**: http://localhost:3000
- **Main features**: 
  - Tạo prompt: `/create-prompt`
  - Dashboard: `/dashboard`
  - AI Tools: `/ai-tools`

## 📋 Tính năng đã hoàn thành

### ✅ **Core System**
- [x] Authentication & User Management
- [x] Prompt Generation Engine
- [x] Template System với Intelligent Selection
- [x] AI Tool Recommendations
- [x] Personal Library Management
- [x] Community Sharing System

### ✅ **UI/UX**
- [x] Responsive Design
- [x] Vietnamese Interface
- [x] Modern UI với Tailwind CSS
- [x] Template Selection với Scoring
- [x] AI Tool Browser với Categories

### ✅ **Technical**
- [x] TypeScript cho type safety
- [x] API Routes với validation
- [x] Database schema với relationships
- [x] Error handling và logging
- [x] Performance optimization

## 🎓 Dành cho giáo viên

Hệ thống được thiết kế đặc biệt cho giáo viên Việt Nam:
- **Tuân thủ chuẩn**: GDPT 2018, Công văn 5512
- **Môn học**: Lớp 6-9 (THCS)
- **Ngôn ngữ**: Hoàn toàn tiếng Việt
- **Phương pháp**: Dạy học tích cực, phát triển năng lực

## 🤝 Đóng góp

Chúng tôi hoan nghênh mọi đóng góp để cải thiện hệ thống:
1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.

## 📞 Liên hệ

- **Email**: [your-email@example.com]
- **GitHub**: [your-github-username]

---

**Phát triển bởi**: Nhóm nghiên cứu AI trong Giáo dục
**Phiên bản**: 1.0.0
**Cập nhật**: Tháng 10, 2025