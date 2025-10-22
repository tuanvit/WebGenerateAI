import { z } from 'zod';
import { VIETNAMESE_SUBJECTS, GRADE_LEVELS, type GradeLevel, type VietnameseSubject } from './user';

// Library and sharing types
export interface SharedContent {
    id: string;
    authorId: string;
    title: string;
    description: string;
    content: string;
    subject: string;
    gradeLevel: GradeLevel;
    tags: string[];
    rating: number;
    ratingCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ContentRating {
    id: string;
    userId: string;
    contentId: string;
    rating: number; // 1-5 scale
}

export interface UserLibrary {
    id: string;
    userId: string;
    contentId: string;
    savedAt: Date;
}

export interface SearchFilters {
    subject?: string;
    gradeLevel?: GradeLevel;
    topic?: string;
    tags?: string[];
    rating?: number;
    author?: string;
}

export interface LibraryFilters {
    subject?: string;
    gradeLevel?: GradeLevel;
    tags?: string[];
    dateFrom?: Date;
    dateTo?: Date;
}

export interface ShareableContent {
    title: string;
    description: string;
    content: string;
    subject: string;
    gradeLevel: GradeLevel;
    tags: string[];
}

// Zod validation schemas
export const SharedContentSchema = z.object({
    id: z.string(),
    authorId: z.string(),
    title: z.string().min(1, 'Tiêu đề không được để trống').max(200, 'Tiêu đề quá dài'),
    description: z.string().min(1, 'Mô tả không được để trống').max(500, 'Mô tả quá dài'),
    content: z.string().min(10, 'Nội dung quá ngắn').max(10000, 'Nội dung quá dài'),
    subject: z.string().min(1, 'Vui lòng chọn môn học'),
    gradeLevel: z.number().min(6).max(9, 'Chỉ hỗ trợ khối lớp 6-9'),
    tags: z.array(z.string()).max(10, 'Tối đa 10 thẻ tag'),
    rating: z.number().min(0).max(5),
    ratingCount: z.number().min(0),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const CreateSharedContentSchema = z.object({
    authorId: z.string(),
    title: z.string().min(1, 'Tiêu đề không được để trống').max(200, 'Tiêu đề quá dài'),
    description: z.string().min(1, 'Mô tả không được để trống').max(500, 'Mô tả quá dài'),
    content: z.string().min(10, 'Nội dung quá ngắn').max(10000, 'Nội dung quá dài'),
    subject: z.string().min(1, 'Vui lòng chọn môn học'),
    gradeLevel: z.number().min(6).max(9, 'Chỉ hỗ trợ khối lớp 6-9'),
    tags: z.array(z.string()).max(10, 'Tối đa 10 thẻ tag').default([]),
});

export const ContentRatingSchema = z.object({
    id: z.string(),
    userId: z.string(),
    contentId: z.string(),
    rating: z.number().min(1, 'Đánh giá tối thiểu là 1 sao').max(5, 'Đánh giá tối đa là 5 sao'),
});

export const CreateContentRatingSchema = z.object({
    userId: z.string(),
    contentId: z.string(),
    rating: z.number().min(1, 'Đánh giá tối thiểu là 1 sao').max(5, 'Đánh giá tối đa là 5 sao'),
});

export const UserLibrarySchema = z.object({
    id: z.string(),
    userId: z.string(),
    contentId: z.string(),
    savedAt: z.date(),
});

export const SearchFiltersSchema = z.object({
    subject: z.string().optional(),
    gradeLevel: z.number().min(6).max(9).optional(),
    topic: z.string().max(100, 'Từ khóa tìm kiếm quá dài').optional(),
    tags: z.array(z.string()).optional(),
    rating: z.number().min(1).max(5).optional(),
    author: z.string().max(100, 'Tên tác giả quá dài').optional(),
});

export const LibraryFiltersSchema = z.object({
    subject: z.string().optional(),
    gradeLevel: z.number().min(6).max(9).optional(),
    tags: z.array(z.string()).optional(),
    dateFrom: z.date().optional(),
    dateTo: z.date().optional(),
});

export const ShareableContentSchema = z.object({
    title: z.string().min(1, 'Tiêu đề không được để trống').max(200, 'Tiêu đề quá dài'),
    description: z.string().min(1, 'Mô tả không được để trống').max(500, 'Mô tả quá dài'),
    content: z.string().min(10, 'Nội dung quá ngắn').max(10000, 'Nội dung quá dài'),
    subject: z.string().min(1, 'Vui lòng chọn môn học'),
    gradeLevel: z.number().min(6).max(9, 'Chỉ hỗ trợ khối lớp 6-9'),
    tags: z.array(z.string()).max(10, 'Tối đa 10 thẻ tag').default([]),
});