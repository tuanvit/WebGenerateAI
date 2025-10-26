#!/usr/bin/env node
/**
 * Run database migration to replace "giáo án" with "kế hoạch bài dạy"
 * This script executes the SQL migration file
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runMigration() {
    console.log('🚀 Starting database migration: giáo án -> kế hoạch bài dạy\n');

    try {
        // Read the SQL migration file
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

        console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

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
                // Continue with other statements even if one fails
            }
        }

        console.log('\n✨ Migration completed!');
        console.log(`✅ Successful: ${successCount}`);
        console.log(`❌ Failed: ${errorCount}`);

        if (errorCount === 0) {
            console.log('\n🎉 All database updates completed successfully!');
        } else {
            console.log('\n⚠️  Some statements failed. Please check the errors above.');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the migration
runMigration()
    .then(() => {
        console.log('\n📋 Next steps:');
        console.log('1. Verify the changes in your database');
        console.log('2. Test the application: npm run dev');
        console.log('3. Check all pages to ensure text is updated correctly');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
