import { prisma } from '../../lib/db';
import { Prisma } from '@prisma/client';
import {
    SharedContent,
    SearchFilters,
    ShareableContent,
    ContentRating,
    CreateSharedContentSchema,
    CreateContentRatingSchema,
    SearchFiltersSchema
} from '../../types/content';
import { DatabaseError, ValidationError } from '../../types/services';
import { cacheService } from '../../lib/cache';
import { DatabaseOptimizer } from '../../lib/db-optimization';

// Predefined Vietnamese educational tags
export const EDUCATIONAL_TAGS = {
    STANDARDS: [
        '#Chuẩn5512',
        '#GDPT2018',
        '#ChuẩnKiếnThức',
        '#ChuẩnKỹNăng'
    ],
    CREATIVITY: [
        '#SángTạo',
        '#TưDuyPhảnBiện',
        '#GiảiQuyếtVấnĐề',
        '#HợpTácNhóm'
    ],
    ACTIVITIES: [
        '#HoạtĐộngMới',
        '#TrảiNghiệm',
        '#ThựcHành',
        '#DựÁn'
    ],
    SUBJECTS: [
        '#ToánHọc',
        '#NgữVăn',
        '#TiếngAnh',
        '#LịchSử',
        '#ĐịaLý',
        '#VậtLý',
        '#HóaHọc',
        '#SinhHọc',
        '#GDCD',
        '#ThểDục',
        '#CôngNghệ',
        '#MỹThuật',
        '#ÂmNhạc'
    ],
    METHODS: [
        '#DạyHọcTíchCực',
        '#HọcTậpHợpTác',
        '#DạyHọcPhânHóa',
        '#ĐánhGiáNăngLực'
    ]
} as const;

// Helper function to get all available tags
export const getAllTags = (): string[] => {
    return Object.values(EDUCATIONAL_TAGS).flat();
};

// Helper function to validate tags
export const validateTags = (tags: string[]): boolean => {
    const allTags = getAllTags();
    return tags.every(tag => allTags.includes(tag) || tag.startsWith('#'));
};

/**
 * Community Library Service
 * Handles shared content management, search, rating, and community features
 */
export class CommunityLibraryService {
    /**
     * Search shared content with filters
     */
    static async searchContent(filters: SearchFilters): Promise<SharedContent[]> {
        try {
            // Validate filters
            const validatedFilters = SearchFiltersSchema.parse(filters);

            // Check cache first
            const cacheKey = JSON.stringify(validatedFilters);
            const cached = await cacheService.getCachedCommunityContent(cacheKey);

            if (cached) {
                return cached;
            }

            // Use optimized database query
            const result = await DatabaseOptimizer.getCommunityContentOptimized({
                subject: validatedFilters.subject,
                gradeLevel: validatedFilters.gradeLevel,
                tags: validatedFilters.tags,
                search: validatedFilters.topic,
                page: 1,
                limit: 50
            });

            const content = result.content.map((item: any) => ({
                id: item.id,
                authorId: item.author.id,
                title: item.title,
                description: item.description,
                content: '', // Don't include full content in search results for performance
                subject: item.subject,
                gradeLevel: item.gradeLevel as 6 | 7 | 8 | 9,
                tags: item.tags,
                rating: item.rating,
                ratingCount: item.ratingCount,
                createdAt: item.createdAt,
                updatedAt: item.createdAt
            }));

            // Cache the results
            await cacheService.cacheCommunityContent(cacheKey, content);

            return content;

        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            console.error('Search content failed:', error);
            throw new DatabaseError('Tìm kiếm nội dung thất bại');
        }
    }

