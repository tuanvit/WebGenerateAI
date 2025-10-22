import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db-utils"

export async function GET(request: NextRequest) {
    try {
        // Get all shared content for debugging
        const sharedContent = await prisma.sharedContent.findMany({
            select: {
                id: true,
                title: true,
                description: true,
                subject: true,
                gradeLevel: true,
                tags: true,
                rating: true,
                ratingCount: true,
                createdAt: true,
                author: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Parse tags for each content
        const contentResponse = sharedContent.map(content => ({
            ...content,
            tags: content.tags ? JSON.parse(content.tags) : [],
            authorName: content.author.name || content.author.email
        }))

        return NextResponse.json({
            count: sharedContent.length,
            content: contentResponse
        })
    } catch (error) {
        console.error("Lỗi debug shared content:", error)
        return NextResponse.json(
            { error: "Lỗi server", details: error },
            { status: 500 }
        )
    }
}