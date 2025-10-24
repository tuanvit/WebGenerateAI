import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {
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
            // Auto-create user if not exists
            const newUser = await prisma.user.create({
                data: {
                    email: session.user.email,
                    name: session.user.name || '',
                    subjects: JSON.stringify([]),
                    gradeLevel: JSON.stringify([]),
                    lastLoginAt: new Date()
                }
            })

            // Return empty stats for new user
            return NextResponse.json({
                user: {
                    totalPrompts: 0,
                    sharedPrompts: 0,
                    savedPrompts: 0,
                    userSharedContent: 0
                },
                community: {
                    totalContent: await prisma.sharedContent.count()
                }
            })
        }

        // Get user's prompt statistics
        const totalPrompts = await prisma.generatedPrompt.count({
            where: { userId: user.id }
        })

        const sharedPrompts = await prisma.generatedPrompt.count({
            where: {
                userId: user.id,
                isShared: true
            }
        })

        const savedPrompts = await prisma.userLibrary.count({
            where: { userId: user.id }
        })

        // Get community statistics
        const totalCommunityContent = await prisma.sharedContent.count()

        const userSharedContent = await prisma.sharedContent.count({
            where: { authorId: user.id }
        })

        return NextResponse.json({
            user: {
                totalPrompts,
                sharedPrompts,
                savedPrompts,
                userSharedContent
            },
            community: {
                totalContent: totalCommunityContent
            }
        })
    } catch (error) {
        console.error("Lỗi lấy thống kê thư viện:", error)
        return NextResponse.json(
            { error: "Lỗi server" },
            { status: 500 }
        )
    }
}