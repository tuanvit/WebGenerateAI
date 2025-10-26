#!/usr/bin/env node
/**
 * Re-seed AI Tools only
 * This will delete and recreate AI tools with updated data
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function reseedAITools() {
    console.log('🚀 Re-seeding AI Tools với dữ liệu mới\n');

    try {
        // Step 1: Count existing AI tools
        const existingCount = await prisma.aITool.count();
        console.log(`📊 Hiện có ${existingCount} AI tools trong database\n`);

        // Step 2: Delete existing AI tools
        console.log('🗑️  Đang xóa AI tools cũ...');
        const deleted = await prisma.aITool.deleteMany({});
        console.log(`✅ Đã xóa ${deleted.count} AI tools\n`);

        // Step 3: Import and run seed
        console.log('📝 Đang tạo lại AI tools với dữ liệu mới...');
        
        // Dynamically import the TypeScript module
        const seedModule = await import('../src/lib/admin/seed-data.ts');
        await seedModule.seedAITools();

        // Step 4: Count new AI tools
        const newCount = await prisma.aITool.count();
        console.log(`\n✅ Đã tạo ${newCount} AI tools mới\n`);

        // Step 5: Verify the data
        console.log('🔍 Kiểm tra dữ liệu mới...\n');

        const toolsWithNewTerm = await prisma.aITool.count({
            where: {
                OR: [
                    { description: { contains: 'kế hoạch bài dạy' } },
                    { useCase: { contains: 'kế hoạch bài dạy' } },
                    { features: { contains: 'kế hoạch bài dạy' } }
                ]
            }
        });

        const toolsWithOldTerm = await prisma.aITool.count({
            where: {
                OR: [
                    { description: { contains: 'giáo án' } },
                    { useCase: { contains: 'giáo án' } },
                    { features: { contains: 'giáo án' } }
                ]
            }
        });

        console.log(`✅ AI tools có "kế hoạch bài dạy": ${toolsWithNewTerm}`);
        console.log(`${toolsWithOldTerm > 0 ? '⚠️' : '✅'} AI tools còn "giáo án": ${toolsWithOldTerm}\n`);

        // Step 6: Show sample data
        console.log('📋 Mẫu dữ liệu mới:\n');
        const sampleTools = await prisma.aITool.findMany({
            take: 3,
            select: {
                name: true,
                description: true,
                useCase: true
            }
        });

        sampleTools.forEach((tool, index) => {
            console.log(`${index + 1}. ${tool.name}`);
            console.log(`   Mô tả: ${tool.description.substring(0, 80)}...`);
            console.log(`   Use case: ${tool.useCase.substring(0, 80)}...`);
            console.log('');
        });

        console.log('🎉 Re-seed hoàn tất!\n');
        console.log('📋 Bước tiếp theo:');
        console.log('1. Kiểm tra ứng dụng: npm run dev');
        console.log('2. Xem danh sách AI tools tại /admin/ai-tools');
        console.log('3. Tạo prompt mới để test');

    } catch (error) {
        console.error('\n❌ Lỗi khi re-seed:', error);
        console.error('\nChi tiết:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

reseedAITools();
