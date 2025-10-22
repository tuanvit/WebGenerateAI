import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db-utils"
import { z } from "zod"

const saveContentSchema = z.object({
    contentId: z.string()
})

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: "Không có quyền truy cập" },
                { status: 401 }
            )
        }

        // Find user by email
        let user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            // Auto-create user if not exists
            user = await prisma.user.create({
                data: {
                    email: session.user.email,
                    name: session.user.name || '',
                    subjects: JSON.stringify([]),
                    gradeLevel: JSON.stringify([]),
                    lastLoginAt: new Date()
                }
            })
        }

        const body = await request.json()
        const { contentId } = saveContentSchema.parse(body)

        // Check if content exists
        const content = await prisma.sharedContent.findUnique({
            where: { id: contentId }
        })

        if (!content) {
            return NextResponse.json(
                { error: "Không tìm thấy nội dung" },
                { status: 404 }
            )
        }

        // Check if already saved
        const existingSave = await prisma.userLibrary.findUnique({
            where: {
                userId_contentId: {
                    userId: user.id,
                    contentId: contentId
                }
            }
        })

        if (existingSave) {
            return NextResponse.json(
                { error: "Nội dung đã được lưu trước đó" },
                { status: 400 }
            )
        }

        // Save to user library
        const savedContent = await prisma.userLibrary.create({
            data: {
                userId: user.id,
                contentId: contentId
            },
            select: {
                id: true,
                savedAt: true,
                content: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        content: true,
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
            }
        })

        // Parse tags
        const response = {
            ...savedContent,
            content: {
                ...savedContent.content,
                tags: savedContent.content.tags ? JSON.parse(savedContent.content.tags) : [],
                authorName: savedContent.content.author.name || savedContent.content.author.email
            }
        }

        return NextResponse.json({
            success: true,
            message: "Đã lưu vào thư viện cá nhân thành công!",
            data: response
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            )
        }

        console.error("Lỗi lưu nội dung:", error)
        return NextResponse.json(
            { error: "Lỗi server", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}