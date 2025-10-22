import { SharedContent, ContentRating, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';
import type { CreateSharedContentSchema } from '../../types/content';
import { z } from 'zod';

type CreateSharedContentInput = z.infer<typeof CreateSharedContentSchema>;
type UpdateSharedContentInput = Partial<Omit<CreateSharedContentInput, 'authorId'>>;

export class SharedContentRepository extends BaseRepository<
    SharedContent,
    CreateSharedContentInput,
    UpdateSharedContentInput
> {
    /**
     * Create new shared content
     */
    async create(data: CreateSharedContentInput): Promise<SharedContent> {
        try {
            return await this.db.sharedContent.create({
                data,
            });
        } catch (error) {
            this.handleError(error, 'tạo nội dung chia sẻ');
        }
    }

    /**
     * Find shared content by ID
     */
    async findById(id: string): Promise<SharedContent | null> {
        try {
            return await this.db.sharedContent.findUnique({
                where: { id },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            school: true,
                        },
                    },
                    contentRatings: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
            });
        } catch (error) {
            this.handleError(error, 'tìm nội dung chia sẻ theo ID');
        }
    }

    /**
     * Update shared content by ID
     */
    async update(id: string, data: UpdateSharedContentInput): Promise<SharedContent> {
        try {
            return await this.db.sharedContent.update({
                where: { id },
                data,
            });
        } catch (error) {
            this.handleError(error, 'cập nhật nội dung chia sẻ');
        }
    }

    /**
     * Delete shared content by ID
     */
    async delete(id: string): Promise<void> {
        try {
            await this.db.sharedContent.delete({
                where: { id },
            });
        } catch (error) {
            this.handleError(error, 'xóa nội dung chia sẻ');
        }
    }

    /**
     * Search shared content with filters
     */
    async search(filters: {
        subject?: string;
        gradeLevel?: number;
        topic?: string;
        tags?: string[];
        rating?: number;
        author?: string;
        limit?: number;
        offset?: number;
    }): Promise<SharedContent[]> {
        try {
            const where: Prisma.SharedContentWhereInput = {};

            if (filters.subject) {
                where.subject = filters.subject;
            }

            if (filters.gradeLevel) {
                where.gradeLevel = filters.gradeLevel;
            }

            if (filters.topic) {
                where.OR = [
                    { title: { contains: filters.topic, mode: 'insensitive' } },
                    { description: { contains: filters.topic, mode: 'insensitive' } },
                    { content: { contains: filters.topic, mode: 'insensitive' } },
                ];
            }

            if (filters.tags?.length) {
                where.tags = {
                    hasSome: filters.tags,
                };
            }

            if (filters.rating) {
                where.rating = {
                    gte: filters.rating,
                };
            }

            if (filters.author) {
                where.author = {
                    name: {
                        contains: filters.author,
                        mode: 'insensitive',
                    },
                };
            }

            return await this.db.sharedContent.findMany({
                where,
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            school: true,
                        },
                    },
                },
                orderBy: [
                    { rating: 'desc' },
                    { createdAt: 'desc' },
                ],
                take: filters.limit,
                skip: filters.offset,
            });
        } catch (error) {
            this.handleError(error, 'tìm kiếm nội dung chia sẻ');
        }
    }

    /**
     * Find all shared content with optional filtering
     */
    async findMany(filters?: {
        authorId?: string;
        subject?: string;
        gradeLevel?: number;
        limit?: number;
        offset?: number;
    }): Promise<SharedContent[]> {
        try {
            const where: Prisma.SharedContentWhereInput = {};

            if (filters?.authorId) {
                where.authorId = filters.authorId;
            }

            if (filters?.subject) {
                where.subject = filters.subject;
            }

            if (filters?.gradeLevel) {
                where.gradeLevel = filters.gradeLevel;
            }

            return await this.db.sharedContent.findMany({
                where,
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            school: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: filters?.limit,
                skip: filters?.offset,
            });
        } catch (error) {
            this.handleError(error, 'tìm danh sách nội dung chia sẻ');
        }
    }

    /**
     * Get popular content
     */
    async getPopular(limit: number = 10): Promise<SharedContent[]> {
        try {
            return await this.db.sharedContent.findMany({
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            school: true,
                        },
                    },
                },
                orderBy: [
                    { rating: 'desc' },
                    { ratingCount: 'desc' },
                ],
                take: limit,
            });
        } catch (error) {
            this.handleError(error, 'lấy nội dung phổ biến');
        }
    }

    /**
     * Get recent content
     */
    async getRecent(limit: number = 10): Promise<SharedContent[]> {
        try {
            return await this.db.sharedContent.findMany({
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            school: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
            });
        } catch (error) {
            this.handleError(error, 'lấy nội dung mới nhất');
        }
    }

    /**
     * Rate content
     */
    async rateContent(contentId: string, userId: string, rating: number): Promise<void> {
        try {
            await this.db.$transaction(async (tx) => {
                // Upsert the rating
                await tx.contentRating.upsert({
                    where: {
                        userId_contentId: {
                            userId,
                            contentId,
                        },
                    },
                    update: { rating },
                    create: {
                        userId,
                        contentId,
                        rating,
                    },
                });

                // Recalculate average rating
                const ratings = await tx.contentRating.findMany({
                    where: { contentId },
                });

                const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

                await tx.sharedContent.update({
                    where: { id: contentId },
                    data: {
                        rating: averageRating,
                        ratingCount: ratings.length,
                    },
                });
            });
        } catch (error) {
            this.handleError(error, 'đánh giá nội dung');
        }
    }

    /**
     * Get user's rating for content
     */
    async getUserRating(contentId: string, userId: string): Promise<ContentRating | null> {
        try {
            return await this.db.contentRating.findUnique({
                where: {
                    userId_contentId: {
                        userId,
                        contentId,
                    },
                },
            });
        } catch (error) {
            this.handleError(error, 'lấy đánh giá của người dùng');
        }
    }
}