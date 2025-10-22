import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db-utils';

/**
 * GET /api/library/my-shared - Get user's shared content
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Vui lòng đăng nhập để xem nội dung của bạn' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        try {
            const [sharedContent, totalCount] = await Promise.all([
                prisma.sharedContent.findMany({
                    where: {
                        authorId: session.user.id
                    },
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                school: true
                            }
                        },
                        contentRatings: {
                            include: {
                                user: {
                                    select: {
                                        name: true,
                                        email: true
                                    }
                                }
                            },
                            orderBy: {
                                createdAt: 'desc'
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    skip,
                    take: limit
                }),
                prisma.sharedContent.count({
                    where: {
                        authorId: session.user.id
                    }
                })
            ]);

            // Process the data
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
                    id: item.author?.id,
                    name: item.author?.name || 'Ẩn danh',
                    school: item.author?.school || ''
                },
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                ratings: item.contentRatings.map((rating: any) => ({
                    id: rating.id,
                    rating: rating.rating,
                    comment: rating.comment,
                    createdAt: rating.createdAt,
                    user: {
                        name: rating.user.name,
                        email: rating.user.email
                    }
                }))
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
                }
            });

        } catch (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json(
                { error: 'Lỗi database khi lấy nội dung. Vui lòng thử lại.' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Error getting user shared content:', error);
        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi lấy nội dung. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}