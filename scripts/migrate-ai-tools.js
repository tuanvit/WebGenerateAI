#!/usr/bin/env node

/**
 * CLI script to migrate AI tools to database
 * Usage: node scripts/migrate-ai-tools.js [options]
 */

const { execSync } = require('child_process');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    dryRun: args.includes('--dry-run'),
    overwrite: args.includes('--overwrite'),
    validateOnly: args.includes('--validate-only'),
    help: args.includes('--help') || args.includes('-h')
};

if (options.help) {
    console.log(`
AI Tools Migration Script

Usage: node scripts/migrate-ai-tools.js [options]

Options:
  --dry-run        Show what would be migrated without making changes
  --overwrite      Overwrite existing tools with same ID or name
  --validate-only  Only validate data without migrating
  --help, -h       Show this help message

Examples:
  node scripts/migrate-ai-tools.js --dry-run
  node scripts/migrate-ai-tools.js --validate-only
  node scripts/migrate-ai-tools.js --overwrite
`);
    process.exit(0);
}

console.log('🚀 Starting AI Tools Migration...');
console.log('Options:', options);

try {
    // Build the TypeScript files first
    console.log('📦 Building TypeScript files...');
    execSync('npx tsc --noEmit', { stdio: 'inherit', cwd: process.cwd() });

    // Run the migration using ts-node
    const scriptPath = path.join(__dirname, '..', 'src', 'lib', 'admin', 'run-migration.ts');
    const optionsJson = JSON.stringify(options);

    console.log('🔄 Running migration...');
    execSync(`npx ts-node -e "
        import { migrateAIToolsToDatabase } from './src/lib/admin/migrate-ai-tools';
        
        async function runMigration() {
            try {
                const options = ${optionsJson};
                const result = await migrateAIToolsToDatabase(options);
                
                console.log('\\n📊 Migration Results:');
                console.log('Success:', result.success);
                console.log('Migrated:', result.migratedCount);
                console.log('Skipped:', result.skippedCount);
                console.log('Errors:', result.errors.length);
                
                if (result.errors.length > 0) {
                    console.log('\\n❌ Errors:');
                    result.errors.forEach(error => {
                        console.log(\`- \${error.toolId}: \${error.error}\`);
                    });
                }
                
                if (result.success) {
                    console.log('\\n✅ Migration completed successfully!');
                    process.exit(0);
                } else {
                    console.log('\\n❌ Migration failed!');
                    process.exit(1);
                }
            } catch (error) {
                console.error('\\n💥 Migration error:', error);
                process.exit(1);
            }
        }
        
        runMigration();
    "`, { stdio: 'inherit', cwd: process.cwd() });

} catch (error) {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
}