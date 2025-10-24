import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { email, name } = await request.json();

        if (!email || !name) {
            return NextResponse.json(
                { error: 'Email và tên là bắt buộc' },
                { status: 400 }
            );
        }

        // Return success - the actual authentication will be handled by the client
        // using NextAuth signIn with the demo provider
        return NextResponse.json({
            success: true,
            message: 'Demo login data received',
            data: { email, name }
        });
    } catch (error) {
        console.error('Demo login error:', error);
        return NextResponse.json(
            { error: 'Đăng nhập thất bại' },
            { status: 500 }
        );
    }
}