    /**
     * Share content to community library
     */
    static async shareContent(content: ShareableContent & { authorId: string }): Promise<SharedContent> {
        try {
            // Validate input
            const validatedContent = CreateSharedContentSchema.parse(content);

            // Check if user exists
            const user = await prisma.user.findUnique({
                where: { id: validatedContent.authorId }
            });

            if (!user) {
                throw new ValidationError('Người dùng không tồn tại');
            }

            // Create shared content
            const sharedContent = await prisma.sharedContent.create({
                data: {
                    authorId: validatedContent.authorId,
                    title: validatedContent.title,
                    description: validatedContent.description,
                    content: validatedContent.content,
                    subject: validatedContent.subject,
                    gradeLevel: validatedContent.gradeLevel,
                    tags: validatedContent.tags,
                    rating: 0,
                    ratingCount: 0
                }
            });

            return {
                id: sharedContent.id,
                authorId: sharedContent.authorId,
                title: sharedContent.title,
                description: sharedContent.description,
                content: sharedContent.content,
                subject: sharedContent.subject,
                gradeLevel: sharedContent.gradeLevel as 6 | 7 | 8 | 9,
                tags: sharedContent.tags,
                rating: sharedContent.rating,
                ratingCount: sharedContent.ratingCount,
                createdAt: sharedContent.createdAt,
                updatedAt: sharedContent.updatedAt
            };

        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            console.error('Share content failed:', error);
            throw new DatabaseError('Chia sẻ nội dung thất bại');
        }
    }

