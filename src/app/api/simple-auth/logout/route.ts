import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '../../../../lib/simple-auth';

export async function POST(request: NextRequest) {
    try {
        const sessionId = request.cookies.get('simple-auth-session')?.value;

        if (sessionId) {
            deleteSession(sessionId);
        }

        const response = NextResponse.json({ success: true });
        response.cookies.delete('simple-auth-session');

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi đăng xuất' },
            { status: 500 }
        );
    }
}