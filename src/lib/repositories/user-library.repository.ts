import { UserLibrary, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

interface CreateUserLibraryInput {
    userId: string;
    contentId: string;
}

interface UpdateUserLibraryInput {
    // UserLibrary doesn't have updatable fields besides savedAt
    savedAt?: Date;
}

export class UserLibraryRepository extends BaseRepository<
    UserLibrary,
    CreateUserLibraryInput,
    UpdateUserLibraryInput
> {
    /**
     * Save content to user's library
     */
    async create(data: CreateUserLibraryInput): Promise<UserLibrary> {
        try {
            return await this.db.userLibrary.create({
                data,
            });
        } catch (error) {
            this.handleError(error, 'lưu vào thư viện cá nhân');
        }
    }

    /**
     * Find library entry by ID
     */
    async findById(id: string): Promise<UserLibrary | null> {
        try {
            return await this.db.userLibrary.findUnique({
                where: { id },
                include: {
                    content: {
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    name: true,
                                    school: true,
                                },
                            },
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
        } catch (error) {
            this.handleError(error, 'tìm mục thư viện theo ID');
        }
    }

    /**
     * Update library entry (mainly for savedAt timestamp)
     */
    async update(id: string, data: UpdateUserLibraryInput): Promise<UserLibrary> {
        try {
            return await this.db.userLibrary.update({
                where: { id },
                data,
            });
        } catch (error) {
            this.handleError(error, 'cập nhật mục thư viện');
        }
    }

    /**
     * Remove content from user's library
     */
    async delete(id: string): Promise<void> {
        try {
            await this.db.userLibrary.delete({
                where: { id },
            });
        } catch (error) {
            this.handleError(error, 'xóa khỏi thư viện cá nhân');
        }
    }

    /**
     * Remove content from user's library by user and content IDs
     */
    async removeFromLibrary(userId: string, contentId: string): Promise<void> {
        try {
            await this.db.userLibrary.delete({
                where: {
                    userId_contentId: {
                        userId,
                        contentId,
                    },
                },
            });
        } catch (error) {
            this.handleError(error, 'xóa khỏi thư viện cá nhân');
        }
    }

    /**
     * Get user's saved content with filtering
     */
    async findByUserId(
        userId: string,
        filters?: {
            subject?: string;
            gradeLevel?: number;
            tags?: string[];
            dateFrom?: Date;
            dateTo?: Date;
            limit?: number;
            offset?: number;
        }
    ): Promise<UserLibrary[]> {
        try {
            const where: Prisma.UserLibraryWhereInput = {
                userId,
            };

            // Apply content filters
            if (filters?.subject || filters?.gradeLevel || filters?.tags?.length) {
                where.content = {};

                if (filters.subject) {
                    where.content.subject = filters.subject;
                }

                if (filters.gradeLevel) {
                    where.content.gradeLevel = filters.gradeLevel;
                }

                if (filters.tags?.length) {
                    where.content.tags = {
                        hasSome: filters.tags,
                    };
                }
            }

            // Apply date filters
            if (filters?.dateFrom || filters?.dateTo) {
                where.savedAt = {};
                if (filters.dateFrom) {
                    where.savedAt.gte = filters.dateFrom;
                }
                if (filters.dateTo) {
                    where.savedAt.lte = filters.dateTo;
                }
            }

            return await this.db.userLibrary.findMany({
                where,
                include: {
                    content: {
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    name: true,
                                    school: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { savedAt: 'desc' },
                take: filters?.limit,
                skip: filters?.offset,
            });
        } catch (error) {
            this.handleError(error, 'tìm nội dung đã lưu của người dùng');
        }
    }

    /**
     * Find all library entries with optional filtering
     */
    async findMany(filters?: {
        userId?: string;
        contentId?: string;
        limit?: number;
        offset?: number;
    }): Promise<UserLibrary[]> {
        try {
            const where: Prisma.UserLibraryWhereInput = {};

            if (filters?.userId) {
                where.userId = filters.userId;
            }

            if (filters?.contentId) {
                where.contentId = filters.contentId;
            }

            return await this.db.userLibrary.findMany({
                where,
                include: {
                    content: {
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    name: true,
                                    school: true,
                                },
                            },
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: { savedAt: 'desc' },
                take: filters?.limit,
                skip: filters?.offset,
            });
        } catch (error) {
            this.handleError(error, 'tìm danh sách thư viện');
        }
    }

    /**
     * Check if content is saved in user's library
     */
    async isContentSaved(userId: string, contentId: string): Promise<boolean> {
        try {
            const entry = await this.db.userLibrary.findUnique({
                where: {
                    userId_contentId: {
                        userId,
                        contentId,
                    },
                },
            });

            return !!entry;
        } catch (error) {
            this.handleError(error, 'kiểm tra nội dung đã lưu');
        }
    }

    /**
     * Get library statistics for a user
     */
    async getUserLibraryStats(userId: string): Promise<{
        totalSaved: number;
        savedBySubject: Record<string, number>;
        savedByGradeLevel: Record<number, number>;
    }> {
        try {
            const [totalSaved, savedBySubject, savedByGradeLevel] = await Promise.all([
                this.db.userLibrary.count({ where: { userId } }),
                this.db.userLibrary.groupBy({
                    by: ['content'],
                    where: { userId },
                    _count: true,
                }),
                this.db.userLibrary.groupBy({
                    by: ['content'],
                    where: { userId },
                    _count: true,
                }),
            ]);

            // Note: The groupBy queries above are simplified
            // In a real implementation, you'd need to join with content table
            // to get subject and gradeLevel statistics

            return {
                totalSaved,
                savedBySubject: {}, // Would be populated with actual data
                savedByGradeLevel: {}, // Would be populated with actual data
            };
        } catch (error) {
            this.handleError(error, 'lấy thống kê thư viện');
        }
    }
}