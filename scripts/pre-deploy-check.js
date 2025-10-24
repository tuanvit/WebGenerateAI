#!/usr/bin/env node

/**
 * Pre-Deployment Check Script
 * Kiểm tra các điều kiện cần thiết trước khi deploy lên Vercel
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking deployment readiness...\n');

let hasErrors = false;
let hasWarnings = false;

// Check 1: Required files exist
console.log('📁 Checking required files...');
const requiredFiles = [
  'package.json',
  'next.config.ts',
  'vercel.json',
  'prisma/schema.prisma',
  '.env.example',
  'VERCEL_DEPLOYMENT.md'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    hasErrors = true;
  }
});

// Check 2: Environment variables template
console.log('\n🔐 Checking environment variables template...');
const envExample = fs.readFileSync('.env.example', 'utf8');
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

requiredEnvVars.forEach(envVar => {
  if (envExample.includes(envVar)) {
    console.log(`  ✅ ${envVar}`);
  } else {
    console.log(`  ❌ ${envVar} - MISSING`);
    hasErrors = true;
  }
});

// Check 3: Package.json scripts
console.log('\n📦 Checking package.json scripts...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredScripts = ['build', 'start', 'db:generate', 'db:migrate:prod'];

requiredScripts.forEach(script => {
  if (packageJson.scripts[script]) {
    console.log(`  ✅ ${script}`);
  } else {
    console.log(`  ⚠️  ${script} - MISSING`);
    hasWarnings = true;
  }
});

// Check 4: Vercel configuration
console.log('\n⚙️  Checking vercel.json...');
const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

if (vercelConfig.functions) {
  console.log('  ✅ API functions timeout configured');
} else {
  console.log('  ⚠️  API functions timeout not configured');
  hasWarnings = true;
}

if (vercelConfig.headers) {
  console.log('  ✅ Security headers configured');
} else {
  console.log('  ⚠️  Security headers not configured');
  hasWarnings = true;
}

// Check 5: Next.js configuration
console.log('\n⚡ Checking next.config.ts...');
const nextConfig = fs.readFileSync('next.config.ts', 'utf8');

if (nextConfig.includes('serverExternalPackages')) {
  console.log('  ✅ Prisma external packages configured');
} else {
  console.log('  ⚠️  Prisma external packages not configured');
  hasWarnings = true;
}

// Check 6: Prisma schema
console.log('\n🗄️  Checking Prisma schema...');
const prismaSchema = fs.readFileSync('prisma/schema.prisma', 'utf8');

if (prismaSchema.includes('provider = "postgresql"')) {
  console.log('  ✅ PostgreSQL configured');
} else {
  console.log('  ⚠️  Database provider might not be PostgreSQL');
  hasWarnings = true;
}

// Check 7: Build directory
console.log('\n🏗️  Checking build artifacts...');
if (fs.existsSync('.next')) {
  console.log('  ✅ .next directory exists (previous build found)');
} else {
  console.log('  ⚠️  No previous build found - run "npm run build" first');
  hasWarnings = true;
}

// Check 8: Git status
console.log('\n📝 Checking Git status...');
if (fs.existsSync('.git')) {
  console.log('  ✅ Git repository initialized');
} else {
  console.log('  ⚠️  Not a Git repository');
  hasWarnings = true;
}

// Check 9: Node modules
console.log('\n📚 Checking dependencies...');
if (fs.existsSync('node_modules')) {
  console.log('  ✅ Dependencies installed');
} else {
  console.log('  ❌ Dependencies not installed - run "npm install"');
  hasErrors = true;
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 DEPLOYMENT READINESS SUMMARY');
console.log('='.repeat(50));

if (hasErrors) {
  console.log('\n❌ DEPLOYMENT BLOCKED - Fix errors above');
  process.exit(1);
} else if (hasWarnings) {
  console.log('\n⚠️  DEPLOYMENT READY WITH WARNINGS');
  console.log('Review warnings above before deploying');
  process.exit(0);
} else {
  console.log('\n✅ ALL CHECKS PASSED - READY TO DEPLOY!');
  console.log('\nNext steps:');
  console.log('1. Run "npm run build" to verify build');
  console.log('2. Push to Git repository');
  console.log('3. Import to Vercel');
  console.log('4. Configure environment variables');
  console.log('5. Deploy!');
  console.log('\nSee VERCEL_DEPLOYMENT.md for detailed instructions.');
  process.exit(0);
}
