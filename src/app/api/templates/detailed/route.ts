import { NextRequest, NextResponse } from 'next/server';
import { subjectTemplateService } from '@/services/templates/SubjectTemplateService';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const includeContent = searchParams.get('includeContent') === 'true';

        const templates = await subjectTemplateService.getAllTemplates();

        // Transform templates for detailed view
        const detailedTemplates = templates.map(template => ({
            id: template.id,
            name: template.name,
            description: template.description,
            subject: template.subject,
            gradeLevel: template.gradeLevel,
            outputType: template.outputType,
            tags: template.tags,
            difficulty: template.difficulty,
            compliance: template.compliance,
            recommendedTools: template.recommendedTools,
            variableCount: template.variables.length,
            exampleCount: template.examples.length,
            templateLength: template.template.length,
            ...(includeContent && {
                template: template.template,
                variables: template.variables,
                examples: template.examples
            })
        }));

        // Calculate additional statistics
        const stats = {
            totalTemplates: templates.length,
            totalVariables: templates.reduce((sum, t) => sum + t.variables.length, 0),
            totalExamples: templates.reduce((sum, t) => sum + t.examples.length, 0),
            averageComplexity: {
                beginner: templates.filter(t => t.difficulty === 'beginner').length,
                intermediate: templates.filter(t => t.difficulty === 'intermediate').length,
                advanced: templates.filter(t => t.difficulty === 'advanced').length
            },
            bySubject: {} as Record<string, any>,
            byOutputType: {} as Record<string, any>
        };

        // Group by subject with details
        templates.forEach(template => {
            if (!stats.bySubject[template.subject]) {
                stats.bySubject[template.subject] = {
                    count: 0,
                    templates: [],
                    difficulties: { beginner: 0, intermediate: 0, advanced: 0 }
                };
            }
            stats.bySubject[template.subject].count++;
            stats.bySubject[template.subject].templates.push({
                id: template.id,
                name: template.name,
                outputType: template.outputType,
                difficulty: template.difficulty
            });
            stats.bySubject[template.subject].difficulties[template.difficulty]++;
        });

        // Group by output type with details
        templates.forEach(template => {
            if (!stats.byOutputType[template.outputType]) {
                stats.byOutputType[template.outputType] = {
                    count: 0,
                    templates: [],
                    subjects: new Set()
                };
            }
            stats.byOutputType[template.outputType].count++;
            stats.byOutputType[template.outputType].templates.push({
                id: template.id,
                name: template.name,
                subject: template.subject,
                difficulty: template.difficulty
            });
            stats.byOutputType[template.outputType].subjects.add(template.subject);
        });

        // Convert Sets to arrays for JSON serialization
        Object.keys(stats.byOutputType).forEach(key => {
            stats.byOutputType[key].subjects = Array.from(stats.byOutputType[key].subjects);
        });

        return NextResponse.json({
            success: true,
            templates: detailedTemplates,
            stats: stats,
            meta: {
                includeContent,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error fetching detailed templates:', error);
        return NextResponse.json(
            { error: 'Lỗi hệ thống khi lấy thông tin chi tiết templates' },
            { status: 500 }
        );
    }
}