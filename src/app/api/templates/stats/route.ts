import { NextRequest, NextResponse } from 'next/server';
import { SubjectTemplateService } from '@/services/templates/SubjectTemplateService';

export async function GET(request: NextRequest) {
    try {
        const templateService = new SubjectTemplateService();
        const allTemplates = await templateService.getAllTemplates();

        // Calculate stats
        const stats = {
            totalTemplates: allTemplates.length,
            bySubject: {} as Record<string, number>,
            byOutputType: {} as Record<string, number>,
            byGradeLevel: {} as Record<string, number>
        };

        // Count by subject
        allTemplates.forEach((template: any) => {
            stats.bySubject[template.subject] = (stats.bySubject[template.subject] || 0) + 1;
        });

        // Count by output type
        allTemplates.forEach((template: any) => {
            stats.byOutputType[template.outputType] = (stats.byOutputType[template.outputType] || 0) + 1;
        });

        // Count by grade level
        allTemplates.forEach((template: any) => {
            template.gradeLevel.forEach((grade: any) => {
                const gradeKey = `grade-${grade}`;
                stats.byGradeLevel[gradeKey] = (stats.byGradeLevel[gradeKey] || 0) + 1;
            });
        });

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error getting template stats:', error);
        return NextResponse.json(
            { error: 'Failed to get template statistics' },
            { status: 500 }
        );
    }
}