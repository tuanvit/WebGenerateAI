import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { email, providerAccountId } = await request.json();

        if (!email || !providerAccountId) {
            return NextResponse.json({
                error: 'Email and providerAccountId required'
            }, { status: 400 });
        }

        // Tìm user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json({
                error: 'User not found'
            }, { status: 404 });
        }

        // Kiểm tra xem account đã tồn tại chưa
        const existingAccount = await prisma.account.findUnique({
            where: {
                provider_providerAccountId: {
                    provider: 'google',
                    providerAccountId: providerAccountId
                }
            }
        });

        if (existingAccount) {
            return NextResponse.json({
                message: 'Account already linked',
                account: existingAccount
            });
        }

        // Tạo account record
        const account = await prisma.account.create({
            data: {
                userId: user.id,
                type: 'oauth',
                provider: 'google',
                providerAccountId: providerAccountId,
                // Các field khác có thể null
            }
        });

        return NextResponse.json({
            message: 'Google account linked successfully',
            account: {
                id: account.id,
                provider: account.provider,
                providerAccountId: account.providerAccountId
            }
        });

    } catch (error) {
        console.error('Link Google account error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}