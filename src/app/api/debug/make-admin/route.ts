import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({
                success: false,
                error: 'Email is required'
            }, { status: 400 });
        }

        // Cập nhật role thành admin
        const updatedUser = await prisma.user.update({
            where: { email },
            data: { role: 'admin' },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true
            }
        });

        return NextResponse.json({
            success: true,
            message: `✅ Đã cấp quyền admin cho ${email}`,
            data: updatedUser
        });
    } catch (error) {
        console.error('Error making admin:', error);
        return NextResponse.json({
            success: false,
            error: 'User not found or failed to update',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// GET để tạo admin mặc định
export async function GET() {
    try {
        // Tạo hoặc cập nhật admin user mặc định
        const adminUser = await prisma.user.upsert({
            where: { email: 'admin@example.com' },
            update: {
                role: 'admin',
                name: 'Admin User'
            },
            create: {
                email: 'admin@example.com',
                name: 'Admin User',
                role: 'admin',
                subjects: JSON.stringify(['Toán', 'Văn', 'Anh', 'Lý', 'Hóa']),
                gradeLevel: JSON.stringify([6, 7, 8, 9])
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true
            }
        });

        return NextResponse.json({
            success: true,
            message: '✅ Đã tạo/cập nhật admin user thành công!',
            data: adminUser,
            instructions: [
                '1. Truy cập: http://localhost:3001/auth/demo',
                '2. Nhập email: admin@example.com',
                '3. Nhập tên: Admin User',
                '4. Nhấn "Đăng nhập Demo"',
                '5. Sau đó truy cập: http://localhost:3001/admin/dashboard'
            ]
        });
    } catch (error) {
        console.error('Error creating admin:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to create admin user',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}