# Hướng Dẫn Deploy Lên Vercel

## ✅ Checklist Trước Khi Deploy

### 1. Build Thành Công
- [x] Project đã build thành công locally
- [x] Không có lỗi TypeScript hoặc ESLint
- [x] Tất cả API routes hoạt động

### 2. Cấu Hình Database
- Database: PostgreSQL (Railway)
- Connection String đã được cấu hình

### 3. Environment Variables Cần Thiết

## 🚀 Các Bước Deploy

### Bước 1: Chuẩn Bị Vercel Project

1. Đăng nhập vào [Vercel](https://vercel.com)
2. Click "Add New Project"
3. Import repository từ GitHub/GitLab/Bitbucket

### Bước 2: Cấu Hình Environment Variables

Trong Vercel Dashboard > Settings > Environment Variables, thêm các biến sau:

```bash
# Database (REQUIRED)
DATABASE_URL=postgresql://postgres:VhEyvgbjSrEjmmxLAVLhdbozyszYxgVy@shinkansen.proxy.rlwy.net:20695/railway

# NextAuth (REQUIRED)
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=bea0399a846df56c70733597f41c4848e4aa84cfc23c65dc3fff2b2917a17878

# Google OAuth (REQUIRED)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Application Settings
NODE_ENV=production
LOG_LEVEL=info
```

**⚠️ LƯU Ý QUAN TRỌNG:**
- Thay `your-app-name` trong `NEXTAUTH_URL` bằng tên domain thực tế của bạn
- Sau khi deploy, cập nhật lại `NEXTAUTH_URL` với URL chính xác
- Cập nhật Google OAuth Authorized redirect URIs với URL mới

### Bước 3: Cấu Hình Google OAuth

1. Truy cập [Google Cloud Console](https://console.cloud.google.com)
2. Vào project OAuth của bạn
3. Credentials > OAuth 2.0 Client IDs
4. Thêm Authorized redirect URIs:
   ```
   https://your-app-name.vercel.app/api/auth/callback/google
   ```

### Bước 4: Deploy

1. Trong Vercel, click "Deploy"
2. Vercel sẽ tự động:
   - Install dependencies
   - Run `prisma generate`
   - Run `next build`
   - Deploy application

### Bước 5: Chạy Database Migrations

Sau khi deploy thành công, chạy migrations:

```bash
# Option 1: Từ local machine
DATABASE_URL="your-production-db-url" npx prisma migrate deploy

# Option 2: Sử dụng Vercel CLI
vercel env pull .env.production
npx prisma migrate deploy
```

### Bước 6: Kiểm Tra Health Check

Truy cập: `https://your-app-name.vercel.app/api/health`

Response mong đợi:
```json
{
  "status": "ok",
  "timestamp": "2024-10-24T...",
  "database": "connected",
  "version": "0.1.0"
}
```

## 🔧 Cấu Hình Đã Có

### vercel.json
- ✅ Security headers đã được cấu hình
- ✅ API timeout: 30 giây
- ✅ Health check endpoint: `/health`
- ✅ Cache control cho API routes

### next.config.ts
- ✅ Standalone output cho production
- ✅ Prisma external packages
- ✅ Image domains cho Google profile
- ✅ Build optimizations

### package.json
- ✅ Build scripts đã sẵn sàng
- ✅ Database migration scripts
- ✅ All dependencies up to date

## 📊 Monitoring & Debugging

### Xem Logs
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# View logs
vercel logs
```

### Common Issues

#### 1. Database Connection Error
- Kiểm tra `DATABASE_URL` có đúng không
- Đảm bảo database cho phép connections từ Vercel IPs
- Railway database mặc định cho phép public access

#### 2. NextAuth Error
- Kiểm tra `NEXTAUTH_URL` khớp với domain
- Kiểm tra `NEXTAUTH_SECRET` đã được set
- Kiểm tra Google OAuth redirect URIs

#### 3. Build Error
- Xem build logs trong Vercel dashboard
- Kiểm tra TypeScript errors
- Đảm bảo tất cả dependencies trong package.json

## 🎯 Post-Deployment Tasks

1. **Test Authentication**
   - Đăng nhập với Google
   - Kiểm tra session persistence

2. **Test Core Features**
   - Tạo prompt mới
   - Lưu vào library
   - Share content
   - Rating system

3. **Performance Check**
   - Kiểm tra page load times
   - Monitor API response times
   - Check database query performance

4. **Security Check**
   - Verify security headers
   - Test authentication flows
   - Check API authorization

## 📝 Maintenance

### Update Environment Variables
```bash
vercel env add VARIABLE_NAME
vercel env rm VARIABLE_NAME
```

### Redeploy
```bash
# Trigger new deployment
git push origin main

# Or manual redeploy
vercel --prod
```

### Database Migrations
```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Deploy to production
DATABASE_URL="production-url" npx prisma migrate deploy
```

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Railway Dashboard](https://railway.app/dashboard)
- [Google Cloud Console](https://console.cloud.google.com)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)

## ✨ Optimization Tips

1. **Enable Edge Caching**
   - Đã cấu hình trong vercel.json
   - Static pages được cache tự động

2. **Database Connection Pooling**
   - Railway PostgreSQL hỗ trợ connection pooling
   - Prisma tự động quản lý connections

3. **Image Optimization**
   - Next.js Image component tự động optimize
   - Google profile images được cache

4. **API Performance**
   - Timeout: 30s cho API routes
   - Consider adding Redis cache cho production

---

**Status**: ✅ Sẵn sàng deploy lên Vercel
**Last Updated**: 2024-10-24
