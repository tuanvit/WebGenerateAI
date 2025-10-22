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

        // Get user's own prompts
        const ownPrompts = await prisma.generatedPrompt.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                inputParameters: true,
                generatedText: true,
                targetTool: true,
                isShared: true,
                tags: true,
                createdAt: true
            }
        })

        // Get saved content from community
        const savedContent = await prisma.userLibrary.findMany({
            where: { userId: user.id },
            orderBy: { savedAt: 'desc' },
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

        // Parse tags for own prompts
        const ownPromptsResponse = ownPrompts.map(prompt => ({
            ...prompt,
            tags: prompt.tags ? JSON.parse(prompt.tags) : [],
            type: 'own'
        }))

        // Parse tags for saved content
        const savedContentResponse = savedContent.map(item => ({
            ...item,
            content: {
                ...item.content,
                tags: item.content.tags ? JSON.parse(item.content.tags) : [],
                authorName: item.content.author.name || item.content.author.email
            },
            type: 'saved'
        }))

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            },
            stats: {
                ownPrompts: ownPrompts.length,
                savedContent: savedContent.length,
                total: ownPrompts.length + savedContent.length
            },
            data: {
                ownPrompts: ownPromptsResponse,
                savedContent: savedContentResponse
            }
        })
    } catch (error) {
        console.error("Lỗi debug personal data:", error)
        return NextResponse.json(
            { error: "Lỗi server", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}