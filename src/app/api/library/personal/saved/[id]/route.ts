import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db-utils"

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions)

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: "Không có quyền truy cập" },
                { status: 401 }
            )
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json(
                { error: "Không tìm thấy người dùng" },
                { status: 404 }
            )
        }

        // Find the saved content entry
        const savedContent = await prisma.userLibrary.findFirst({
            where: {
                userId: user.id,
                contentId: id
            }
        })

        if (!savedContent) {
            return NextResponse.json(
                { error: "Không tìm thấy nội dung đã lưu" },
                { status: 404 }
            )
        }

        // Delete the saved content entry
        await prisma.userLibrary.delete({
            where: { id: savedContent.id }
        })

        return NextResponse.json({
            success: true,
            message: "Đã xóa khỏi thư viện cá nhân"
        })
    } catch (error) {
        console.error("Lỗi xóa nội dung đã lưu:", error)
        return NextResponse.json(
            { error: "Lỗi server" },
            { status: 500 }
        )
    }
}