import { PrismaClient } from '@prisma/client';
import { prisma } from '../db';
import { DatabaseError, NotFoundError } from '../../types/services';

/**
 * Base repository class providing common database operations
 */
export abstract class BaseRepository<T, CreateInput, UpdateInput> {
    protected db: PrismaClient;

    constructor() {
        this.db = prisma;
    }

    /**
     * Handle database errors and convert to application errors
     */
    protected handleError(error: unknown, operation: string): never {
        console.error(`Database error in ${operation}:`, error);

        if (error instanceof Error) {
            // Handle specific Prisma errors
            if (error.message.includes('Record to update not found')) {
                throw new NotFoundError('Không tìm thấy bản ghi để cập nhật');
            }
            if (error.message.includes('Record to delete does not exist')) {
                throw new NotFoundError('Không tìm thấy bản ghi để xóa');
            }
            if (error.message.includes('Unique constraint failed')) {
                throw new DatabaseError('Dữ liệu đã tồn tại');
            }
        }

        throw new DatabaseError(`Lỗi ${operation}: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    }

    /**
     * Create a new record
     */
    abstract create(data: CreateInput): Promise<T>;

    /**
     * Find record by ID
     */
    abstract findById(id: string): Promise<T | null>;

    /**
     * Update record by ID
     */
    abstract update(id: string, data: UpdateInput): Promise<T>;

    /**
     * Delete record by ID
     */
    abstract delete(id: string): Promise<void>;

    /**
     * Find all records with optional filtering
     */
    abstract findMany(filters?: Record<string, unknown>): Promise<T[]>;
}