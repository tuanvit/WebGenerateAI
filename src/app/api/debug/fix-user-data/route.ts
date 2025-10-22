import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db-utils';

/**
 * POST /api/debug/fix-user-data - Fix user data issues
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({
                success: false,
                message: 'No session found'
            });
        }

        const sessionUserId = session.user.id;
        const sessionEmail = session.user.email;

        console.log('Session data:', {
            userId: sessionUserId,
            email: sessionEmail,
            name: session.user.name
        });

        // Check if user exists by ID
        let userById = await prisma.user.findUnique({
            where: { id: sessionUserId }
        });

        // Check if user exists by email
        let userByEmail = sessionEmail ? await prisma.user.findUnique({
            where: { email: sessionEmail }
        }) : null;

        console.log('Existing users:', {
            userById: userById ? { id: userById.id, email: userById.email } : null,
            userByEmail: userByEmail ? { id: userByEmail.id, email: userByEmail.email } : null
        });

        let finalUser = null;

        if (userById) {
            // User exists with correct ID
            finalUser = userById;
        } else if (userByEmail && userByEmail.id !== sessionUserId) {
            // User exists with different ID, delete and recreate
            console.log('Deleting user with different ID:', userByEmail.id);

            // First delete related data
            await prisma.contentRating.deleteMany({
                where: { userId: userByEmail.id }
            });

            await prisma.userLibrary.deleteMany({
                where: { userId: userByEmail.id }
            });

            await prisma.generatedPrompt.deleteMany({
                where: { userId: userByEmail.id }
            });

            // Delete the user
            await prisma.user.delete({
                where: { id: userByEmail.id }
            });

            // Create new user with correct ID
            finalUser = await prisma.user.create({
                data: {
                    id: sessionUserId,
                    email: sessionEmail || '',
                    name: session.user.name || '',
                    subjects: JSON.stringify([]),
                    gradeLevel: JSON.stringify([]),
                    lastLoginAt: new Date()
                }
            });
        } else if (!userById && !userByEmail) {
            // No user exists, create new one
            finalUser = await prisma.user.create({
                data: {
                    id: sessionUserId,
                    email: sessionEmail || '',
                    name: session.user.name || '',
                    subjects: JSON.stringify([]),
                    gradeLevel: JSON.stringify([]),
                    lastLoginAt: new Date()
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: 'User data fixed successfully',
            data: {
                sessionUserId,
                sessionEmail,
                finalUser: finalUser ? {
                    id: finalUser.id,
                    email: finalUser.email,
                    name: finalUser.name
                } : null,
                actions: {
                    hadUserById: !!userById,
                    hadUserByEmail: !!userByEmail,
                    recreatedUser: !userById && !!userByEmail,
                    createdNewUser: !userById && !userByEmail
                }
            }
        });

    } catch (error) {
        console.error('Fix user data error:', error);

        return NextResponse.json({
            success: false,
            error: 'Fix user data failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}