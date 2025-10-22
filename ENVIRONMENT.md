# 🔧 Environment Configuration Guide

## Quick Setup (Recommended)

### 1. Copy Environment Template
```bash
cp .env.example .env
```

### 2. Generate Secret Key
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Update .env File
Replace `your-32-character-secret-key-here` with the generated key.

## File Structure

```
├── .env.example     # Template file (committed to git)
├── .env            # Your actual config (NOT committed)
└── ENVIRONMENT.md  # This guide
```

## Environment Variables Explained

### 🗄️ Database
```bash
# Development (SQLite - Easy setup)
DATABASE_URL="file:./dev.db"

# Production (PostgreSQL - Recommended)
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
```

### 🔐 Authentication
```bash
# Your app URL
NEXTAUTH_URL="http://localhost:3001"

# Secret key for JWT tokens (REQUIRED)
NEXTAUTH_SECRET="your-generated-secret-key"
```

### 🌐 Google OAuth (Optional)
```bash
# Get from: https://console.cloud.google.com/
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Different Environments

### 🏠 Development
- Use SQLite database (simple)
- Use localhost URLs
- Enable debug logging

### 🚀 Production
- Use PostgreSQL database
- Use production URLs
- Secure secrets
- Enable caching (Redis)

## Security Best Practices

### ✅ DO:
- Keep `.env` file private
- Use strong, unique secrets
- Rotate secrets regularly
- Use different secrets for different environments

### ❌ DON'T:
- Commit `.env` to git
- Share secrets in chat/email
- Use default/weak secrets
- Reuse secrets across projects

## Troubleshooting

### Common Issues:

**1. "NEXTAUTH_SECRET is required"**
```bash
# Generate a new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**2. "Database connection failed"**
```bash
# For SQLite (development)
DATABASE_URL="file:./dev.db"

# For PostgreSQL (production)
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
```

**3. "Google OAuth 400 error"**
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- Verify redirect URIs in Google Cloud Console
- Ensure NEXTAUTH_URL matches your domain

## Quick Commands

```bash
# Copy template
cp .env.example .env

# Generate secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Check environment
npm run dev

# Reset database (SQLite)
rm dev.db && npx prisma db push
```

## Need Help?

1. Check this guide first
2. Verify your `.env` file matches `.env.example` structure
3. Ensure all required variables are set
4. Try restarting the development server