import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const sessions = await prisma.session.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true
                    }
                }
            },
            orderBy: {
                expires: 'desc'
            }
        });

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                sessions,
                users,
                sessionCount: sessions.length,
                userCount: users.length
            }
        });
    } catch (error) {
        console.error('Error checking sessions:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to check sessions',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}