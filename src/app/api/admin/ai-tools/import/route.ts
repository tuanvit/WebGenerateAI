import { NextRequest, NextResponse } from 'next/server';
import { AIToolsService } from '@/lib/admin/services/ai-tools-service';
import { requireAdminAuth } from '@/lib/admin/admin-auth';
import { AdminErrorCode, createAdminError } from '@/lib/admin/admin-errors';

const aiToolsService = new AIToolsService();

/**
 * POST /api/admin/ai-tools/import
 * Import AI tools from uploaded file
 */
export async function POST(request: NextRequest) {
    try {
        // Require admin authentication
        const user = await requireAdminAuth(request);

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            throw createAdminError(AdminErrorCode.INVALID_INPUT, 'Không tìm thấy file upload');
        }

        // Validate file type
        const allowedTypes = ['application/json', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        if (!allowedTypes.includes(file.type)) {
            throw createAdminError(AdminErrorCode.FILE_UPLOAD_ERROR, 'Chỉ hỗ trợ file JSON, CSV, và Excel');
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            throw createAdminError(AdminErrorCode.FILE_UPLOAD_ERROR, 'File không được lớn hơn 10MB');
        }

        // Read file content
        const fileContent = await file.text();
        let toolsData: any[];

        try {
            if (file.type === 'application/json') {
                const jsonData = JSON.parse(fileContent);
                // Handle both direct array and wrapped format
                toolsData = Array.isArray(jsonData) ? jsonData : jsonData.data || [];
            } else if (file.type === 'text/csv') {
                // Simple CSV parsing (in production, use a proper CSV parser)
                const lines = fileContent.split('\n');
                const headers = lines[0].split(',').map(h => h.trim());
                toolsData = lines.slice(1)
                    .filter(line => line.trim())
                    .map(line => {
                        const values = line.split(',').map(v => v.trim());
                        const obj: any = {};
                        headers.forEach((header, index) => {
                            obj[header] = values[index] || '';
                        });
                        return obj;
                    });
            } else {
                throw new Error('Định dạng file không được hỗ trợ');
            }
        } catch (parseError) {
            throw createAdminError(AdminErrorCode.FILE_UPLOAD_ERROR, 'Không thể đọc nội dung file');
        }

        if (!Array.isArray(toolsData) || toolsData.length === 0) {
            throw createAdminError(AdminErrorCode.INVALID_INPUT, 'File không chứa dữ liệu hợp lệ');
        }

        // Import tools
        const result = await aiToolsService.importAITools(toolsData, user);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in POST /api/admin/ai-tools/import:', error);

        if (error instanceof Error && 'statusCode' in error) {
            return NextResponse.json(
                { error: error.message, code: (error as any).code },
                { status: (error as any).statusCode }
            );
        }

        return NextResponse.json(
            { error: 'Lỗi server nội bộ', code: AdminErrorCode.INTERNAL_ERROR },
            { status: 500 }
        );
    }
}