# 🚀 Deployment Guide

Hướng dẫn deploy AI Prompt Generator for Teachers lên production.

## 🌐 Deployment Options

### 1. Vercel (Recommended)
### 2. Docker
### 3. Traditional Server

---

## 🔥 Vercel Deployment

### Bước 1: Chuẩn bị
```bash
npm install -g vercel
```

### Bước 2: Cấu hình Database
**Option A: PostgreSQL (Recommended)**
```env
DATABASE_URL="postgresql://username:password@host:5432/database?schema=public"
```

**Option B: PlanetScale**
```env
DATABASE_URL="mysql://username:password@host/database?sslaccept=strict"
```

### Bước 3: Environment Variables
Tại Vercel Dashboard, thêm:
```env
DATABASE_URL=your-production-database-url
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-production-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NODE_ENV=production
```

### Bước 4: Deploy
```bash
vercel --prod
```

### Bước 5: Database Migration
```bash
npx prisma db push
npx prisma db seed
```

---

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/ai_prompt_generator
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=your-secret
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=ai_prompt_generator
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Deploy với Docker
```bash
docker-compose up -d
docker-compose exec app npx prisma db push
docker-compose exec app npm run seed
```

---

## 🖥️ Traditional Server Deployment

### Bước 1: Server Setup (Ubuntu)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib
```

### Bước 2: Database Setup
```bash
sudo -u postgres psql
CREATE DATABASE ai_prompt_generator;
CREATE USER your_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ai_prompt_generator TO your_user;
\q
```

### Bước 3: Application Setup
```bash
# Clone repository
git clone https://github.com/tuanvit/WebGenerateAI.git
cd WebGenerateAI

# Install dependencies
npm ci --only=production

# Build application
npm run build

# Setup environment
cp .env.example .env
# Edit .env with production values

# Database migration
npx prisma db push
npm run seed
```

### Bước 4: PM2 Configuration
**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'ai-prompt-generator',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/WebGenerateAI',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

### Bước 5: Start Application
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Bước 6: Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔒 Security Checklist

### Environment Variables
- [ ] `NEXTAUTH_SECRET` - Unique production secret
- [ ] `DATABASE_URL` - Secure database connection
- [ ] `GOOGLE_CLIENT_ID/SECRET` - Production OAuth credentials

### Database Security
- [ ] Strong database password
- [ ] Database firewall rules
- [ ] Regular backups
- [ ] SSL/TLS encryption

### Application Security
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Input validation enabled

### Monitoring
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Database monitoring
- [ ] Uptime monitoring

---

## 📊 Performance Optimization

### Database
```bash
# Database indexing
npx prisma db push
```

### Caching
```env
# Redis for session storage
REDIS_URL=redis://localhost:6379
```

### CDN
- Static assets via CDN
- Image optimization
- Gzip compression

---

## 🔄 CI/CD Pipeline

### GitHub Actions
**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build application
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🚨 Troubleshooting

### Common Issues

**Build Errors:**
```bash
npm run build -- --debug
```

**Database Connection:**
```bash
npx prisma db push --accept-data-loss
```

**Memory Issues:**
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Health Checks
- **Application**: `GET /api/health`
- **Database**: `GET /api/admin/system/database`
- **Performance**: `GET /api/admin/system/performance`

---

## 📈 Monitoring & Maintenance

### Log Management
```bash
# PM2 logs
pm2 logs ai-prompt-generator

# Application logs
tail -f logs/application.log
```

### Database Maintenance
```bash
# Backup
pg_dump ai_prompt_generator > backup.sql

# Restore
psql ai_prompt_generator < backup.sql
```

### Updates
```bash
git pull origin main
npm ci --only=production
npm run build
pm2 restart ai-prompt-generator
```

---

**🎉 Deployment thành công!**

Kiểm tra ứng dụng tại domain của bạn và đảm bảo tất cả tính năng hoạt động bình thường.