import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        // Xóa tất cả sessions cũ
        await prisma.session.deleteMany({});

        // Tạo response với cookies bị xóa
        const response = NextResponse.json({
            success: true,
            message: 'Đã xóa tất cả sessions và cookies'
        });

        // Xóa tất cả NextAuth cookies
        const cookiesToClear = [
            'next-auth.session-token',
            'next-auth.csrf-token',
            'next-auth.callback-url',
            '__Secure-next-auth.session-token',
            '__Host-next-auth.csrf-token'
        ];

        cookiesToClear.forEach(cookieName => {
            response.cookies.set(cookieName, '', {
                expires: new Date(0),
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });
        });

        return response;
    } catch (error) {
        console.error('Error clearing sessions:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to clear sessions',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Use POST method to clear sessions',
        instructions: [
            '1. POST to this endpoint to clear all sessions',
            '2. Then go to http://localhost:3000/auth/demo',
            '3. Login again with admin@example.com'
        ]
    });
}