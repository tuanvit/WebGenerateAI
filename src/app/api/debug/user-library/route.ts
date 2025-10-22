import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db-utils"

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
            return NextResponse.json(
                { error: "Không tìm thấy người dùng" },
                { status: 404 }
            )
        }

        // Get user's saved content
        const userLibrary = await prisma.userLibrary.findMany({
            where: { userId: user.id },
            select: {
                id: true,
                savedAt: true,
                content: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        subject: true,
                        gradeLevel: true,
                        tags: true,
                        rating: true,
                        ratingCount: true,
                        author: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                savedAt: 'desc'
            }
        })

        // Parse tags for each content
        const libraryResponse = userLibrary.map(item => ({
            ...item,
            content: {
                ...item.content,
                tags: item.content.tags ? JSON.parse(item.content.tags) : [],
                authorName: item.content.author.name || item.content.author.email
            }
        }))

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            },
            count: userLibrary.length,
            library: libraryResponse
        })
    } catch (error) {
        console.error("Lỗi debug user library:", error)
        return NextResponse.json(
            { error: "Lỗi server", details: error },
            { status: 500 }
        )
    }
}