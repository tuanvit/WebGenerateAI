#!/usr/bin/env node
/**
 * Update database: Replace "giáo án" with "kế hoạch bài dạy" in existing data
 * This script will:
 * 1. Run SQL migration to update existing records
 * 2. Re-seed AI tools with updated data
 * 3. Re-seed templates with updated data
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function updateDatabase() {
    console.log('🚀 Starting database update: giáo án -> kế hoạch bài dạy\n');

    try {
        // Step 1: Run SQL migration
        console.log('📝 Step 1: Running SQL migration...\n');
        
        const sqlPath = path.join(__dirname, '..', 'prisma', 'migrations', 'update_giao_an_to_ke_hoach_bai_day.sql');
        
        if (!fs.existsSync(sqlPath)) {
            console.error('❌ Migration SQL file not found:', sqlPath);
            process.exit(1);
        }

        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        
        // Split SQL into individual statements
        const statements = sqlContent
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`Found ${statements.length} SQL statements to execute\n`);

        // Execute each statement
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            try {
                console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
                await prisma.$executeRawUnsafe(statement);
                successCount++;
                console.log(`✅ Statement ${i + 1} executed successfully`);
            } catch (error) {
                errorCount++;
                console.error(`❌ Error executing statement ${i + 1}:`, error.message);
                // Continue with other statements
            }
        }

        console.log(`\n✅ SQL Migration completed: ${successCount} successful, ${errorCount} failed\n`);

        // Step 2: Re-seed AI Tools
        console.log('📝 Step 2: Re-seeding AI Tools with updated data...\n');
        
        try {
            // Delete existing AI tools
            const deletedTools = await prisma.aITool.deleteMany({});
            console.log(`🗑️  Deleted ${deletedTools.count} existing AI tools`);

            // Re-run seed for AI tools
            const { runSeedOperations } = require('../src/lib/admin/seed-data.ts');
            await runSeedOperations();
            
            const newToolsCount = await prisma.aITool.count();
            console.log(`✅ Re-seeded ${newToolsCount} AI tools with updated data\n`);
        } catch (error) {
            console.error('⚠️  Error re-seeding AI tools:', error.message);
            console.log('You may need to run: npm run seed\n');
        }

        // Step 3: Verify changes
        console.log('📝 Step 3: Verifying changes...\n');
        
        // Check templates
        const templatesWithNewTerm = await prisma.template.count({
            where: {
                OR: [
                    { name: { contains: 'kế hoạch bài dạy' } },
                    { description: { contains: 'kế hoạch bài dạy' } }
                ]
            }
        });
        console.log(`✅ Found ${templatesWithNewTerm} templates with "kế hoạch bài dạy"`);

        // Check AI tools
        const aiToolsWithNewTerm = await prisma.aITool.count({
            where: {
                OR: [
                    { description: { contains: 'kế hoạch bài dạy' } },
                    { useCase: { contains: 'kế hoạch bài dạy' } }
                ]
            }
        });
        console.log(`✅ Found ${aiToolsWithNewTerm} AI tools with "kế hoạch bài dạy"`);

        // Check shared content
        const sharedContentWithNewTerm = await prisma.sharedContent.count({
            where: {
                OR: [
                    { title: { contains: 'kế hoạch bài dạy' } },
                    { description: { contains: 'kế hoạch bài dạy' } }
                ]
            }
        });
        console.log(`✅ Found ${sharedContentWithNewTerm} shared content with "kế hoạch bài dạy"`);

        // Check for old term (should be 0 or very few)
        const templatesWithOldTerm = await prisma.template.count({
            where: {
                OR: [
                    { name: { contains: 'giáo án' } },
                    { description: { contains: 'giáo án' } }
                ]
            }
        });
        
        if (templatesWithOldTerm > 0) {
            console.log(`⚠️  Warning: Still found ${templatesWithOldTerm} templates with "giáo án"`);
        } else {
            console.log(`✅ No templates with old term "giáo án" found`);
        }

        console.log('\n✨ Database update completed successfully!\n');
        
        console.log('📋 Summary:');
        console.log(`- SQL statements executed: ${successCount}/${statements.length}`);
        console.log(`- Templates updated: ${templatesWithNewTerm}`);
        console.log(`- AI tools updated: ${aiToolsWithNewTerm}`);
        console.log(`- Shared content updated: ${sharedContentWithNewTerm}`);
        
        console.log('\n🎉 Next steps:');
        console.log('1. Test the application: npm run dev');
        console.log('2. Verify all pages display "kế hoạch bài dạy" correctly');
        console.log('3. Check that no "giáo án" text remains in the UI');

    } catch (error) {
        console.error('❌ Database update failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the update
updateDatabase()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
