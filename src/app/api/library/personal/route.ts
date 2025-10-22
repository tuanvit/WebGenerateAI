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

            // Return empty content for new user
            return NextResponse.json({
                content: [],
                stats: {
                    totalOwn: 0,
                    totalSaved: 0,
                    total: 0
                },
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 0
                }
            })
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const skip = (page - 1) * limit

        // Get user's own prompts
        const ownPrompts = await prisma.generatedPrompt.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
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
            type: 'own' as const
        }))

        // Parse tags for saved content
        const savedContentResponse = savedContent.map(item => ({
            id: item.content.id, // Content ID for deletion
            userLibraryId: item.id, // UserLibrary ID for reference
            title: item.content.title,
            description: item.content.description,
            generatedText: item.content.content,
            subject: item.content.subject,
            gradeLevel: item.content.gradeLevel,
            tags: item.content.tags ? JSON.parse(item.content.tags) : [],
            rating: item.content.rating,
            ratingCount: item.content.ratingCount,
            authorName: item.content.author.name || item.content.author.email,
            savedAt: item.savedAt,
            type: 'saved' as const
        }))

        // Combine and sort by date
        const allContent = [
            ...ownPromptsResponse.map(p => ({ ...p, sortDate: p.createdAt })),
            ...savedContentResponse.map(s => ({ ...s, sortDate: s.savedAt }))
        ].sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime())

        const totalOwn = await prisma.generatedPrompt.count({
            where: { userId: user.id }
        })

        const totalSaved = await prisma.userLibrary.count({
            where: { userId: user.id }
        })

        return NextResponse.json({
            content: allContent,
            stats: {
                totalOwn,
                totalSaved,
                total: totalOwn + totalSaved
            },
            pagination: {
                page,
                limit,
                total: totalOwn + totalSaved,
                totalPages: Math.ceil((totalOwn + totalSaved) / limit)
            }
        })
    } catch (error) {
        console.error("Lỗi lấy thư viện cá nhân:", error)
        return NextResponse.json(
            { error: "Lỗi server" },
            { status: 500 }
        )
    }
}