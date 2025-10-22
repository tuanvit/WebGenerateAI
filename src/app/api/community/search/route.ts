import { NextRequest, NextResponse } from 'next/server';
import { CommunityLibraryService } from '../../../../services/library/CommunityLibraryService';
import { z } from 'zod';

const AdvancedSearchSchema = z.object({
    query: z.string().optional(),
    subject: z.string().optional(),
    gradeLevel: z.union([z.literal(6), z.literal(7), z.literal(8), z.literal(9)]).optional(),
    tags: z.array(z.string()).optional(),
    minRating: z.number().min(1).max(5).optional(),
    author: z.string().optional(),
    sortBy: z.enum(['rating', 'recent', 'popular', 'saves']).optional(),
    limit: z.number().min(1).max(50).optional(),
    offset: z.number().min(0).optional(),
});

/**
 * GET /api/community/search - Advanced search for community content
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Parse search parameters
        const searchData: any = {};

        if (searchParams.get('query')) searchData.query = searchParams.get('query');
        if (searchParams.get('subject')) searchData.subject = searchParams.get('subject');
        if (searchParams.get('gradeLevel')) {
            const gradeLevel = parseInt(searchParams.get('gradeLevel')!);
            if ([6, 7, 8, 9].includes(gradeLevel)) {
                searchData.gradeLevel = gradeLevel;
            }
        }
        if (searchParams.get('tags')) {
            searchData.tags = searchParams.get('tags')!.split(',').map(tag => tag.trim());
        }
        if (searchParams.get('minRating')) {
            const rating = parseFloat(searchParams.get('minRating')!);
            if (rating >= 1 && rating <= 5) {
                searchData.minRating = rating;
            }
        }
        if (searchParams.get('author')) searchData.author = searchParams.get('author');
        if (searchParams.get('sortBy')) searchData.sortBy = searchParams.get('sortBy');
        if (searchParams.get('limit')) {
            const limit = parseInt(searchParams.get('limit')!);
            if (limit >= 1 && limit <= 50) {
                searchData.limit = limit;
            }
        }
        if (searchParams.get('offset')) {
            const offset = parseInt(searchParams.get('offset')!);
            if (offset >= 0) {
                searchData.offset = offset;
            }
        }

        const validatedSearch = AdvancedSearchSchema.parse(searchData);

        // Build search filters
        const filters: any = {};

        if (validatedSearch.subject) filters.subject = validatedSearch.subject;
        if (validatedSearch.gradeLevel) filters.gradeLevel = validatedSearch.gradeLevel;
        if (validatedSearch.tags) filters.tags = validatedSearch.tags;
        if (validatedSearch.minRating) filters.rating = validatedSearch.minRating;
        if (validatedSearch.author) filters.author = validatedSearch.author;
        if (validatedSearch.query) filters.topic = validatedSearch.query;

        // Get search results
        let content = await CommunityLibraryService.searchContent(filters);

        // Apply additional sorting if specified
        if (validatedSearch.sortBy) {
            switch (validatedSearch.sortBy) {
                case 'rating':
                    content = content.sort((a, b) => b.rating - a.rating);
                    break;
                case 'recent':
                    content = content.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    break;
                case 'popular':
                    content = content.sort((a, b) => b.ratingCount - a.ratingCount);
                    break;
                case 'saves':
                    // This would require additional data from the database
                    // For now, we'll sort by rating count as a proxy
                    content = content.sort((a, b) => b.ratingCount - a.ratingCount);
                    break;
            }
        }

        // Apply pagination
        const offset = validatedSearch.offset || 0;
        const limit = validatedSearch.limit || 20;
        const paginatedContent = content.slice(offset, offset + limit);

        return NextResponse.json({
            success: true,
            data: paginatedContent,
            pagination: {
                total: content.length,
                offset,
                limit,
                hasMore: offset + limit < content.length
            },
            filters: validatedSearch,
        });

    } catch (error) {
        console.error('Error performing advanced search:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: 'Tham số tìm kiếm không hợp lệ',
                    details: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/community/search - Advanced search with complex filters (body-based)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedSearch = AdvancedSearchSchema.parse(body);

        // Build search filters
        const filters: any = {};

        if (validatedSearch.subject) filters.subject = validatedSearch.subject;
        if (validatedSearch.gradeLevel) filters.gradeLevel = validatedSearch.gradeLevel;
        if (validatedSearch.tags) filters.tags = validatedSearch.tags;
        if (validatedSearch.minRating) filters.rating = validatedSearch.minRating;
        if (validatedSearch.author) filters.author = validatedSearch.author;
        if (validatedSearch.query) filters.topic = validatedSearch.query;

        // Get search results
        let content = await CommunityLibraryService.searchContent(filters);

        // Apply additional sorting if specified
        if (validatedSearch.sortBy) {
            switch (validatedSearch.sortBy) {
                case 'rating':
                    content = content.sort((a, b) => b.rating - a.rating);
                    break;
                case 'recent':
                    content = content.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    break;
                case 'popular':
                    content = content.sort((a, b) => b.ratingCount - a.ratingCount);
                    break;
                case 'saves':
                    // This would require additional data from the database
                    // For now, we'll sort by rating count as a proxy
                    content = content.sort((a, b) => b.ratingCount - a.ratingCount);
                    break;
            }
        }

        // Apply pagination
        const offset = validatedSearch.offset || 0;
        const limit = validatedSearch.limit || 20;
        const paginatedContent = content.slice(offset, offset + limit);

        return NextResponse.json({
            success: true,
            data: paginatedContent,
            pagination: {
                total: content.length,
                offset,
                limit,
                hasMore: offset + limit < content.length
            },
            filters: validatedSearch,
        });

    } catch (error) {
        console.error('Error performing advanced search:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: 'Dữ liệu tìm kiếm không hợp lệ',
                    details: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}