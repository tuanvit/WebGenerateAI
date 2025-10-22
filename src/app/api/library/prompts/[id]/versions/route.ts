import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { VersionManager } from '../../../../../../services/library';
import { NotFoundError, UnauthorizedError } from '../../../../../../types/services';

const versionManager = new VersionManager();

/**
 * GET /api/library/prompts/[id]/versions - Get version history for a prompt
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Chưa đăng nhập' },
                { status: 401 }
            );
        }

        const promptId = params.id;

        const versions = await versionManager.getVersionHistory(promptId);

        return NextResponse.json({
            success: true,
            data: versions,
        });
    } catch (error) {
        console.error('Failed to get version history:', error);

        if (error instanceof NotFoundError) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Không thể lấy lịch sử phiên bản' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/library/prompts/[id]/versions - Create a new version
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Chưa đăng nhập' },
                { status: 401 }
            );
        }

        const promptId = params.id;
        const body = await request.json();
        const { content } = body;

        if (!content) {
            return NextResponse.json(
                { success: false, error: 'Nội dung phiên bản không được để trống' },
                { status: 400 }
            );
        }

        const version = await versionManager.createVersion(promptId, content);

        return NextResponse.json({
            success: true,
            data: version,
            message: 'Phiên bản mới đã được tạo',
        });
    } catch (error) {
        console.error('Failed to create version:', error);

        if (error instanceof NotFoundError) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Không thể tạo phiên bản mới' },
            { status: 500 }
        );
    }
}