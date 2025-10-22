# Deployment Guide - AI Prompt Generator for Teachers

## Overview

This guide covers deployment options for the AI Prompt Generator application, including Vercel, Docker, and manual deployment configurations.

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Environment variables configured
- SSL certificates (for production)

## Environment Configuration

### Required Environment Variables

Copy `.env.production.example` to `.env.production` and configure:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:5432/ai_prompt_generator?sslmode=require"

# Authentication
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-32-character-secret"

# OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Optional: Redis for caching
REDIS_URL="redis://your-redis-host:6379"
```

## Deployment Options

### 1. Vercel Deployment (Recommended)

#### Quick Deploy
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Manual Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Database Setup for Vercel
```bash
# Run migrations on production database
npm run deploy:migrate
```

### 2. Docker Deployment

#### Development
```bash
# Start with development compose
docker-compose up -d
```

#### Production
```bash
# Start with production compose
npm run docker:prod

# Or manually
docker-compose -f docker-compose.prod.yml up -d
```

#### Manual Docker Build
```bash
# Build image
docker build -t ai-prompt-generator .

# Run with environment file
docker run -d \
  --name ai-prompt-generator \
  --env-file .env.production \
  -p 3000:3000 \
  ai-prompt-generator
```

### 3. Manual Server Deployment

#### Prerequisites
- Ubuntu/Debian server
- Node.js 18+
- PostgreSQL
- Nginx (optional, for reverse proxy)

#### Steps
```bash
# 1. Clone repository
git clone <your-repo-url>
cd ai-prompt-generator

# 2. Install dependencies
npm ci --only=production

# 3. Configure environment
cp .env.production.example .env.production
# Edit .env.production with your values

# 4. Setup database
npm run deploy:migrate

# 5. Build application
npm run build

# 6. Start application
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start npm --name "ai-prompt-generator" -- start
pm2 save
pm2 startup
```

## Database Migration

### Production Migration
```bash
# Run production migrations
npm run deploy:migrate

# Or manually
npx prisma migrate deploy
```

### Backup Before Migration
```bash
# Create backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore if needed
psql $DATABASE_URL < backup-YYYYMMDD.sql
```

## SSL Configuration

### Nginx SSL Setup
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Docker SSL
Place SSL certificates in `nginx/ssl/`:
- `cert.pem` - SSL certificate
- `key.pem` - Private key

## Health Checks

The application includes health check endpoints:

```bash
# Check application health
curl https://your-domain.com/api/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "0.1.0",
  "environment": "production",
  "database": "connected"
}
```

## Performance Optimization

### Database Optimization
- Connection pooling configured
- Indexes on frequently queried fields
- Query optimization for large datasets

### Caching
- Redis integration for session storage
- Static asset caching via CDN
- API response caching for read-heavy operations

### Monitoring
- Health check endpoints
- Error logging and tracking
- Performance metrics collection

## Security Considerations

### Environment Security
- Never commit `.env` files
- Use strong, unique secrets
- Enable SSL/TLS in production
- Configure CORS properly

### Database Security
- Use connection pooling
- Enable SSL for database connections
- Regular security updates
- Backup encryption

## Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check database connectivity
npx prisma db pull

# Verify environment variables
echo $DATABASE_URL
```

#### Build Failures
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in cert.pem -text -noout

# Verify nginx configuration
nginx -t
```

### Logs and Debugging

#### Docker Logs
```bash
# View application logs
docker-compose logs app

# Follow logs
docker-compose logs -f app
```

#### PM2 Logs
```bash
# View logs
pm2 logs ai-prompt-generator

# Monitor
pm2 monit
```

## Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Session store externalization (Redis)
- Database read replicas
- CDN for static assets

### Vertical Scaling
- Memory optimization
- CPU usage monitoring
- Database connection limits
- Cache hit ratios

## Backup and Recovery

### Database Backup
```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backups/backup_$DATE.sql
```

### Application Backup
- Code repository (Git)
- Environment configuration
- SSL certificates
- User-uploaded content

## Support and Maintenance

### Regular Maintenance
- Security updates
- Dependency updates
- Database maintenance
- Log rotation
- Certificate renewal

### Monitoring Checklist
- [ ] Application health checks
- [ ] Database performance
- [ ] SSL certificate expiry
- [ ] Disk space usage
- [ ] Memory and CPU usage
- [ ] Error rates and logs