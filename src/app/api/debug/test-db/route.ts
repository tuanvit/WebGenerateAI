import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        // Test database connection
        const userCount = await prisma.user.count();

        // Test creating a simple user
        const testUser = await prisma.user.upsert({
            where: { email: 'test@example.com' },
            update: { name: 'Test User Updated' },
            create: {
                email: 'test@example.com',
                name: 'Test User',
                subjects: JSON.stringify(['Test']),
                gradeLevel: JSON.stringify([6]),
                role: 'user'
            }
        });

        return NextResponse.json({
            success: true,
            userCount,
            testUser: {
                id: testUser.id,
                email: testUser.email,
                name: testUser.name,
                role: testUser.role
            }
        });

    } catch (error) {
        console.error('Database test error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}