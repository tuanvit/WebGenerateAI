/**
 * Seed data for admin system
 * Migrates existing AI tools and templates to database
 */

import { prisma } from "@/lib/db";
import { AdminAction, AdminResource, logAdminAction } from "./admin-audit";

/**
 * Seed AI tools from existing data using migration function
 */
export const seedAITools = async (adminUser?: {
    id: string;
    email: string;
    name: string;
    role: string;
    lastLoginAt: Date;
}): Promise<void> => {
    console.log("Starting AI tools seeding using migration...");

    try {
        // Use the migration function to seed AI tools
        const { migrateAIToolsToDatabase } = await import("./migrate-ai-tools");

        const result = await migrateAIToolsToDatabase({
            dryRun: false,
            overwrite: true,
            validateOnly: false,
        });

        if (!result.success) {
            throw new Error(
                `Migration failed: ${result.errors
                    .map((e) => e.error)
                    .join(", ")}`
            );
        }

        console.log(`✅ Seeded ${result.migratedCount} AI tools successfully`);

        if (result.skippedCount > 0) {
            console.log(`ℹ️ Skipped ${result.skippedCount} existing tools`);
        }

        if (result.errors.length > 0) {
            console.warn(`⚠️ ${result.errors.length} warnings during seeding`);
        }

        // Log the action if admin user is provided
        if (adminUser) {
            try {
                await logAdminAction(
                    adminUser,
                    AdminAction.IMPORT,
                    AdminResource.AI_TOOLS,
                    undefined,
                    {
                        count: result.migratedCount,
                        skipped: result.skippedCount,
                        errors: result.errors.length,
                        source: "seed",
                    }
                );
            } catch (logError) {
                // Ignore audit log errors during seeding
                console.log("Note: Audit logging skipped during seeding");
            }
        }
    } catch (error) {
        console.error("Error seeding AI tools:", error);
        throw error;
    }
};

/**
 * Seed templates from existing data
 * Note: Templates will be seeded separately when template data is available
 */
export const seedTemplates = async (adminUser?: {
    id: string;
    email: string;
    name: string;
    role: string;
    lastLoginAt: Date;
}): Promise<void> => {
    console.log("Templates seeding skipped - no template data available yet");

    // This will be implemented when template data is available
    // For now, we focus on AI tools seeding
};

/**
 * Create initial admin user
 */
export const createInitialAdmin = async (
    email: string,
    name: string
): Promise<void> => {
    console.log("Creating initial admin user...");

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            // Update existing user to admin
            await prisma.user.update({
                where: { email },
                data: { role: "admin" },
            });
            console.log(`Updated existing user ${email} to admin`);
        } else {
            // Create new admin user
            await prisma.user.create({
                data: {
                    email,
                    name,
                    role: "admin",
                    subjects: JSON.stringify([]),
                    gradeLevel: JSON.stringify([]),
                },
            });
            console.log(`Created new admin user ${email}`);
        }
    } catch (error) {
        console.error("Error creating initial admin:", error);
        throw error;
    }
};

/**
 * Run all seeding operations
 */
export const runSeedOperations = async (
    adminEmail?: string,
    adminName?: string
): Promise<void> => {
    console.log("Starting database seeding...");

    try {
        // Create initial admin if provided
        if (adminEmail && adminName) {
            await createInitialAdmin(adminEmail, adminName);
        }

        // Get admin user for logging
        let adminUser:
            | {
                  id: string;
                  email: string;
                  name: string;
                  role: string;
                  lastLoginAt: Date;
              }
            | undefined;
        if (adminEmail) {
            const user = await prisma.user.findUnique({
                where: { email: adminEmail },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    lastLoginAt: true,
                },
            });
            if (user && user.role === "admin") {
                adminUser = user;
            }
        }

        // Seed AI tools
        await seedAITools(adminUser);

        // Seed templates
        await seedTemplates(adminUser);

        console.log("Database seeding completed successfully!");
    } catch (error) {
        console.error("Error during seeding:", error);
        throw error;
    }
};

/**
 * Check if seeding is needed
 */
export const isSeedingNeeded = async (): Promise<boolean> => {
    try {
        const [aiToolsCount, templatesCount] = await Promise.all([
            prisma.aITool.count(),
            prisma.template.count(),
        ]);

        return aiToolsCount === 0 || templatesCount === 0;
    } catch (error) {
        console.error("Error checking if seeding is needed:", error);
        return true; // Assume seeding is needed if we can't check
    }
};
