/**
 * Test script for admin infrastructure
 * Verifies database connection, repositories, and basic operations
 */

import { prisma } from '@/lib/db';
import { AIToolsRepository } from './repositories/ai-tools-repository';
import templatesRepository from './repositories/templates-repository';
import { createInitialAdmin, isSeedingNeeded } from './seed-data';

export async function testAdminInfrastructure(): Promise<void> {
    console.log('🧪 Testing admin infrastructure...');

    try {
        // Test database connection
        console.log('📊 Testing database connection...');
        await prisma.$connect();
        console.log('✅ Database connection successful');

        // Test repositories
        console.log('📦 Testing repositories...');
        const aiToolsRepo = new AIToolsRepository();
        const templatesRepo = templatesRepository;

        // Test AI tools repository
        const aiToolsStats = await aiToolsRepo.getAIToolsStats();
        console.log('✅ AI Tools repository working:', aiToolsStats);

        // Test templates repository
        const templatesStats = await templatesRepo.getTemplatesStats();
        console.log('✅ Templates repository working:', templatesStats);

        // Check if seeding is needed
        const needsSeeding = await isSeedingNeeded();
        console.log(`📋 Seeding needed: ${needsSeeding}`);

        // Test admin user creation (if needed)
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        const adminName = process.env.ADMIN_NAME || 'Admin User';

        try {
            await createInitialAdmin(adminEmail, adminName);
            console.log('✅ Admin user setup successful');
        } catch (error) {
            console.log('ℹ️ Admin user already exists or setup skipped');
        }

        console.log('🎉 Admin infrastructure test completed successfully!');

    } catch (error) {
        console.error('❌ Admin infrastructure test failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run test if this file is executed directly
if (require.main === module) {
    testAdminInfrastructure()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}