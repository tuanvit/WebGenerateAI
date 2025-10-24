import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        // Lấy tất cả users từ database
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                subjects: true,
                gradeLevel: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({
            success: true,
            data: users,
            count: users.length
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch users',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { email, role } = await request.json();

        if (!email || !role) {
            return NextResponse.json({
                success: false,
                error: 'Email and role are required'
            }, { status: 400 });
        }

        // Cập nhật role của user
        const updatedUser = await prisma.user.update({
            where: { email },
            data: { role },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return NextResponse.json({
            success: true,
            message: `Updated user ${email} role to ${role}`,
            data: updatedUser
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update user',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}