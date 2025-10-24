import { NextRequest, NextResponse } from 'next/server';
import { subjectTemplateService } from '@/services/templates/SubjectTemplateService';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: templateId } = await params;

        if (!templateId) {
            return NextResponse.json(
                { error: 'Template ID là bắt buộc' },
                { status: 400 }
            );
        }

        const template = await subjectTemplateService.getTemplateById(templateId);

        if (!template) {
            return NextResponse.json(
                { error: 'Không tìm thấy template với ID này' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: template
        });
    } catch (error) {
        console.error('Error fetching template details:', error);
        return NextResponse.json(
            { error: 'Lỗi hệ thống khi lấy thông tin chi tiết template' },
            { status: 500 }
        );
    }
}