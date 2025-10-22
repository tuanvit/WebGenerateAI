import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db-utils';

/**
 * POST /api/debug/setup-test-data - Setup complete test data for rating system
 */
export async function POST(request: NextRequest) {
    try {
        // Create test users
        const testUsers = [
            {
                email: 'teacher1@test.com',
                name: 'Cô Nguyễn Thị Lan',
                school: 'THCS Nguyễn Du',
                subjects: ['Lịch sử', 'Địa lý'],
                gradeLevel: [6, 7, 8, 9]
            },
            {
                email: 'teacher2@test.com',
                name: 'Thầy Trần Văn Minh',
                school: 'THCS Lê Quý Đôn',
                subjects: ['Toán học'],
                gradeLevel: [6, 7, 8, 9]
            },
            {
                email: 'teacher3@test.com',
                name: 'Cô Phạm Thị Hương',
                school: 'THCS Trần Phú',
                subjects: ['Địa lý'],
                gradeLevel: [6, 7, 8, 9]
            }
        ];

        const createdUsers = [];
        for (const userData of testUsers) {
            try {
                const user = await prisma.user.upsert({
                    where: { email: userData.email },
                    update: userData,
                    create: userData
                });
                createdUsers.push(user);
            } catch (userError) {
                console.error('Error creating user:', userError);
                // Try to find existing user
                const existingUser = await prisma.user.findUnique({
                    where: { email: userData.email }
                });
                if (existingUser) {
                    createdUsers.push(existingUser);
                }
            }
        }

        if (createdUsers.length === 0) {
            throw new Error('No users could be created or found');
        }

        // Create test content
        const testContent = {
            title: 'Bài giảng Lịch sử Việt Nam - Test Rating System',
            description: 'Nội dung test cho hệ thống đánh giá sao',
            content: `# Bài giảng Test

## Mục tiêu
- Test hệ thống đánh giá sao
- Kiểm tra logic rating

## Nội dung
Đây là nội dung test để kiểm tra hệ thống đánh giá.`,
            subject: 'Lịch sử',
            gradeLevel: 8,
            tags: JSON.stringify(['#Test', '#Rating', '#LịchSử']),
            rating: 0,
            ratingCount: 0,
            authorId: createdUsers[0].id
        };

        // Check if content already exists
        let content = await prisma.sharedContent.findFirst({
            where: {
                authorId: createdUsers[0].id,
                title: testContent.title
            }
        });

        if (!content) {
            content = await prisma.sharedContent.create({
                data: testContent
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Test data setup complete',
            data: {
                users: createdUsers.length,
                content: content.id,
                instructions: [
                    '1. Go to /debug/test-rating',
                    '2. Click "Test Database" to verify connection',
                    '3. Try rating the test content',
                    '4. Check that ratings are saved to database',
                    '5. Go to /library/community to see the content'
                ]
            }
        });

    } catch (error) {
        console.error('Error setting up test data:', error);

        return NextResponse.json(
            {
                error: 'Failed to setup test data',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}