import { z } from 'zod';

// User and authentication types
export interface User {
    id: string;
    email: string;
    name: string;
    school?: string;
    subjects: string[];
    gradeLevel: (6 | 7 | 8 | 9)[];  // Restricted to grades 6-9 only
    createdAt: Date;
    lastLoginAt: Date;
}

// Zod validation schemas
export const UserSchema = z.object({
    id: z.string(),
    email: z.string().email('Email không hợp lệ'),
    name: z.string().min(1, 'Tên không được để trống').max(100, 'Tên quá dài'),
    school: z.string().max(200, 'Tên trường quá dài').optional(),
    subjects: z.array(z.string()).min(1, 'Phải chọn ít nhất một môn học'),
    gradeLevel: z.array(z.union([z.literal(6), z.literal(7), z.literal(8), z.literal(9)]))
        .min(1, 'Phải chọn ít nhất một khối lớp'),
    createdAt: z.date(),
    lastLoginAt: z.date(),
});

export const CreateUserSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    name: z.string().min(1, 'Tên không được để trống').max(100, 'Tên quá dài'),
    school: z.string().max(200, 'Tên trường quá dài').optional(),
    subjects: z.array(z.string()).min(1, 'Phải chọn ít nhất một môn học'),
    gradeLevel: z.array(z.union([z.literal(6), z.literal(7), z.literal(8), z.literal(9)]))
        .min(1, 'Phải chọn ít nhất một khối lớp'),
});

export const UpdateUserSchema = CreateUserSchema.partial();

// Vietnamese subjects for validation
export const VIETNAMESE_SUBJECTS = [
    'Toán học',
    'Ngữ văn',
    'Tiếng Anh',
    'Vật lý',
    'Hóa học',
    'Sinh học',
    'Lịch sử',
    'Địa lý',
    'Giáo dục công dân',
    'Tin học',
    'Công nghệ',
    'Âm nhạc',
    'Mỹ thuật',
    'Thể dục'
] as const;

export type VietnameseSubject = typeof VIETNAMESE_SUBJECTS[number];

// Grade levels for Vietnamese middle school
export const GRADE_LEVELS = [6, 7, 8, 9] as const;
export type GradeLevel = typeof GRADE_LEVELS[number];