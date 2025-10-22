import { NextRequest, NextResponse } from 'next/server';
import { templateSelectionEngine, TemplateSelectionCriteria } from '@/services/templates/TemplateSelectionEngine';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { criteria, userPreferences, action = 'find' } = body;

        if (!criteria) {
            return NextResponse.json(
                { error: 'Criteria là bắt buộc' },
                { status: 400 }
            );
        }

        // Validate criteria
        if (!criteria.subject || !criteria.gradeLevel || !criteria.outputType) {
            return NextResponse.json(
                { error: 'Thiếu thông tin bắt buộc: subject, gradeLevel, outputType' },
                { status: 400 }
            );
        }

        let result;

        switch (action) {
            case 'find':
                // Tìm template phù hợp nhất
                result = await templateSelectionEngine.findBestTemplate(criteria, userPreferences);
                break;

            case 'findAll':
                // Tìm tất cả template phù hợp
                result = await templateSelectionEngine.findMatchingTemplates(criteria, userPreferences);
                break;

            case 'personalized':
                // Đề xuất cá nhân hóa
                if (!userPreferences) {
                    return NextResponse.json(
                        { error: 'UserPreferences là bắt buộc cho personalized recommendations' },
                        { status: 400 }
                    );
                }
                result = await templateSelectionEngine.getPersonalizedRecommendations(criteria, userPreferences);
                break;

            case 'compare':
                // So sánh templates
                const { templateIds } = body;
                if (!templateIds || !Array.isArray(templateIds)) {
                    return NextResponse.json(
                        { error: 'TemplateIds array là bắt buộc cho comparison' },
                        { status: 400 }
                    );
                }
                result = await templateSelectionEngine.compareTemplates(templateIds, criteria);
                break;

            default:
                return NextResponse.json(
                    { error: 'Action không hợp lệ. Sử dụng: find, findAll, personalized, compare' },
                    { status: 400 }
                );
        }

        return NextResponse.json({
            success: true,
            data: result,
            action,
            criteria
        });
    } catch (error) {
        console.error('Error in template recommendation:', error);
        return NextResponse.json(
            { error: 'Lỗi hệ thống khi đề xuất template' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const subject = searchParams.get('subject');
        const gradeLevel = searchParams.get('gradeLevel');
        const outputType = searchParams.get('outputType');
        const difficulty = searchParams.get('difficulty');
        const keywords = searchParams.get('keywords');

        if (!subject || !gradeLevel || !outputType) {
            return NextResponse.json(
                { error: 'Cần cung cấp subject, gradeLevel và outputType' },
                { status: 400 }
            );
        }

        const criteria: TemplateSelectionCriteria = {
            subject,
            gradeLevel: parseInt(gradeLevel) as 6 | 7 | 8 | 9,
            outputType: outputType as any,
            difficulty: difficulty as any,
            keywords: keywords ? keywords.split(',').map(k => k.trim()) : undefined
        };

        const matches = await templateSelectionEngine.findMatchingTemplates(criteria);

        return NextResponse.json({
            success: true,
            data: matches,
            criteria
        });
    } catch (error) {
        console.error('Error getting template recommendations:', error);
        return NextResponse.json(
            { error: 'Lỗi hệ thống khi lấy đề xuất template' },
            { status: 500 }
        );
    }
}