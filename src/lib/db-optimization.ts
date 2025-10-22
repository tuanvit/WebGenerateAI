import { PrismaClient } from '@prisma/client';

// Database connection pool configuration
const DATABASE_POOL_SIZE = parseInt(process.env.DATABASE_POOL_SIZE || '10');
const DATABASE_CONNECTION_TIMEOUT = parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '30000');

// Optimized Prisma client with connection pooling
export const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Database query optimization utilities
export class DatabaseOptimizer {
    // Optimized query for community content with pagination and filtering
    static async getCommunityContentOptimized(filters: {
        subject?: string;
        gradeLevel?: number;
        tags?: string[];
        search?: string;
        page?: number;
        limit?: number;
    }) {
        const { subject, gradeLevel, tags, search, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (subject) {
            where.subject = subject;
        }

        if (gradeLevel) {
            where.gradeLevel = gradeLevel;
        }

        if (tags && tags.length > 0) {
            where.tags = {
                hasSome: tags,
            };
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Use transaction for consistent reads
        const [content, total] = await prisma.$transaction([
            prisma.sharedContent.findMany({
                where,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    subject: true,
                    gradeLevel: true,
                    tags: true,
                    rating: true,
                    ratingCount: true,
                    createdAt: true,
                    author: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: [
                    { rating: 'desc' },
                    { createdAt: 'desc' },
                ],
                skip,
                take: limit,
            }),
            prisma.sharedContent.count({ where }),
        ]);

        return {
            content,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    // Optimized query for user's personal library
    static async getUserLibraryOptimized(userId: string, filters: {
        subject?: string;
        gradeLevel?: number;
        search?: string;
        page?: number;
        limit?: number;
    }) {
        const { subject, gradeLevel, search, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;

        const where: any = {
            userId,
        };

        if (subject || gradeLevel || search) {
            where.OR = [];

            // Filter by generated prompts
            const promptWhere: any = {};
            if (subject || gradeLevel || search) {
                promptWhere.inputParameters = {};

                if (subject) {
                    promptWhere.inputParameters.path = ['subject'];
                    promptWhere.inputParameters.equals = subject;
                }

                if (search) {
                    where.OR.push({
                        generatedText: { contains: search, mode: 'insensitive' }
                    });
                }
            }

            if (Object.keys(promptWhere).length > 0) {
                where.OR.push(promptWhere);
            }
        }

        const [prompts, total] = await prisma.$transaction([
            prisma.generatedPrompt.findMany({
                where,
                select: {
                    id: true,
                    inputParameters: true,
                    generatedText: true,
                    targetTool: true,
                    createdAt: true,
                    tags: true,
                    versions: {
                        select: {
                            id: true,
                            version: true,
                            createdAt: true,
                        },
                        orderBy: { version: 'desc' },
                        take: 1,
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.generatedPrompt.count({ where }),
        ]);

        return {
            prompts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    // Batch operations for better performance
    static async batchUpdateRatings(updates: Array<{ contentId: string; newRating: number; newCount: number }>) {
        const updatePromises = updates.map(({ contentId, newRating, newCount }) =>
            prisma.sharedContent.update({
                where: { id: contentId },
                data: {
                    rating: newRating,
                    ratingCount: newCount,
                },
            })
        );

        return prisma.$transaction(updatePromises);
    }

    // Optimized search with full-text search capabilities
    static async searchContentOptimized(query: string, filters: {
        subject?: string;
        gradeLevel?: number;
        limit?: number;
    }) {
        const { subject, gradeLevel, limit = 10 } = filters;

        const where: any = {
            OR: [
                { title: { search: query } },
                { description: { search: query } },
                { content: { search: query } },
                { tags: { hasSome: query.split(' ') } },
            ],
        };

        if (subject) {
            where.subject = subject;
        }

        if (gradeLevel) {
            where.gradeLevel = gradeLevel;
        }

        return prisma.sharedContent.findMany({
            where,
            select: {
                id: true,
                title: true,
                description: true,
                subject: true,
                gradeLevel: true,
                tags: true,
                rating: true,
                ratingCount: true,
                author: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                _relevance: {
                    fields: ['title', 'description'],
                    search: query,
                    sort: 'desc',
                },
            },
            take: limit,
        });
    }

    // Database maintenance utilities
    static async analyzePerformance() {
        try {
            // Get table sizes
            const tableSizes = await prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          attname,
          n_distinct,
          correlation
        FROM pg_stats 
        WHERE schemaname = 'public'
        ORDER BY n_distinct DESC;
      `;

            // Get slow queries (if pg_stat_statements is enabled)
            const slowQueries = await prisma.$queryRaw`
        SELECT 
          query,
          calls,
          total_time,
          mean_time,
          rows
        FROM pg_stat_statements 
        WHERE mean_time > 100
        ORDER BY mean_time DESC
        LIMIT 10;
      `;

            return {
                tableSizes,
                slowQueries,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            console.error('Performance analysis failed:', error);
            return null;
        }
    }

    // Index recommendations
    static async getIndexRecommendations() {
        try {
            // Check for missing indexes on foreign keys
            const missingIndexes = await prisma.$queryRaw`
        SELECT 
          t.table_name,
          c.column_name,
          c.data_type
        FROM information_schema.tables t
        JOIN information_schema.columns c ON t.table_name = c.table_name
        WHERE t.table_schema = 'public'
        AND c.column_name LIKE '%_id'
        AND NOT EXISTS (
          SELECT 1 FROM pg_indexes 
          WHERE tablename = t.table_name 
          AND indexdef LIKE '%' || c.column_name || '%'
        );
      `;

            return missingIndexes;
        } catch (error) {
            console.error('Index analysis failed:', error);
            return [];
        }
    }
}

// Connection management
export async function connectDatabase() {
    try {
        await prisma.$connect();
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
}

export async function disconnectDatabase() {
    try {
        await prisma.$disconnect();
        console.log('Database disconnected successfully');
    } catch (error) {
        console.error('Database disconnection failed:', error);
    }
}

// Health check for database
export async function checkDatabaseHealth() {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
        return {
            status: 'unhealthy',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        };
    }
}