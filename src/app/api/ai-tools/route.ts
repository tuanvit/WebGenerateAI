import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const subject = searchParams.get('subject');
        const gradeLevel = searchParams.get('gradeLevel');
        const name = searchParams.get('name');

        let whereClause: any = {};

        // Filter by name if provided (for template recommendations)
        if (name) {
            whereClause.name = {
                contains: name,
                mode: 'insensitive'
            };
        }

        // Filter by category if provided
        if (category) {
            whereClause.category = category;
        }

        // Filter by subject if provided
        if (subject) {
            whereClause.subjects = {
                contains: subject
            };
        }

        // Filter by grade level if provided
        if (gradeLevel) {
            whereClause.gradeLevel = {
                contains: gradeLevel
            };
        }

        const aiTools = await prisma.aITool.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                description: true,
                url: true,
                category: true,
                subjects: true,
                gradeLevel: true,
                useCase: true,
                vietnameseSupport: true,
                difficulty: true,
                features: true,
                pricingModel: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        // Parse JSON fields
        const processedTools = aiTools.map(tool => ({
            ...tool,
            subjects: JSON.parse(tool.subjects),
            gradeLevel: JSON.parse(tool.gradeLevel),
            features: JSON.parse(tool.features)
        }));

        return NextResponse.json(processedTools);
    } catch (error) {
        console.error('Error fetching AI tools:', error);
        return NextResponse.json(
            { error: 'Không thể tải danh sách AI tools' },
            { status: 500 }
        );
    }
}