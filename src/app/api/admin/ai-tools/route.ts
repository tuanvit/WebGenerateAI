import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '25');
        const sortBy = searchParams.get('sortBy') || 'updatedAt';
        const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
        const search = searchParams.get('search') || undefined;
        const category = searchParams.get('category') || undefined;

        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (category) {
            where.category = category;
        }

        const [aiTools, total] = await Promise.all([
            prisma.aITool.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder }
            }),
            prisma.aITool.count({ where })
        ]);

        // Transform data to parse JSON strings back to arrays
        const transformedTools = aiTools.map(tool => ({
            ...tool,
            subjects: JSON.parse(tool.subjects || '[]'),
            gradeLevel: JSON.parse(tool.gradeLevel || '[]'),
            features: JSON.parse(tool.features || '[]'),
            samplePrompts: tool.samplePrompts ? JSON.parse(tool.samplePrompts) : [],
            relatedTools: tool.relatedTools ? JSON.parse(tool.relatedTools) : []
        }));

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            data: transformedTools,
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        });
    } catch (error) {
        console.error('Error in GET /api/admin/ai-tools:', error);
        return NextResponse.json(
            { error: 'Không thể tải danh sách AI tools' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const toolData = await request.json();

        console.log('Received AI tool data:', JSON.stringify(toolData, null, 2));

        // Basic validation
        if (!toolData.name || !toolData.description || !toolData.url || !toolData.category) {
            return NextResponse.json(
                { error: 'Thiếu thông tin bắt buộc: name, description, url, category' },
                { status: 400 }
            );
        }

        // Ensure arrays are properly formatted
        const processedData = {
            name: toolData.name,
            description: toolData.description,
            url: toolData.url,
            category: toolData.category,
            subjects: JSON.stringify(toolData.subjects || []),
            gradeLevel: JSON.stringify(toolData.gradeLevel || []),
            useCase: toolData.useCase || '',
            vietnameseSupport: Boolean(toolData.vietnameseSupport),
            difficulty: toolData.difficulty || 'beginner',
            features: JSON.stringify(toolData.features || []),
            pricingModel: toolData.pricingModel || 'free',
            integrationInstructions: toolData.integrationInstructions || null,
            samplePrompts: JSON.stringify(toolData.samplePrompts || []),
            relatedTools: JSON.stringify(toolData.relatedTools || [])
        };

        console.log('Processed data for database:', JSON.stringify(processedData, null, 2));

        const aiTool = await prisma.aITool.create({
            data: processedData
        });

        // Transform data to parse JSON strings back to arrays for response
        const transformedTool = {
            ...aiTool,
            subjects: JSON.parse(aiTool.subjects || '[]'),
            gradeLevel: JSON.parse(aiTool.gradeLevel || '[]'),
            features: JSON.parse(aiTool.features || '[]'),
            samplePrompts: aiTool.samplePrompts ? JSON.parse(aiTool.samplePrompts) : [],
            relatedTools: aiTool.relatedTools ? JSON.parse(aiTool.relatedTools) : []
        };

        return NextResponse.json(transformedTool, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/admin/ai-tools:', error);
        return NextResponse.json(
            { error: 'Không thể tạo AI tool mới: ' + (error instanceof Error ? error.message : 'Unknown error') },
            { status: 500 }
        );
    }
}