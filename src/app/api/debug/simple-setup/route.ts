import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db-utils';

/**
 * POST /api/debug/simple-setup - Simple setup for testing
 */
export async function POST(request: NextRequest) {
    try {
        // Create a simple test user
        const testUser = await prisma.user.create({
            data: {
                email: `test-${Date.now()}@example.com`,
                name: 'Test User',
                subjects: JSON.stringify(['Toán học']),
                gradeLevel: JSON.stringify([6, 7, 8, 9])
            }
        });

        // Create test content
        const testContent = await prisma.sharedContent.create({
            data: {
                title: 'Test Content for Rating',
                description: 'This is test content',
                content: 'Test content body',
                subject: 'Toán học',
                gradeLevel: 8,
                tags: '["#Test"]',
                rating: 0,
                ratingCount: 0,
                authorId: testUser.id
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Simple setup complete',
            data: {
                userId: testUser.id,
                contentId: testContent.id,
                userEmail: testUser.email
            }
        });

    } catch (error) {
        console.error('Simple setup error:', error);

        return NextResponse.json(
            {
                error: 'Simple setup failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}