import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export async function POST(request: NextRequest) {
    try {
        const { email, name } = await request.json();

        if (!email || !name) {
            return NextResponse.json(
                { error: 'Email và tên là bắt buộc' },
                { status: 400 }
            );
        }

        // Tạo hoặc cập nhật user demo
        const user = await prisma.user.upsert({
            where: { email },
            update: { name },
            create: {
                email,
                name,
                subjects: JSON.stringify(['Toán', 'Văn']), // Default subjects
                gradeLevel: JSON.stringify([6, 7, 8, 9]), // Default grades
            },
        });

        // Tạo session token đơn giản
        const sessionToken = `demo-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

        await prisma.session.create({
            data: {
                sessionToken,
                userId: user.id,
                expires,
            },
        });

        // Set cookie
        const response = NextResponse.json({ success: true, user });
        response.cookies.set('next-auth.session-token', sessionToken, {
            expires,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Demo login error:', error);
        return NextResponse.json(
            { error: 'Đăng nhập thất bại' },
            { status: 500 }
        );
    }
}