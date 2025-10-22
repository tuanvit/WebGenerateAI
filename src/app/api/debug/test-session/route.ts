import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db-utils';

/**
 * GET /api/debug/test-session - Test session and user data
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        console.log('Session data:', session);

        if (!session?.user?.id) {
            return NextResponse.json({
                success: false,
                message: 'No session found',
                data: {
                    session: session,
                    hasUser: !!session?.user,
                    hasUserId: !!session?.user?.id
                }
            });
        }

        // Try to find user in database
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        console.log('User found in DB:', user ? 'Yes' : 'No');

        return NextResponse.json({
            success: true,
            message: 'Session test successful',
            data: {
                sessionUserId: session.user.id,
                sessionUserEmail: session.user.email,
                sessionUserName: session.user.name,
                userFoundInDB: !!user,
                userDBData: user ? {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    school: user.school
                } : null
            }
        });

    } catch (error) {
        console.error('Session test error:', error);

        return NextResponse.json({
            success: false,
            error: 'Session test failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}