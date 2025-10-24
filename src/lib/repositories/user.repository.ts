import { Prisma, User } from '@prisma/client';
import { z } from 'zod';
import type { CreateUserSchema, UpdateUserSchema } from '../../types/user';
import { BaseRepository } from './base.repository';

type CreateUserInput = z.infer<typeof CreateUserSchema>;
type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export class UserRepository extends BaseRepository<User, CreateUserInput, UpdateUserInput> {
    /**
     * Create a new user
     */
    async create(data: CreateUserInput): Promise<User> {
        try {
            return await this.db.user.create({
                data: {
                    email: data.email,
                    name: data.name,
                    school: data.school,
                    subjects: data.subjects ? JSON.stringify(data.subjects) : null,
                    gradeLevel: data.gradeLevel ? JSON.stringify(data.gradeLevel) : null,
                    lastLoginAt: new Date(),
                },
            });
        } catch (error) {
            this.handleError(error, 'tạo người dùng');
        }
    }

    /**
     * Find user by ID
     */
    async findById(id: string): Promise<User | null> {
        try {
            return await this.db.user.findUnique({
                where: { id },
            });
        } catch (error) {
            this.handleError(error, 'tìm người dùng theo ID');
        }
    }

    /**
     * Find user by email
     */
    async findByEmail(email: string): Promise<User | null> {
        try {
            return await this.db.user.findUnique({
                where: { email },
            });
        } catch (error) {
            this.handleError(error, 'tìm người dùng theo email');
        }
    }

    /**
     * Update user by ID
     */
    async update(id: string, data: UpdateUserInput): Promise<User> {
        try {
            const updateData: any = {};
            if (data.email !== undefined) updateData.email = data.email;
            if (data.name !== undefined) updateData.name = data.name;
            if (data.school !== undefined) updateData.school = data.school;
            if (data.subjects !== undefined) updateData.subjects = data.subjects ? JSON.stringify(data.subjects) : null;
            if (data.gradeLevel !== undefined) updateData.gradeLevel = data.gradeLevel ? JSON.stringify(data.gradeLevel) : null;

            return await this.db.user.update({
                where: { id },
                data: updateData,
            });
        } catch (error) {
            this.handleError(error, 'cập nhật người dùng');
        }
    }

    /**
     * Update user's last login time
     */
    async updateLastLogin(id: string): Promise<User> {
        try {
            return await this.db.user.update({
                where: { id },
                data: { lastLoginAt: new Date() },
            });
        } catch (error) {
            this.handleError(error, 'cập nhật thời gian đăng nhập');
        }
    }

    /**
     * Delete user by ID
     */
    async delete(id: string): Promise<void> {
        try {
            await this.db.user.delete({
                where: { id },
            });
        } catch (error) {
            this.handleError(error, 'xóa người dùng');
        }
    }

    /**
     * Find users with optional filtering
     */
    async findMany(filters?: {
        subjects?: string[];
        gradeLevel?: number[];
        school?: string;
        limit?: number;
        offset?: number;
    }): Promise<User[]> {
        try {
            const where: Prisma.UserWhereInput = {};

            // For JSON string fields, we need to use contains to search within the JSON
            if (filters?.subjects?.length) {
                where.OR = filters.subjects.map(subject => ({
                    subjects: {
                        contains: subject,
                    }
                }));
            }

            if (filters?.gradeLevel?.length) {
                where.OR = filters.gradeLevel.map(grade => ({
                    gradeLevel: {
                        contains: String(grade),
                    }
                }));
            }

            if (filters?.school) {
                where.school = {
                    contains: filters.school,
                    mode: 'insensitive',
                };
            }

            return await this.db.user.findMany({
                where,
                take: filters?.limit,
                skip: filters?.offset,
                orderBy: { createdAt: 'desc' },
            });
        } catch (error) {
            this.handleError(error, 'tìm danh sách người dùng');
        }
    }

    /**
     * Get user statistics
     */
    async getUserStats(userId: string): Promise<{
        totalPrompts: number;
        sharedContent: number;
        savedContent: number;
    }> {
        try {
            const [totalPrompts, sharedContent, savedContent] = await Promise.all([
                this.db.generatedPrompt.count({ where: { userId } }),
                this.db.sharedContent.count({ where: { authorId: userId } }),
                this.db.userLibrary.count({ where: { userId } }),
            ]);

            return {
                totalPrompts,
                sharedContent,
                savedContent,
            };
        } catch (error) {
            this.handleError(error, 'lấy thống kê người dùng');
        }
    }
}