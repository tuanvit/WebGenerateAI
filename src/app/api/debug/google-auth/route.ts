import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
        }

        // Tìm user
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                accounts: true
            }
        });

        if (!user) {
            return NextResponse.json({
                message: 'User not found',
                email
            });
        }

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                createdAt: user.createdAt,
                lastLoginAt: user.lastLoginAt
            },
            accounts: user.accounts.map(acc => ({
                id: acc.id,
                provider: acc.provider,
                providerAccountId: acc.providerAccountId,
                type: acc.type
            }))
        });

    } catch (error) {
        console.error('Debug Google auth error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        // Tạo user mới cho Google auth
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                lastLoginAt: new Date()
            },
            create: {
                email,
                name: email.split('@')[0], // Tạm thời dùng phần trước @ làm tên
                subjects: JSON.stringify([]),
                gradeLevel: JSON.stringify([]),
                role: 'user',
                lastLoginAt: new Date()
            }
        });

        return NextResponse.json({
            message: 'User created/updated successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Create user error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}