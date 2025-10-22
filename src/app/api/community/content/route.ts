import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db-utils';
import { z } from 'zod';

/**
 * GET /api/community/content - Search shared content with filters
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Parse filters from query parameters
        const filters: any = {};
        const where: any = {};

        if (searchParams.get('subject')) {
            filters.subject = searchParams.get('subject');
            where.subject = {
                contains: filters.subject
            };
        }

        if (searchParams.get('gradeLevel')) {
            const gradeLevel = parseInt(searchParams.get('gradeLevel')!);
            if ([6, 7, 8, 9].includes(gradeLevel)) {
                filters.gradeLevel = gradeLevel as 6 | 7 | 8 | 9;
                where.gradeLevel = gradeLevel;
            }
        }

        if (searchParams.get('topic')) {
            filters.topic = searchParams.get('topic');
            where.OR = [
                {
                    title: {
                        contains: filters.topic
                    }
                },
                {
                    description: {
                        contains: filters.topic
                    }
                },
                {
                    content: {
                        contains: filters.topic
                    }
                }
            ];
        }

        if (searchParams.get('author')) {
            filters.author = searchParams.get('author');
            where.author = {
                name: {
                    contains: filters.author
                }
            };
        }

        // Pagination parameters
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        // Get real data from database with pagination
        try {
            const [sharedContent, totalCount] = await Promise.all([
                prisma.sharedContent.findMany({
                    where,
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                school: true
                            }
                        }
                    },
                    orderBy: [
                        { rating: 'desc' },
                        { ratingCount: 'desc' },
                        { createdAt: 'desc' }
                    ],
                    skip,
                    take: limit
                }),
                prisma.sharedContent.count({ where })
            ]);

            // Process the data to match expected format
            const processedContent = sharedContent.map((item: any) => ({
                id: item.id,
                title: item.title,
                description: item.description,
                content: item.content,
                subject: item.subject,
                gradeLevel: item.gradeLevel,
                tags: Array.isArray(item.tags) ? item.tags : (item.tags ? JSON.parse(item.tags) : []),
                rating: item.rating || 0,
                ratingCount: item.ratingCount || 0,
                author: {
                    name: item.author?.name || 'Ẩn danh',
                    school: item.author?.school || ''
                },
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            }));

            const totalPages = Math.ceil(totalCount / limit);

            return NextResponse.json({
                success: true,
                data: processedContent,
                pagination: {
                    page,
                    limit,
                    totalCount,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                },
                filters,
            });

        } catch (dbError) {
            console.error('Database error:', dbError);

            // Fallback to mock data if database fails
            const mockContent = [
                {
                    id: '1',
                    title: 'Bài giảng Lịch sử Việt Nam - Thời kỳ đấu tranh chống thực dân Pháp',
                    description: 'Tài liệu giảng dạy về giai đoạn lịch sử quan trọng của dân tộc Việt Nam',
                    content: 'Nội dung chi tiết về cuộc đấu tranh chống thực dân Pháp...',
                    subject: 'Lịch sử',
                    gradeLevel: 8,
                    tags: ['#LịchSử', '#ViệtNam', '#ThựcDânPháp'],
                    rating: 4.8,
                    ratingCount: 156,
                    author: {
                        name: 'Cô Nguyễn Thị Lan',
                        school: 'THCS Nguyễn Du'
                    },
                    createdAt: '2024-01-15T10:30:00Z',
                    updatedAt: '2024-01-15T10:30:00Z'
                }
            ];

            return NextResponse.json({
                success: true,
                data: mockContent,
                filters,
                note: 'Sử dụng dữ liệu mẫu do lỗi database'
            });
        }

    } catch (error) {
        console.error('Error searching community content:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: 'Dữ liệu tìm kiếm không hợp lệ',
                    details: error.issues.map((err: any) => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi tìm kiếm nội dung. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/community/content - Share content to community library
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Vui lòng đăng nhập để chia sẻ nội dung' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate content before sharing
        const { ContentModerationService } = await import('../../../../services/moderation/ContentModerationService');
        const validation = ContentModerationService.validateEducationalContent(
            body.content,
            body.subject
        );

        if (!validation.isValid) {
            return NextResponse.json(
                {
                    error: 'Nội dung không đạt tiêu chuẩn chia sẻ',
                    issues: validation.issues,
                    message: 'Vui lòng chỉnh sửa nội dung theo các gợi ý trước khi chia sẻ'
                },
                { status: 400 }
            );
        }

        // Save to database
        try {
            const sharedContent = await prisma.sharedContent.create({
                data: {
                    authorId: session.user.id,
                    title: body.title,
                    description: body.description,
                    content: body.content,
                    subject: body.subject,
                    gradeLevel: body.gradeLevel,
                    tags: JSON.stringify(body.tags || []),
                    rating: 0,
                    ratingCount: 0
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            school: true
                        }
                    }
                }
            });

            const processedContent = {
                id: sharedContent.id,
                title: sharedContent.title,
                description: sharedContent.description,
                content: sharedContent.content,
                subject: sharedContent.subject,
                gradeLevel: sharedContent.gradeLevel,
                tags: Array.isArray(sharedContent.tags) ? sharedContent.tags : JSON.parse(sharedContent.tags || '[]'),
                rating: sharedContent.rating,
                ratingCount: sharedContent.ratingCount,
                author: {
                    name: sharedContent.author?.name || 'Ẩn danh',
                    school: sharedContent.author?.school || ''
                },
                createdAt: sharedContent.createdAt,
                updatedAt: sharedContent.updatedAt
            };

            return NextResponse.json({
                success: true,
                data: processedContent,
                message: 'Nội dung đã được chia sẻ thành công',
            });

        } catch (dbError) {
            console.error('Database error when sharing:', dbError);
            return NextResponse.json(
                { error: 'Có lỗi xảy ra khi lưu nội dung. Vui lòng thử lại.' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Error sharing content:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: 'Dữ liệu chia sẻ không hợp lệ',
                    details: error.issues.map((err: any) => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi chia sẻ nội dung. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}