    /**
     * Rate shared content
     */
    static async rateContent(userId: string, contentId: string, rating: number): Promise<void> {
        try {
            // Validate input
            const validatedRating = CreateContentRatingSchema.parse({
                userId,
                contentId,
                rating
            });

            // Check if content exists
            const content = await prisma.sharedContent.findUnique({
                where: { id: contentId }
            });

            if (!content) {
                throw new ValidationError('Nội dung không tồn tại');
            }

            // Check if user exists
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                throw new ValidationError('Người dùng không tồn tại');
            }

            // Use transaction to update rating
            await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
                // Upsert rating (create or update)
                const existingRating = await tx.contentRating.findUnique({
                    where: {
                        userId_contentId: {
                            userId,
                            contentId
                        }
                    }
                });

                if (existingRating) {
                    // Update existing rating
                    await tx.contentRating.update({
                        where: {
                            userId_contentId: {
                                userId,
                                contentId
                            }
                        },
                        data: {
                            rating: validatedRating.rating
                        }
                    });
                } else {
                    // Create new rating
                    await tx.contentRating.create({
                        data: {
                            userId,
                            contentId,
                            rating: validatedRating.rating
                        }
                    });
                }

                // Recalculate average rating
                const ratings = await tx.contentRating.findMany({
                    where: { contentId }
                });

                const totalRating = ratings.reduce((sum: number, r: any) => sum + r.rating, 0);
                const averageRating = totalRating / ratings.length;

                // Update shared content with new rating
                await tx.sharedContent.update({
                    where: { id: contentId },
                    data: {
                        rating: averageRating,
                        ratingCount: ratings.length
                    }
                });
            });

            // Invalidate related caches
            await cacheService.invalidatePattern('ai-prompt:community:*');

        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            console.error('Rate content failed:', error);
            throw new DatabaseError('Đánh giá nội dung thất bại');
        }
    }

    /**
     * Get content by ID with full details
     */
    static async getContentById(contentId: string): Promise<SharedContent | null> {
        try {
            const content = await prisma.sharedContent.findUnique({
                where: { id: contentId },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            school: true
                        }
                    },
                    _count: {
                        select: {
                            contentRatings: true,
                            userLibraries: true
                        }
                    }
                }
            });

            if (!content) {
                return null;
            }

            return {
                id: content.id,
                authorId: content.authorId,
                title: content.title,
                description: content.description,
                content: content.content,
                subject: content.subject,
                gradeLevel: content.gradeLevel as 6 | 7 | 8 | 9,
                tags: content.tags,
                rating: content.rating,
                ratingCount: content.ratingCount,
                createdAt: content.createdAt,
                updatedAt: content.updatedAt
            };

        } catch (error) {
            console.error('Get content by ID failed:', error);
            throw new DatabaseError('Lấy nội dung thất bại');
        }
    }

    /**
     * Get user's rating for specific content
     */
    static async getUserRating(userId: string, contentId: string): Promise<number | null> {
        try {
            const rating = await prisma.contentRating.findUnique({
                where: {
                    userId_contentId: {
                        userId,
                        contentId
                    }
                }
            });

            return rating ? rating.rating : null;

        } catch (error) {
            console.error('Get user rating failed:', error);
            throw new DatabaseError('Lấy đánh giá người dùng thất bại');
        }
    }

    /**
     * Get popular content (highest rated)
     */
    static async getPopularContent(limit: number = 10): Promise<SharedContent[]> {
        try {
            const content = await prisma.sharedContent.findMany({
                where: {
                    ratingCount: {
                        gte: 1 // At least one rating
                    }
                },
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
                    { ratingCount: 'desc' }
                ],
                take: limit
            });

            return content.map((item: any) => ({
                id: item.id,
                authorId: item.authorId,
                title: item.title,
                description: item.description,
                content: item.content,
                subject: item.subject,
                gradeLevel: item.gradeLevel as 6 | 7 | 8 | 9,
                tags: item.tags,
                rating: item.rating,
                ratingCount: item.ratingCount,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            }));

        } catch (error) {
            console.error('Get popular content failed:', error);
            throw new DatabaseError('Lấy nội dung phổ biến thất bại');
        }
    }

    /**
     * Get recent content
     */
    static async getRecentContent(limit: number = 10): Promise<SharedContent[]> {
        try {
            const content = await prisma.sharedContent.findMany({
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            school: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit
            });

            return content.map((item: any) => ({
                id: item.id,
                authorId: item.authorId,
                title: item.title,
                description: item.description,
                content: item.content,
                subject: item.subject,
                gradeLevel: item.gradeLevel as 6 | 7 | 8 | 9,
                tags: item.tags,
                rating: item.rating,
                ratingCount: item.ratingCount,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            }));

        } catch (error) {
            console.error('Get recent content failed:', error);
            throw new DatabaseError('Lấy nội dung mới thất bại');
        }
    }

    /**
     * Get content by subject and grade level
     */
    static async getContentBySubjectAndGrade(subject: string, gradeLevel: 6 | 7 | 8 | 9): Promise<SharedContent[]> {
        try {
            const content = await prisma.sharedContent.findMany({
                where: {
                    subject: {
                        contains: subject,
                        mode: 'insensitive'
                    },
                    gradeLevel
                },
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
                    { createdAt: 'desc' }
                ]
            });

            return content.map((item: any) => ({
                id: item.id,
                authorId: item.authorId,
                title: item.title,
                description: item.description,
                content: item.content,
                subject: item.subject,
                gradeLevel: item.gradeLevel as 6 | 7 | 8 | 9,
                tags: item.tags,
                rating: item.rating,
                ratingCount: item.ratingCount,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            }));

        } catch (error) {
            console.error('Get content by subject and grade failed:', error);
            throw new DatabaseError('Lấy nội dung theo môn học và lớp thất bại');
        }
    }

    /**
     * Share a generated prompt to community library
     */
    static async shareGeneratedPrompt(
        promptId: string,
        userId: string,
        shareData: {
            title: string;
            description: string;
            tags: string[];
        }
    ): Promise<SharedContent> {
        try {
            // Get the generated prompt
            const generatedPrompt = await prisma.generatedPrompt.findFirst({
                where: {
                    id: promptId,
                    userId
                }
            });

            if (!generatedPrompt) {
                throw new ValidationError('Prompt không tồn tại hoặc bạn không có quyền chia sẻ');
            }

            // Validate tags
            if (!validateTags(shareData.tags)) {
                throw new ValidationError('Một số thẻ tag không hợp lệ');
            }

            // Extract subject and grade level from input parameters
            const inputParams = generatedPrompt.inputParameters as any;
            const subject = inputParams.subject || 'Chung';
            const gradeLevel = inputParams.gradeLevel || 6;

            // Create shared content
            const sharedContent = await prisma.sharedContent.create({
                data: {
                    authorId: userId,
                    title: shareData.title,
                    description: shareData.description,
                    content: generatedPrompt.generatedText,
                    subject,
                    gradeLevel,
                    tags: shareData.tags,
                    rating: 0,
                    ratingCount: 0
                }
            });

            // Mark the original prompt as shared
            await prisma.generatedPrompt.update({
                where: { id: promptId },
                data: { isShared: true }
            });

            return {
                id: sharedContent.id,
                authorId: sharedContent.authorId,
                title: sharedContent.title,
                description: sharedContent.description,
                content: sharedContent.content,
                subject: sharedContent.subject,
                gradeLevel: sharedContent.gradeLevel as 6 | 7 | 8 | 9,
                tags: sharedContent.tags,
                rating: sharedContent.rating,
                ratingCount: sharedContent.ratingCount,
                createdAt: sharedContent.createdAt,
                updatedAt: sharedContent.updatedAt
            };

        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            console.error('Share generated prompt failed:', error);
            throw new DatabaseError('Chia sẻ prompt thất bại');
        }
    }

    /**
     * Get content by tags
     */
    static async getContentByTags(tags: string[]): Promise<SharedContent[]> {
        try {
            if (!validateTags(tags)) {
                throw new ValidationError('Một số thẻ tag không hợp lệ');
            }

            const content = await prisma.sharedContent.findMany({
                where: {
                    tags: {
                        hasSome: tags
                    }
                },
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
                ]
            });

            return content.map((item: any) => ({
                id: item.id,
                authorId: item.authorId,
                title: item.title,
                description: item.description,
                content: item.content,
                subject: item.subject,
                gradeLevel: item.gradeLevel as 6 | 7 | 8 | 9,
                tags: item.tags,
                rating: item.rating,
                ratingCount: item.ratingCount,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            }));

        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            console.error('Get content by tags failed:', error);
            throw new DatabaseError('Lấy nội dung theo thẻ tag thất bại');
        }
    }

    /**
     * Get suggested tags based on content
     */
    static async getSuggestedTags(content: string, subject?: string): Promise<string[]> {
        try {
            const suggestions: string[] = [];
            const contentLower = content.toLowerCase();

            // Add subject-specific tags
            if (subject) {
                const subjectTag = EDUCATIONAL_TAGS.SUBJECTS.find(tag =>
                    tag.toLowerCase().includes(subject.toLowerCase())
                );
                if (subjectTag) {
                    suggestions.push(subjectTag);
                }
            }

            // Add standard tags based on content analysis
            if (contentLower.includes('5512') || contentLower.includes('công văn')) {
                suggestions.push('#Chuẩn5512');
            }

            if (contentLower.includes('2018') || contentLower.includes('chương trình')) {
                suggestions.push('#GDPT2018');
            }

            if (contentLower.includes('sáng tạo') || contentLower.includes('creative')) {
                suggestions.push('#SángTạo');
            }

            if (contentLower.includes('hoạt động') || contentLower.includes('activity')) {
                suggestions.push('#HoạtĐộngMới');
            }

            if (contentLower.includes('nhóm') || contentLower.includes('group')) {
                suggestions.push('#HợpTácNhóm');
            }

            if (contentLower.includes('thực hành') || contentLower.includes('practice')) {
                suggestions.push('#ThựcHành');
            }

            if (contentLower.includes('dự án') || contentLower.includes('project')) {
                suggestions.push('#DựÁn');
            }

            // Remove duplicates and limit to 5 suggestions
            return [...new Set(suggestions)].slice(0, 5);

        } catch (error) {
            console.error('Get suggested tags failed:', error);
            return [];
        }
    }

    /**
     * Update shared content tags
     */
    static async updateContentTags(contentId: string, userId: string, tags: string[]): Promise<void> {
        try {
            // Validate tags
            if (!validateTags(tags)) {
                throw new ValidationError('Một số thẻ tag không hợp lệ');
            }

            // Check if user is the author
            const content = await prisma.sharedContent.findFirst({
                where: {
                    id: contentId,
                    authorId: userId
                }
            });

            if (!content) {
                throw new ValidationError('Nội dung không tồn tại hoặc bạn không có quyền chỉnh sửa');
            }

            // Update tags
            await prisma.sharedContent.update({
                where: { id: contentId },
                data: { tags }
            });

        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            console.error('Update content tags failed:', error);
            throw new DatabaseError('Cập nhật thẻ tag thất bại');
        }
    }

    /**
     * Get trending tags
     */
    static async getTrendingTags(limit: number = 10): Promise<Array<{ tag: string; count: number }>> {
        try {
            // Get all shared content with tags
            const content = await prisma.sharedContent.findMany({
                select: {
                    tags: true
                },
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                    }
                }
            });

            // Count tag occurrences
            const tagCounts: Record<string, number> = {};
            content.forEach((item: any) => {
                item.tags.forEach((tag: string) => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            });

            // Sort by count and return top tags
            return Object.entries(tagCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, limit)
                .map(([tag, count]) => ({ tag, count }));

        } catch (error) {
            console.error('Get trending tags failed:', error);
            throw new DatabaseError('Lấy thẻ tag thịnh hành thất bại');
        }
    }

    /**
     * Get all ratings for a specific content
     */
    static async getContentRatings(contentId: string): Promise<Array<{
        id: string;
        rating: number;
        userName: string;
        userId: string;
    }>> {
        try {
            const ratings = await prisma.contentRating.findMany({
                where: { contentId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                orderBy: {
                    rating: 'desc'
                }
            });

            return ratings.map((rating: any) => ({
                id: rating.id,
                rating: rating.rating,
                userName: rating.user.name,
                userId: rating.user.id
            }));

        } catch (error) {
            console.error('Get content ratings failed:', error);
            throw new DatabaseError('Lấy đánh giá nội dung thất bại');
        }
    }

    /**
     * Get rating statistics for content
     */
    static async getRatingStatistics(contentId: string): Promise<{
        averageRating: number;
        totalRatings: number;
        ratingDistribution: Record<number, number>;
    }> {
        try {
            const ratings = await prisma.contentRating.findMany({
                where: { contentId },
                select: { rating: true }
            });

            if (ratings.length === 0) {
                return {
                    averageRating: 0,
                    totalRatings: 0,
                    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
                };
            }

            const totalRating = ratings.reduce((sum: number, r: any) => sum + r.rating, 0);
            const averageRating = totalRating / ratings.length;

            // Calculate distribution
            const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            ratings.forEach((r: any) => {
                distribution[r.rating] = (distribution[r.rating] || 0) + 1;
            });

            return {
                averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
                totalRatings: ratings.length,
                ratingDistribution: distribution
            };

        } catch (error) {
            console.error('Get rating statistics failed:', error);
            throw new DatabaseError('Lấy thống kê đánh giá thất bại');
        }
    }

    /**
     * Remove user's rating for content
     */
    static async removeRating(userId: string, contentId: string): Promise<void> {
        try {
            // Check if rating exists
            const existingRating = await prisma.contentRating.findUnique({
                where: {
                    userId_contentId: {
                        userId,
                        contentId
                    }
                }
            });

            if (!existingRating) {
                throw new ValidationError('Đánh giá không tồn tại');
            }

            // Use transaction to remove rating and update content
            await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
                // Remove the rating
                await tx.contentRating.delete({
                    where: {
                        userId_contentId: {
                            userId,
                            contentId
                        }
                    }
                });

                // Recalculate average rating
                const remainingRatings = await tx.contentRating.findMany({
                    where: { contentId }
                });

                let averageRating = 0;
                if (remainingRatings.length > 0) {
                    const totalRating = remainingRatings.reduce((sum: number, r: any) => sum + r.rating, 0);
                    averageRating = totalRating / remainingRatings.length;
                }

                // Update shared content
                await tx.sharedContent.update({
                    where: { id: contentId },
                    data: {
                        rating: averageRating,
                        ratingCount: remainingRatings.length
                    }
                });
            });

        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            console.error('Remove rating failed:', error);
            throw new DatabaseError('Xóa đánh giá thất bại');
        }
    }

    /**
     * Get user's ratings history
     */
    static async getUserRatings(userId: string): Promise<Array<{
        contentId: string;
        contentTitle: string;
        rating: number;
        contentAuthor: string;
    }>> {
        try {
            const ratings = await prisma.contentRating.findMany({
                where: { userId },
                include: {
                    content: {
                        select: {
                            id: true,
                            title: true,
                            author: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    content: {
                        createdAt: 'desc'
                    }
                }
            });

            return ratings.map((rating: any) => ({
                contentId: rating.content.id,
                contentTitle: rating.content.title,
                rating: rating.rating,
                contentAuthor: rating.content.author.name
            }));

        } catch (error) {
            console.error('Get user ratings failed:', error);
            throw new DatabaseError('Lấy lịch sử đánh giá thất bại');
        }
    }

    /**
     * Get top rated content by time period
     */
    static async getTopRatedContent(
        period: 'week' | 'month' | 'year' | 'all' = 'month',
        limit: number = 10
    ): Promise<SharedContent[]> {
        try {
            let dateFilter: Date | undefined;

            switch (period) {
                case 'week':
                    dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case 'year':
                    dateFilter = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
                    break;
                case 'all':
                default:
                    dateFilter = undefined;
                    break;
            }

            const where: any = {
                ratingCount: {
                    gte: 1 // At least one rating
                }
            };

            if (dateFilter) {
                where.createdAt = {
                    gte: dateFilter
                };
            }

            const content = await prisma.sharedContent.findMany({
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
                    { ratingCount: 'desc' }
                ],
                take: limit
            });

            return content.map((item: any) => ({
                id: item.id,
                authorId: item.authorId,
                title: item.title,
                description: item.description,
                content: item.content,
                subject: item.subject,
                gradeLevel: item.gradeLevel as 6 | 7 | 8 | 9,
                tags: item.tags,
                rating: item.rating,
                ratingCount: item.ratingCount,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            }));

        } catch (error) {
            console.error('Get top rated content failed:', error);
            throw new DatabaseError('Lấy nội dung được đánh giá cao thất bại');
        }
    }

    /**
     * Check if user can rate content (not their own content)
     */
    static async canUserRateContent(userId: string, contentId: string): Promise<boolean> {
        try {
            const content = await prisma.sharedContent.findUnique({
                where: { id: contentId },
                select: { authorId: true }
            });

            if (!content) {
                return false;
            }

            // Users cannot rate their own content
            return content.authorId !== userId;

        } catch (error) {
            console.error('Check user can rate content failed:', error);
            return false;
        }
    }

    /**
     * Save community content to user's personal library
     */
    static async saveToPersonalLibrary(userId: string, contentId: string): Promise<void> {
        try {
            // Check if content exists
            const content = await prisma.sharedContent.findUnique({
                where: { id: contentId }
            });

            if (!content) {
                throw new ValidationError('Nội dung không tồn tại');
            }

            // Check if user exists
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                throw new ValidationError('Người dùng không tồn tại');
            }

            // Check if already saved
            const existingSave = await prisma.userLibrary.findUnique({
                where: {
                    userId_contentId: {
                        userId,
                        contentId
                    }
                }
            });

            if (existingSave) {
                throw new ValidationError('Nội dung đã được lưu trong thư viện cá nhân');
            }

            // Save to personal library
            await prisma.userLibrary.create({
                data: {
                    userId,
                    contentId
                }
            });

        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            console.error('Save to personal library failed:', error);
            throw new DatabaseError('Lưu vào thư viện cá nhân thất bại');
        }
    }

    /**
     * Remove content from user's personal library
     */
    static async removeFromPersonalLibrary(userId: string, contentId: string): Promise<void> {
        try {
            // Check if saved
            const existingSave = await prisma.userLibrary.findUnique({
                where: {
                    userId_contentId: {
                        userId,
                        contentId
                    }
                }
            });

            if (!existingSave) {
                throw new ValidationError('Nội dung không có trong thư viện cá nhân');
            }

            // Remove from personal library
            await prisma.userLibrary.delete({
                where: {
                    userId_contentId: {
                        userId,
                        contentId
                    }
                }
            });

        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            console.error('Remove from personal library failed:', error);
            throw new DatabaseError('Xóa khỏi thư viện cá nhân thất bại');
        }
    }

    /**
     * Get user's saved content from community library
     */
    static async getUserSavedContent(userId: string): Promise<SharedContent[]> {
        try {
            const savedContent = await prisma.userLibrary.findMany({
                where: { userId },
                include: {
                    content: {
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    name: true,
                                    school: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    savedAt: 'desc'
                }
            });

            return savedContent.map((item: any) => ({
                id: item.content.id,
                authorId: item.content.authorId,
                title: item.content.title,
                description: item.content.description,
                content: item.content.content,
                subject: item.content.subject,
                gradeLevel: item.content.gradeLevel as 6 | 7 | 8 | 9,
                tags: item.content.tags,
                rating: item.content.rating,
                ratingCount: item.content.ratingCount,
                createdAt: item.content.createdAt,
                updatedAt: item.content.updatedAt
            }));

        } catch (error) {
            console.error('Get user saved content failed:', error);
            throw new DatabaseError('Lấy nội dung đã lưu thất bại');
        }
    }

    /**
     * Check if content is saved in user's personal library
     */
    static async isContentSaved(userId: string, contentId: string): Promise<boolean> {
        try {
            const saved = await prisma.userLibrary.findUnique({
                where: {
                    userId_contentId: {
                        userId,
                        contentId
                    }
                }
            });

            return !!saved;

        } catch (error) {
            console.error('Check if content is saved failed:', error);
            return false;
        }
    }

    /**
     * Adapt community content for personal use (create a copy as generated prompt)
     */
    static async adaptContentForPersonalUse(
        userId: string,
        contentId: string,
        adaptationData: {
            subject?: string;
            gradeLevel?: 6 | 7 | 8 | 9;
            customizations?: string;
        }
    ): Promise<string> {
        try {
            // Get the shared content
            const sharedContent = await prisma.sharedContent.findUnique({
                where: { id: contentId }
            });

            if (!sharedContent) {
                throw new ValidationError('Nội dung không tồn tại');
            }

            // Check if user exists
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                throw new ValidationError('Người dùng không tồn tại');
            }

            // Create adapted input parameters
            const inputParameters = {
                subject: adaptationData.subject || sharedContent.subject,
                gradeLevel: adaptationData.gradeLevel || sharedContent.gradeLevel,
                lessonName: `Adapted: ${sharedContent.title}`,
                pedagogicalStandard: 'GDPT 2018',
                outputFormat: 'adapted',
                customizations: adaptationData.customizations || '',
                originalContentId: contentId
            };

            // Create adapted content
            let adaptedContent = sharedContent.content;

            if (adaptationData.customizations) {
                adaptedContent += `\n\n--- Tùy chỉnh ---\n${adaptationData.customizations}`;
            }

            if (adaptationData.subject && adaptationData.subject !== sharedContent.subject) {
                adaptedContent = adaptedContent.replace(
                    new RegExp(sharedContent.subject, 'gi'),
                    adaptationData.subject
                );
            }

            // Save as new generated prompt
            const generatedPrompt = await prisma.generatedPrompt.create({
                data: {
                    userId,
                    inputParameters,
                    generatedText: adaptedContent,
                    targetTool: 'adapted',
                    isShared: false,
                    tags: [...sharedContent.tags, '#Adapted']
                }
            });

            return generatedPrompt.id;

        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            console.error('Adapt content for personal use failed:', error);
            throw new DatabaseError('Tùy chỉnh nội dung thất bại');
        }
    }

    /**
     * Get content save statistics
     */
    static async getContentSaveStatistics(contentId: string): Promise<{
        totalSaves: number;
        recentSaves: number; // Last 7 days
    }> {
        try {
            const [totalSaves, recentSaves] = await Promise.all([
                prisma.userLibrary.count({
                    where: { contentId }
                }),
                prisma.userLibrary.count({
                    where: {
                        contentId,
                        savedAt: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        }
                    }
                })
            ]);

            return {
                totalSaves,
                recentSaves
            };

        } catch (error) {
            console.error('Get content save statistics failed:', error);
            throw new DatabaseError('Lấy thống kê lưu nội dung thất bại');
        }
    }
}