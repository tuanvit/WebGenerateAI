import { User, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';
import type { CreateUserSchema, UpdateUserSchema } from '../../types/user';
import { z } from 'zod';

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
                    ...data,
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
            return await this.db.user.update({
                where: { id },
                data,
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

            if (filters?.subjects?.length) {
                where.subjects = {
                    hasSome: filters.subjects,
                };
            }

            if (filters?.gradeLevel?.length) {
                where.gradeLevel = {
                    hasSome: filters.gradeLevel,
                };
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