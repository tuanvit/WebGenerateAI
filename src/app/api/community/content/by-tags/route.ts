import { NextRequest, NextResponse } from 'next/server';
import { CommunityLibraryService } from '../../../../../services/library/CommunityLibraryService';

/**
 * GET /api/community/content/by-tags - Get content by specific tags
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tagsParam = searchParams.get('tags');

        if (!tagsParam) {
            return NextResponse.json(
                { error: 'Vui lòng cung cấp ít nhất một thẻ tag' },
                { status: 400 }
            );
        }

        const tags = tagsParam.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

        if (tags.length === 0) {
            return NextResponse.json(
                { error: 'Vui lòng cung cấp ít nhất một thẻ tag hợp lệ' },
                { status: 400 }
            );
        }

        const content = await CommunityLibraryService.getContentByTags(tags);

        return NextResponse.json({
            success: true,
            data: content,
            tags,
        });

    } catch (error) {
        console.error('Error getting content by tags:', error);

        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi lấy nội dung theo thẻ tag. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}