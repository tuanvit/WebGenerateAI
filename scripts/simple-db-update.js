#!/usr/bin/env node
/**
 * Simple database update script
 * Runs SQL migration to replace "giáo án" with "kế hoạch bài dạy"
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Cập nhật database: giáo án → kế hoạch bài dạy\n');

    try {
        // Read SQL file
        const sqlPath = path.join(__dirname, '..', 'prisma', 'migrations', 'update_giao_an_to_ke_hoach_bai_day.sql');
        
        if (!fs.existsSync(sqlPath)) {
            console.error('❌ Không tìm thấy file SQL:', sqlPath);
            process.exit(1);
        }

        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        console.log('📄 Đã đọc file SQL migration\n');

        // Split into statements
        const statements = sqlContent
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`📝 Tìm thấy ${statements.length} câu lệnh SQL\n`);

        // Execute each statement
        let success = 0;
        let failed = 0;

        for (let i = 0; i < statements.length; i++) {
            try {
                console.log(`⏳ Đang thực thi câu lệnh ${i + 1}/${statements.length}...`);
                await prisma.$executeRawUnsafe(statements[i]);
                success++;
                console.log(`✅ Thành công`);
            } catch (error) {
                failed++;
                console.error(`❌ Lỗi:`, error.message);
            }
        }

        console.log(`\n📊 Kết quả:`);
        console.log(`✅ Thành công: ${success}`);
        console.log(`❌ Thất bại: ${failed}`);

        // Verify results
        console.log('\n🔍 Kiểm tra kết quả...\n');

        // Count records with new term
        const [templates, aiTools, sharedContent] = await Promise.all([
            prisma.template.count({
                where: {
                    OR: [
                        { name: { contains: 'kế hoạch bài dạy' } },
                        { description: { contains: 'kế hoạch bài dạy' } },
                        { templateContent: { contains: 'kế hoạch bài dạy' } }
                    ]
                }
            }),
            prisma.aITool.count({
                where: {
                    OR: [
                        { description: { contains: 'kế hoạch bài dạy' } },
                        { useCase: { contains: 'kế hoạch bài dạy' } }
                    ]
                }
            }),
            prisma.sharedContent.count({
                where: {
                    OR: [
                        { title: { contains: 'kế hoạch bài dạy' } },
                        { description: { contains: 'kế hoạch bài dạy' } },
                        { content: { contains: 'kế hoạch bài dạy' } }
                    ]
                }
            })
        ]);

        console.log(`✅ Templates có "kế hoạch bài dạy": ${templates}`);
        console.log(`✅ AI Tools có "kế hoạch bài dạy": ${aiTools}`);
        console.log(`✅ Shared Content có "kế hoạch bài dạy": ${sharedContent}`);

        // Check for old term
        const [oldTemplates, oldAITools, oldSharedContent] = await Promise.all([
            prisma.template.count({
                where: {
                    OR: [
                        { name: { contains: 'giáo án' } },
                        { description: { contains: 'giáo án' } },
                        { templateContent: { contains: 'giáo án' } }
                    ]
                }
            }),
            prisma.aITool.count({
                where: {
                    OR: [
                        { description: { contains: 'giáo án' } },
                        { useCase: { contains: 'giáo án' } }
                    ]
                }
            }),
            prisma.sharedContent.count({
                where: {
                    OR: [
                        { title: { contains: 'giáo án' } },
                        { description: { contains: 'giáo án' } },
                        { content: { contains: 'giáo án' } }
                    ]
                }
            })
        ]);

        console.log(`\n🔍 Kiểm tra từ cũ "giáo án":`);
        console.log(`${oldTemplates > 0 ? '⚠️' : '✅'} Templates còn "giáo án": ${oldTemplates}`);
        console.log(`${oldAITools > 0 ? '⚠️' : '✅'} AI Tools còn "giáo án": ${oldAITools}`);
        console.log(`${oldSharedContent > 0 ? '⚠️' : '✅'} Shared Content còn "giáo án": ${oldSharedContent}`);

        if (oldTemplates === 0 && oldAITools === 0 && oldSharedContent === 0) {
            console.log('\n🎉 Hoàn tất! Tất cả dữ liệu đã được cập nhật thành công!');
        } else {
            console.log('\n⚠️  Một số bản ghi vẫn còn từ cũ. Có thể cần kiểm tra thủ công.');
        }

        console.log('\n📋 Bước tiếp theo:');
        console.log('1. Chạy ứng dụng: npm run dev');
        console.log('2. Kiểm tra các trang để đảm bảo hiển thị đúng');
        console.log('3. Nếu cần re-seed dữ liệu: npm run seed');

    } catch (error) {
        console.error('\n❌ Lỗi:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
