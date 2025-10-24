import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const { subject, gradeLevel, outputType } = await request.json();

        // Build filter criteria for AI tools
        let whereClause: any = {};

        // Filter by subject if provided
        if (subject) {
            whereClause.subjects = {
                contains: subject
            };
        }

        // Filter by grade level if provided
        if (gradeLevel) {
            whereClause.gradeLevel = {
                contains: gradeLevel.toString()
            };
        }

        // Filter by category based on output type
        if (outputType) {
            const categoryMap: Record<string, string[]> = {
                'lesson-plan': ['TEXT_GENERATION'],
                'presentation': ['PRESENTATION', 'TEXT_GENERATION'],
                'assessment': ['ASSESSMENT', 'TEXT_GENERATION'],
                'interactive': ['SIMULATION', 'TEXT_GENERATION'],
                'research': ['TEXT_GENERATION', 'DATA_ANALYSIS']
            };

            const categories = categoryMap[outputType] || ['TEXT_GENERATION'];
            whereClause.category = {
                in: categories
            };
        }

        const recommendedTools = await prisma.aITool.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                description: true,
                category: true,
                vietnameseSupport: true,
                difficulty: true,
                pricingModel: true
            },
            orderBy: [
                { vietnameseSupport: 'desc' }, // Prioritize Vietnamese support
                { pricingModel: 'asc' }, // Prioritize free tools
                { name: 'asc' }
            ],
            take: 10 // Limit to top 10 recommendations
        });

        return NextResponse.json(recommendedTools);
    } catch (error) {
        console.error('Error getting AI tool recommendations:', error);
        return NextResponse.json(
            { error: 'Không thể lấy danh sách công cụ AI khuyến nghị' },
            { status: 500 }
        );
    }
}