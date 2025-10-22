/**
 * Moderation-related type definitions
 */

export enum ModerationFlag {
    INAPPROPRIATE_CONTENT = 'inappropriate_content',
    SPAM = 'spam',
    COPYRIGHT_VIOLATION = 'copyright_violation',
    MISLEADING_INFORMATION = 'misleading_information',
    OFFENSIVE_LANGUAGE = 'offensive_language',
    NON_EDUCATIONAL = 'non_educational',
    DUPLICATE_CONTENT = 'duplicate_content'
}

export interface ModerationReport {
    id: string;
    contentId: string;
    reporterId: string;
    flag: ModerationFlag;
    reason: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    createdAt: Date;
    reviewedAt?: Date;
    reviewedBy?: string;
    moderatorNotes?: string;
}

export interface ModerationReportWithDetails extends ModerationReport {
    content: {
        title: string;
        authorName: string;
    };
    reporter: {
        name: string;
    };
}

export interface ContentValidation {
    isValid: boolean;
    issues: string[];
    recommendations?: string[];
}

export interface ModerationStats {
    totalReports: number;
    pendingReports: number;
    resolvedReports: number;
    dismissedReports: number;
    topFlags: Array<{ flag: string; count: number }>;
}

export const MODERATION_FLAG_LABELS: Record<ModerationFlag, string> = {
    [ModerationFlag.INAPPROPRIATE_CONTENT]: 'Nội dung không phù hợp',
    [ModerationFlag.SPAM]: 'Spam/Rác',
    [ModerationFlag.COPYRIGHT_VIOLATION]: 'Vi phạm bản quyền',
    [ModerationFlag.MISLEADING_INFORMATION]: 'Thông tin sai lệch',
    [ModerationFlag.OFFENSIVE_LANGUAGE]: 'Ngôn ngữ xúc phạm',
    [ModerationFlag.NON_EDUCATIONAL]: 'Không có tính giáo dục',
    [ModerationFlag.DUPLICATE_CONTENT]: 'Nội dung trùng lặp'
};

export const MODERATION_STATUS_LABELS: Record<string, string> = {
    pending: 'Chờ xử lý',
    reviewed: 'Đã xem xét',
    resolved: 'Đã giải quyết',
    dismissed: 'Đã bác bỏ'
};