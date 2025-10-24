import { NextRequest, NextResponse } from 'next/server';
import { TemplatesService } from '@/lib/admin/services/templates-service';

export async function GET(request: NextRequest) {
    try {
        const templatesService = new TemplatesService();

        // Get stats from admin service
        const adminStats = await templatesService.getTemplatesStatistics();

        // Transform to user-facing format
        const stats = {
            totalTemplates: adminStats.total,
            bySubject: adminStats.bySubject,
            byOutputType: adminStats.byOutputType,
            byGradeLevel: {} as Record<string, number>
        };

        // Get all templates to calculate grade level stats
        const allTemplatesResult = await templatesService.getTemplates({ limit: 1000 });

        // Count by grade level
        allTemplatesResult.data.forEach((template: any) => {
            if (template.gradeLevel && Array.isArray(template.gradeLevel)) {
                template.gradeLevel.forEach((grade: any) => {
                    const gradeKey = `grade-${grade}`;
                    stats.byGradeLevel[gradeKey] = (stats.byGradeLevel[gradeKey] || 0) + 1;
                });
            }
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