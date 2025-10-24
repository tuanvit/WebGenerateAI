import { NextRequest, NextResponse } from 'next/server';
import { TemplatesService } from '@/lib/admin/services/templates-service';

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

        const templatesService = new TemplatesService();

        // Build filters based on criteria
        const filters: any = {
            subject: criteria.subject,
            gradeLevel: [criteria.gradeLevel],
            outputType: criteria.outputType,
            limit: 50
        };

        // Don't filter by difficulty strictly - we'll score it instead
        // if (criteria.difficulty) {
        //     filters.difficulty = criteria.difficulty;
        // }

        // Get matching templates from database
        const result = await templatesService.getTemplates(filters);

        console.log(`Database query filters:`, filters);
        console.log(`Database returned ${result.data.length} templates`);

        // Transform to user format
        const transformedTemplates = result.data.map(adminTemplate => ({
            id: adminTemplate.id,
            name: adminTemplate.name,
            description: adminTemplate.description,
            subject: adminTemplate.subject,
            gradeLevel: adminTemplate.gradeLevel,
            outputType: adminTemplate.outputType,
            template: adminTemplate.templateContent,
            variables: adminTemplate.variables || [],
            examples: adminTemplate.examples || [],
            tags: adminTemplate.tags || [],
            difficulty: adminTemplate.difficulty,
            compliance: adminTemplate.compliance || [],
            recommendedTools: adminTemplate.recommendedTools || [],
            score: 1.0, // Default score for now
            reasons: [], // Will be populated below
            confidence: 0.5 // Will be calculated below
        }));

        // Simple scoring based on criteria match
        transformedTemplates.forEach(template => {
            let score = 0.5; // Base score
            const reasons = [];

            // Exact subject match
            if (template.subject === criteria.subject) {
                score += 0.3;
                reasons.push(`Phù hợp môn ${criteria.subject}`);
            }

            // Grade level match
            if (template.gradeLevel.includes(criteria.gradeLevel)) {
                score += 0.2;
                reasons.push(`Phù hợp lớp ${criteria.gradeLevel}`);
            }

            // Output type match
            if (template.outputType === criteria.outputType) {
                score += 0.3;
                const typeNames = {
                    'lesson-plan': 'giáo án',
                    'presentation': 'thuyết trình',
                    'assessment': 'đánh giá',
                    'interactive': 'tương tác',
                    'research': 'nghiên cứu'
                };
                reasons.push(`Loại ${typeNames[criteria.outputType] || criteria.outputType}`);
            }

            // Difficulty preference
            if (criteria.difficulty && template.difficulty === criteria.difficulty) {
                score += 0.1;
                const difficultyNames = {
                    'beginner': 'cơ bản',
                    'intermediate': 'trung bình',
                    'advanced': 'nâng cao'
                };
                reasons.push(`Độ khó ${difficultyNames[criteria.difficulty]}`);
            }

            // Keywords match in name or description
            if (criteria.keywords) {
                const text = (template.name + ' ' + template.description).toLowerCase();
                const matchedKeywords = criteria.keywords.filter(keyword =>
                    text.includes(keyword.toLowerCase())
                );
                if (matchedKeywords.length > 0) {
                    score += (matchedKeywords.length / criteria.keywords.length) * 0.2;
                    reasons.push(`Chứa từ khóa: ${matchedKeywords.join(', ')}`);
                }
            }

            // Compliance standards
            if (template.compliance && template.compliance.length > 0) {
                reasons.push(`Tuân thủ: ${template.compliance.join(', ')}`);
            }

            template.score = Math.min(score, 1.0);
            template.reasons = reasons;

            // Calculate confidence based on score
            if (score >= 0.9) template.confidence = 'high';
            else if (score >= 0.7) template.confidence = 'medium';
            else template.confidence = 'low';
        });

        // Sort by score
        transformedTemplates.sort((a, b) => b.score - a.score);

        let responseData;
        switch (action) {
            case 'find':
                // Return best template wrapped in match format
                const bestTemplate = transformedTemplates[0];
                responseData = bestTemplate ? {
                    template: bestTemplate,
                    score: bestTemplate.score,
                    confidence: bestTemplate.confidence,
                    reasons: bestTemplate.reasons
                } : null;
                break;
            case 'findAll':
            case 'personalized':
                // Return all matching templates in match format
                responseData = transformedTemplates.map(template => ({
                    template: template,
                    score: template.score,
                    confidence: template.confidence,
                    reasons: template.reasons
                }));
                break;
            default:
                responseData = transformedTemplates.map(template => ({
                    template: template,
                    score: template.score,
                    confidence: template.confidence,
                    reasons: template.reasons
                }));
        }

        console.log(`Getting candidate templates for criteria:`, criteria);
        console.log(`Found recommended templates: ${transformedTemplates.length}`);

        return NextResponse.json({
            success: true,
            data: responseData,
            action,
            criteria,
            meta: {
                totalFound: transformedTemplates.length,
                fromDatabase: true
            }
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

        const criteria = {
            subject,
            gradeLevel: parseInt(gradeLevel),
            outputType,
            difficulty,
            keywords: keywords ? keywords.split(',').map(k => k.trim()) : undefined
        };

        // Use POST logic for consistency
        const postResponse = await POST(new NextRequest(request.url, {
            method: 'POST',
            body: JSON.stringify({ criteria, action: 'findAll' }),
            headers: { 'Content-Type': 'application/json' }
        }));

        return postResponse;
    } catch (error) {
        console.error('Error getting template recommendations:', error);
        return NextResponse.json(
            { error: 'Lỗi hệ thống khi lấy đề xuất template' },
            { status: 500 }
        );
    }
}