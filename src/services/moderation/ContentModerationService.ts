import { prisma } from '../../lib/db';
import { Prisma } from '@prisma/client';
import { DatabaseError, ValidationError } from '../../types/services';
import {
    ModerationFlag,
    ModerationReport,
    ModerationReportWithDetails,
    ContentValidation,
    ModerationStats
} from '../../types/moderation';

/**
 * Content Moderation Service
 * Handles content reporting, review, and automated moderation
 */
export class ContentModerationService {
    /**
     * Report content for moderation
     */
    static async reportContent(
        contentId: string,
        reporterId: string,
        flag: ModerationFlag,
        reason: string
    ): Promise<ModerationReport> {
        try {
            // Validate inputs
            if (!contentId || !reporterId || !flag || !reason) {
                throw new ValidationError('Thiếu thông tin báo cáo');
            }

            if (reason.length < 10 || reason.length > 500) {
                throw new ValidationError('Lý do báo cáo phải từ 10-500 ký tự');
            }

            // Check if content exists
            const content = await prisma.sharedContent.findUnique({
                where: { id: contentId }
            });

            if (!content) {
                throw new ValidationError('Nội dung không tồn tại');
            }

            // Check if user exists
            const user = await prisma.user.findUnique({
                where: { id: reporterId }
            });

            if (!user) {
                throw new ValidationError('Người dùng không tồn tại');
            }

            // Check if user already reported this content
            const existingReport = await prisma.moderationReport.findFirst({
                where: {
                    contentId,
                    reporterId,
                    status: {
                        in: ['pending', 'reviewed']
                    }
                }
            });

            if (existingReport) {
                throw new ValidationError('Bạn đã báo cáo nội dung này rồi');
            }

            // Create moderation report
            const report = await prisma.moderationReport.create({
                data: {
                    contentId,
                    reporterId,
                    flag,
                    reason,
                    status: 'pending'
                }
            });

            // Auto-moderate if multiple reports
            await this.checkAutoModeration(contentId);

            return {
                id: report.id,
                contentId: report.contentId,
                reporterId: report.reporterId,
                flag: report.flag as ModerationFlag,
                reason: report.reason,
                status: report.status as 'pending' | 'reviewed' | 'resolved' | 'dismissed',
                createdAt: report.createdAt,
                reviewedAt: report.reviewedAt || undefined,
                reviewedBy: report.reviewedBy || undefined,
                moderatorNotes: report.moderatorNotes || undefined
            };

        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            console.error('Report content failed:', error);
            throw new DatabaseError('Báo cáo nội dung thất bại');
        }
    }

