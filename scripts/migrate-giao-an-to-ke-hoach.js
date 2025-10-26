#!/usr/bin/env node
/**
 * Migration script: Replace "giáo án" with "kế hoạch bài dạy"
 * Run: node scripts/migrate-giao-an-to-ke-hoach.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Define replacement patterns (order matters - more specific first)
const replacements = [
    { old: 'Template soạn giáo án', new: 'Template soạn kế hoạch bài dạy' },
    { old: 'Template tạo giáo án', new: 'Template tạo kế hoạch bài dạy' },
    { old: 'Prompt Giáo Án', new: 'Prompt Kế Hoạch Bài Dạy' },
    { old: 'Tạo Giáo Án', new: 'Tạo Kế Hoạch Bài Dạy' },
    { old: 'Tạo Prompt Giáo Án', new: 'Tạo Prompt Kế Hoạch Bài Dạy' },
    { old: 'Thông tin giáo án', new: 'Thông tin kế hoạch bài dạy' },
    { old: 'Chủ đề giáo án', new: 'Chủ đề kế hoạch bài dạy' },
    { old: 'Định dạng giáo án', new: 'Định dạng kế hoạch bài dạy' },
    { old: 'CẤU TRÚC GIÁO ÁN', new: 'CẤU TRÚC KẾ HOẠCH BÀI DẠY' },
    { old: 'mẫu giáo án', new: 'mẫu kế hoạch bài dạy' },
    { old: 'Soạn giáo án', new: 'Soạn kế hoạch bài dạy' },
    { old: 'soạn giáo án', new: 'soạn kế hoạch bài dạy' },
    { old: 'Tạo giáo án', new: 'Tạo kế hoạch bài dạy' },
    { old: 'tạo giáo án', new: 'tạo kế hoạch bài dạy' },
    { old: 'GIÁO ÁN', new: 'KẾ HOẠCH BÀI DẠY' },
    { old: 'Giáo án', new: 'Kế hoạch bài dạy' },
    { old: 'giáo án', new: 'kế hoạch bài dạy' }
];

// File patterns to process
const filePatterns = [
    'src/**/*.ts',
    'src/**/*.tsx',
    'src/**/*.js',
    'src/**/*.jsx'
];

// Counters
let filesChanged = 0;
let totalReplacements = 0;

console.log('🚀 Starting migration: giáo án -> kế hoạch bài dạy\n');

// Process each file pattern
filePatterns.forEach(pattern => {
    const files = glob.sync(pattern, { nodir: true });
    
    files.forEach(filePath => {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            const originalContent = content;
            let fileReplacements = 0;
            
            // Apply all replacements
            replacements.forEach(({ old, new: newValue }) => {
                const regex = new RegExp(escapeRegExp(old), 'g');
                const matches = (content.match(regex) || []).length;
                if (matches > 0) {
                    content = content.replace(regex, newValue);
                    fileReplacements += matches;
                }
            });
            
            // Save if content changed
            if (content !== originalContent) {
                fs.writeFileSync(filePath, content, 'utf8');
                filesChanged++;
                totalReplacements += fileReplacements;
                console.log(`✅ Updated: ${filePath} (${fileReplacements} replacements)`);
            }
        } catch (error) {
            console.error(`❌ Error processing ${filePath}:`, error.message);
        }
    });
});

console.log('\n✨ Migration completed!');
console.log(`📁 Files changed: ${filesChanged}`);
console.log(`🔄 Total replacements: ${totalReplacements}`);

console.log('\n📋 Next steps:');
console.log('1. Run database migration SQL script');
console.log('2. Update seed data if needed');
console.log('3. Test the application: npm run dev');

// Helper function to escape special regex characters
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
