import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials, createSession } from '../../../../lib/simple-auth';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email và mật khẩu là bắt buộc' },
                { status: 400 }
            );
        }

        const user = validateCredentials(email, password);
        if (!user) {
            return NextResponse.json(
                { error: 'Email hoặc mật khẩu không đúng' },
                { status: 401 }
            );
        }

        // Create session
        const sessionId = createSession(user.id);

        // Set cookie
        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });

        response.cookies.set('simple-auth-session', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60, // 24 hours
            path: '/'
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi đăng nhập' },
            { status: 500 }
        );
    }
}