    /**
     * Get pending moderation reports (admin only)
     */
    static async getPendingReports(limit: number = 20): Promise<ModerationReportWithDetails[]> {
        try {
            const reports = await prisma.moderationReport.findMany({
                where: {
                    status: 'pending'
                },
                include: {
                    content: {
                        select: {
                            title: true,
                            author: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },
                    reporter: {
                        select: {
                            name: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit
            });

            return reports.map((report: any) => ({
                id: report.id,
                contentId: report.contentId,
                reporterId: report.reporterId,
                flag: report.flag as ModerationFlag,
                reason: report.reason,
                status: report.status as 'pending' | 'reviewed' | 'resolved' | 'dismissed',
                createdAt: report.createdAt,
                reviewedAt: report.reviewedAt || undefined,
                reviewedBy: report.reviewedBy || undefined,
                moderatorNotes: report.moderatorNotes || undefined,
                content: {
                    title: report.content.title,
                    authorName: report.content.author.name
                },
                reporter: {
                    name: report.reporter.name
                }
            }));

        } catch (error) {
            console.error('Get pending reports failed:', error);
            throw new DatabaseError('Lấy báo cáo chờ xử lý thất bại');
        }
    }

    /**
     * Review moderation report (admin only)
     */
    static async reviewReport(
        reportId: string,
        reviewerId: string,
        action: 'approve' | 'dismiss',
        moderatorNotes?: string
    ): Promise<void> {
        try {
            // Validate inputs
            if (!reportId || !reviewerId || !action) {
                throw new ValidationError('Thiếu thông tin xem xét');
            }

            // Check if report exists
            const report = await prisma.moderationReport.findUnique({
                where: { id: reportId },
                include: {
                    content: true
                }
            });

            if (!report) {
                throw new ValidationError('Báo cáo không tồn tại');
            }

            if (report.status !== 'pending') {
                throw new ValidationError('Báo cáo đã được xem xét');
            }

            // Check if reviewer exists
            const reviewer = await prisma.user.findUnique({
                where: { id: reviewerId }
            });

            if (!reviewer) {
                throw new ValidationError('Người xem xét không tồn tại');
            }

            await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
                // Update report status
                await tx.moderationReport.update({
                    where: { id: reportId },
                    data: {
                        status: action === 'approve' ? 'resolved' : 'dismissed',
                        reviewedAt: new Date(),
                        reviewedBy: reviewerId,
                        moderatorNotes: moderatorNotes || null
                    }
                });

                // If approved, take action on content
                if (action === 'approve') {
                    // For now, we'll just mark content as flagged
                    // In a full implementation, you might want to hide or remove content
                    await tx.sharedContent.update({
                        where: { id: report.contentId },
                        data: {
                            // Add a moderation flag to the content
                            // This would require adding a field to the schema
                            updatedAt: new Date()
                        }
                    });
                }
            });

        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            console.error('Review report failed:', error);
            throw new DatabaseError('Xem xét báo cáo thất bại');
        }
    }

    /**
     * Get content reports for a specific content
     */
    static async getContentReports(contentId: string): Promise<ModerationReport[]> {
        try {
            const reports = await prisma.moderationReport.findMany({
                where: { contentId },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            return reports.map((report: any) => ({
                id: report.id,
                contentId: report.contentId,
                reporterId: report.reporterId,
                flag: report.flag as ModerationFlag,
                reason: report.reason,
                status: report.status as 'pending' | 'reviewed' | 'resolved' | 'dismissed',
                createdAt: report.createdAt,
                reviewedAt: report.reviewedAt || undefined,
                reviewedBy: report.reviewedBy || undefined,
                moderatorNotes: report.moderatorNotes || undefined
            }));

        } catch (error) {
            console.error('Get content reports failed:', error);
            throw new DatabaseError('Lấy báo cáo nội dung thất bại');
        }
    }

    /**
     * Check if content should be auto-moderated based on reports
     */
    private static async checkAutoModeration(contentId: string): Promise<void> {
        try {
            const reportCount = await prisma.moderationReport.count({
                where: {
                    contentId,
                    status: 'pending'
                }
            });

            // Auto-hide content if it has 3 or more pending reports
            if (reportCount >= 3) {
                // In a full implementation, you might want to automatically hide the content
                // For now, we'll just log it
                console.log(`Content ${contentId} has ${reportCount} reports - consider auto-moderation`);
            }

        } catch (error) {
            console.error('Auto-moderation check failed:', error);
        }
    }

    /**
     * Validate content for educational appropriateness
     */
    static validateEducationalContent(content: string, subject?: string): ContentValidation {
        const issues: string[] = [];

        // Basic length validation
        if (!content || content.trim().length === 0) {
            issues.push('Nội dung không được để trống');
        }

        if (content.length < 50) {
            issues.push('Nội dung quá ngắn (tối thiểu 50 ký tự)');
        }

        if (content.length > 10000) {
            issues.push('Nội dung quá dài (tối đa 10,000 ký tự)');
        }

        // Check for inappropriate content patterns
        const inappropriatePatterns = [
            /\b(fuck|shit|damn|hell)\b/gi,
            /\b(sex|porn|nude)\b/gi,
            /\b(violence|kill|murder)\b/gi
        ];

        inappropriatePatterns.forEach(pattern => {
            if (pattern.test(content)) {
                issues.push('Nội dung chứa từ ngữ không phù hợp');
            }
        });

        // Check for educational relevance
        const educationalKeywords = [
            'học', 'giáo', 'bài', 'kiến thức', 'kỹ năng', 'năng lực',
            'hoạt động', 'thực hành', 'dự án', 'đánh giá'
        ];

        const hasEducationalContent = educationalKeywords.some(keyword =>
            content.toLowerCase().includes(keyword)
        );

        if (!hasEducationalContent) {
            issues.push('Nội dung có thể không phù hợp với mục đích giáo dục');
        }

        // Subject-specific validation
        if (subject) {
            const subjectLower = subject.toLowerCase();
            if (!content.toLowerCase().includes(subjectLower)) {
                issues.push(`Nội dung có thể không liên quan đến môn ${subject}`);
            }
        }

        return {
            isValid: issues.length === 0,
            issues
        };
    }

    /**
     * Get moderation statistics
     */
    static async getModerationStats(): Promise<ModerationStats> {
        try {
            const [
                totalReports,
                pendingReports,
                resolvedReports,
                dismissedReports,
                flagStats
            ] = await Promise.all([
                prisma.moderationReport.count(),
                prisma.moderationReport.count({ where: { status: 'pending' } }),
                prisma.moderationReport.count({ where: { status: 'resolved' } }),
                prisma.moderationReport.count({ where: { status: 'dismissed' } }),
                prisma.moderationReport.groupBy({
                    by: ['flag'],
                    _count: {
                        flag: true
                    },
                    orderBy: {
                        _count: {
                            flag: 'desc'
                        }
                    },
                    take: 5
                })
            ]);

            const topFlags = flagStats.map((stat: any) => ({
                flag: stat.flag,
                count: stat._count.flag
            }));

            return {
                totalReports,
                pendingReports,
                resolvedReports,
                dismissedReports,
                topFlags
            };

        } catch (error) {
            console.error('Get moderation stats failed:', error);
            throw new DatabaseError('Lấy thống kê kiểm duyệt thất bại');
        }
    }
}