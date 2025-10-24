# Hướng Dẫn Cài Đặt Hệ Thống Xác Thực Mới

## Bước 1: Cài Đặt Dependencies

```bash
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```

## Bước 2: Cập Nhật Database Schema

Database schema đã được cập nhật trong file `prisma/schema.prisma`. Chạy migration:

```bash
# Tạo và áp dụng migration
npx prisma migrate dev --name add_authentication_fields

# Hoặc push schema trực tiếp (cho development)
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

## Bước 3: Cấu Hình Environment Variables

Cập nhật file `.env` (copy từ `.env.example`):

```bash
cp .env.example .env
```

Sau đó chỉnh sửa `.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ai_prompt_generator"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate-strong-secret>"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

### Tạo NEXTAUTH_SECRET:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Bước 4: Tạo Admin User Đầu Tiên

### Option A: Qua Script

Tạo file `scripts/create-admin.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'admin@yourschool.edu.vn';
  const password = 'AdminPassword123'; // Đổi thành mật khẩu mạnh
  const name = 'Admin User';

  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: 'admin',
      subjects: JSON.stringify(['Toán', 'Văn', 'Anh']),
      gradeLevel: JSON.stringify([6, 7, 8, 9]),
    },
  });

  console.log('Admin user created:', admin.email);
}

createAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Chạy script:

```bash
npx tsx scripts/create-admin.ts
```

### Option B: Qua Prisma Studio

```bash
npx prisma studio
```

1. Mở model `User`
2. Click "Add record"
3. Điền thông tin:
   - email: admin@yourschool.edu.vn
   - name: Admin User
   - password: (hash password trước - xem bên dưới)
   - role: admin
   - subjects: ["Toán", "Văn"]
   - gradeLevel: [6, 7, 8, 9]

Để hash password:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourPassword123', 12).then(console.log)"
```

### Option C: Đăng Ký Qua UI Rồi Nâng Cấp

1. Chạy app: `npm run dev`
2. Truy cập: http://localhost:3000/auth/register
3. Đăng ký tài khoản
4. Cập nhật role trong database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

## Bước 5: Khởi Động Ứng Dụng

```bash
npm run dev
```

Truy cập: http://localhost:3000

## Bước 6: Test Authentication

### Test Đăng Ký
1. Truy cập: http://localhost:3000/auth/register
2. Điền thông tin:
   - Email: test@example.com
   - Password: TestPassword123
   - Name: Test User
3. Click "Đăng ký"

### Test Đăng Nhập
1. Truy cập: http://localhost:3000/auth/signin
2. Đăng nhập với:
   - Email/Password
   - Hoặc Google OAuth

### Test Đổi Mật Khẩu
1. Đăng nhập
2. Truy cập profile settings
3. Chọn "Đổi mật khẩu"
4. Nhập mật khẩu cũ và mới

## Bước 7: Xóa Dữ Liệu Test Cũ (Nếu Có)

Nếu bạn có dữ liệu test từ hệ thống cũ:

```sql
-- Xóa users demo cũ
DELETE FROM users WHERE email LIKE '%demo.com';
DELETE FROM users WHERE email = 'admin@example.com';

-- Xóa sessions cũ
DELETE FROM sessions;

-- Xóa accounts không liên kết
DELETE FROM accounts WHERE "userId" NOT IN (SELECT id FROM users);
```

## Troubleshooting

### Lỗi: "Module not found: bcryptjs"
```bash
npm install bcryptjs @types/bcryptjs
```

### Lỗi: "Prisma Client not generated"
```bash
npx prisma generate
```

### Lỗi: "Database connection failed"
- Kiểm tra DATABASE_URL trong .env
- Đảm bảo PostgreSQL đang chạy
- Test connection: `npx prisma db pull`

### Lỗi: "NEXTAUTH_SECRET is not set"
- Tạo secret mới: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Thêm vào .env: `NEXTAUTH_SECRET="<your-secret>"`

### Không thể đăng nhập
1. Xóa cookies browser
2. Kiểm tra logs: `npm run dev`
3. Kiểm tra database: `npx prisma studio`
4. Verify password hash

## Production Deployment

### 1. Environment Variables

Đảm bảo set các biến môi trường trong production:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="<strong-production-secret>"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
NODE_ENV="production"
```

### 2. Database Migration

```bash
npx prisma migrate deploy
```

### 3. Build và Deploy

```bash
npm run build
npm run start
```

### 4. Security Checklist

- [ ] NEXTAUTH_SECRET là unique và strong
- [ ] DATABASE_URL không bị expose
- [ ] HTTPS enabled
- [ ] Secure cookies enabled
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Admin accounts limited
- [ ] Regular security updates

## Monitoring

### Check Authentication Health

```bash
curl http://localhost:3000/api/health
```

### View Logs

```bash
# Development
npm run dev

# Production
pm2 logs ai-prompt-generator
```

### Database Monitoring

```bash
npx prisma studio
```

## Backup và Recovery

### Backup Database

```bash
pg_dump -U username -d ai_prompt_generator > backup.sql
```

### Restore Database

```bash
psql -U username -d ai_prompt_generator < backup.sql
```

## Support

Nếu gặp vấn đề:
1. Kiểm tra logs
2. Xem AUTHENTICATION_UPGRADE.md
3. Kiểm tra NextAuth.js documentation
4. Tạo issue trên GitHub

---

**Quan trọng:** Hệ thống mới không còn hỗ trợ demo accounts. Tất cả users phải đăng ký tài khoản thật với email và mật khẩu mạnh.
/