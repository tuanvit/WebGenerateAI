import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/admin/admin-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        console.log('=== Testing Admin Auth ===');

        // Test 1: Check NextAuth session
        const session = await getServerSession(authOptions);
        console.log('NextAuth session:', session);

        // Test 2: Check cookies
        const cookieName = process.env.NODE_ENV === 'production'
            ? '__Secure-next-auth.session-token'
            : 'next-auth.session-token';

        const sessionToken = request.cookies.get(cookieName)?.value;
        console.log('Session token from cookie:', sessionToken);

        // Test 3: Check database session
        if (sessionToken) {
            const dbSession = await prisma.session.findUnique({
                where: { sessionToken },
                include: {
                    user: {
                        select: { id: true, email: true, name: true, role: true }
                    }
                }
            });
            console.log('Database session:', dbSession);
        }

        // Test 4: Try requireAdminRole
        let adminUser = null;
        let adminError = null;
        try {
            adminUser = await requireAdminRole(request);
        } catch (error) {
            adminError = error;
        }

        return NextResponse.json({
            success: true,
            data: {
                nextAuthSession: session,
                sessionToken,
                adminUser,
                adminError: adminError ? {
                    message: adminError.message,
                    code: adminError.code
                } : null
            }
        });
    } catch (error) {
        console.error('Test admin auth error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}