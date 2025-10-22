import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db-utils';

/**
 * GET /api/debug/test-user-creation - Test user creation from session
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

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

        const userId = session.user.id;

        // Check if user exists
        let user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            console.log('Creating user from session:', {
                id: userId,
                email: session.user.email,
                name: session.user.name
            });

            // Create user if doesn't exist
            user = await prisma.user.create({
                data: {
                    id: userId,
                    email: session.user.email || '',
                    name: session.user.name || '',
                    subjects: JSON.stringify([]),
                    gradeLevel: JSON.stringify([]),
                    lastLoginAt: new Date()
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: 'User check/creation successful',
            data: {
                sessionUserId: userId,
                sessionUserEmail: session.user.email,
                sessionUserName: session.user.name,
                userExisted: !!user,
                userDBData: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    school: user.school,
                    createdAt: user.createdAt
                }
            }
        });

    } catch (error) {
        console.error('User creation test error:', error);

        return NextResponse.json({
            success: false,
            error: 'User creation test failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}