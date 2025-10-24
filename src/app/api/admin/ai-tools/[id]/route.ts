import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const aiTool = await prisma.aITool.findUnique({
            where: { id }
        });

        if (!aiTool) {
            return NextResponse.json(
                { error: 'AI tool không tồn tại' },
                { status: 404 }
            );
        }

        // Transform data to parse JSON strings back to arrays
        const transformedTool = {
            ...aiTool,
            subjects: JSON.parse(aiTool.subjects || '[]'),
            gradeLevel: JSON.parse(aiTool.gradeLevel || '[]'),
            features: JSON.parse(aiTool.features || '[]'),
            samplePrompts: aiTool.samplePrompts ? JSON.parse(aiTool.samplePrompts) : [],
            relatedTools: aiTool.relatedTools ? JSON.parse(aiTool.relatedTools) : []
        };

        return NextResponse.json(transformedTool);
    } catch (error) {
        console.error('Error in GET /api/admin/ai-tools/[id]:', error);
        return NextResponse.json(
            { error: 'Lỗi server nội bộ' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const toolData = await request.json();

        console.log('Updating AI tool:', id, JSON.stringify(toolData, null, 2));

        // Check if AI tool exists
        const existing = await prisma.aITool.findUnique({
            where: { id }
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'AI tool không tồn tại' },
                { status: 404 }
            );
        }

        // Process update data
        const updateData: any = {};

        if (toolData.name) updateData.name = toolData.name;
        if (toolData.description) updateData.description = toolData.description;
        if (toolData.url) updateData.url = toolData.url;
        if (toolData.category) updateData.category = toolData.category;
        if (toolData.subjects !== undefined) updateData.subjects = JSON.stringify(toolData.subjects || []);
        if (toolData.gradeLevel !== undefined) updateData.gradeLevel = JSON.stringify(toolData.gradeLevel || []);
        if (toolData.useCase !== undefined) updateData.useCase = toolData.useCase || '';
        if (toolData.vietnameseSupport !== undefined) updateData.vietnameseSupport = Boolean(toolData.vietnameseSupport);
        if (toolData.difficulty) updateData.difficulty = toolData.difficulty;
        if (toolData.features !== undefined) updateData.features = JSON.stringify(toolData.features || []);
        if (toolData.pricingModel) updateData.pricingModel = toolData.pricingModel;
        if (toolData.integrationInstructions !== undefined) updateData.integrationInstructions = toolData.integrationInstructions || null;
        if (toolData.samplePrompts !== undefined) updateData.samplePrompts = JSON.stringify(toolData.samplePrompts || []);
        if (toolData.relatedTools !== undefined) updateData.relatedTools = JSON.stringify(toolData.relatedTools || []);

        const updatedTool = await prisma.aITool.update({
            where: { id },
            data: updateData
        });

        // Transform data to parse JSON strings back to arrays
        const transformedTool = {
            ...updatedTool,
            subjects: JSON.parse(updatedTool.subjects || '[]'),
            gradeLevel: JSON.parse(updatedTool.gradeLevel || '[]'),
            features: JSON.parse(updatedTool.features || '[]'),
            samplePrompts: updatedTool.samplePrompts ? JSON.parse(updatedTool.samplePrompts) : [],
            relatedTools: updatedTool.relatedTools ? JSON.parse(updatedTool.relatedTools) : []
        };

        return NextResponse.json(transformedTool);
    } catch (error) {
        console.error('Error in PUT /api/admin/ai-tools/[id]:', error);
        return NextResponse.json(
            { error: 'Không thể cập nhật AI tool: ' + (error instanceof Error ? error.message : 'Unknown error') },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const existing = await prisma.aITool.findUnique({
            where: { id }
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'AI tool không tồn tại' },
                { status: 404 }
            );
        }

        await prisma.aITool.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /api/admin/ai-tools/[id]:', error);
        return NextResponse.json(
            { error: 'Không thể xóa AI tool' },
            { status: 500 }
        );
    }
}