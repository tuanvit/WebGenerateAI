import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db-utils"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const subject = searchParams.get('subject')
        const gradeLevel = searchParams.get('gradeLevel')
        const search = searchParams.get('search')
        const sortBy = searchParams.get('sortBy') || 'rating'
        const sortOrder = searchParams.get('sortOrder') || 'desc'

        const skip = (page - 1) * limit

        // Build where clause
        const where: any = {}

        if (subject) {
            where.subject = subject
        }

        if (gradeLevel) {
            where.gradeLevel = parseInt(gradeLevel)
        }

        if (search) {
            where.OR = [
                { title: { contains: search } },
                { description: { contains: search } },
                { content: { contains: search } }
            ]
        }

        // Build orderBy clause
        let orderBy: any = {}
        switch (sortBy) {
            case 'rating':
                orderBy = { rating: sortOrder }
                break
            case 'date':
                orderBy = { updatedAt: sortOrder }
                break
            case 'popular':
                orderBy = { ratingCount: sortOrder }
                break
            default:
                orderBy = { rating: 'desc' }
        }

        const sharedContent = await prisma.sharedContent.findMany({
            where,
            orderBy,
            skip,
            take: limit,
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
                createdAt: true,
                updatedAt: true,
                author: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        })

        // Parse tags for each content
        const contentResponse = sharedContent.map(content => ({
            ...content,
            tags: content.tags ? JSON.parse(content.tags) : [],
            authorName: content.author.name || content.author.email
        }))

        const total = await prisma.sharedContent.count({ where })

        return NextResponse.json({
            content: contentResponse,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error("Lỗi lấy nội dung cộng đồng:", error)
        return NextResponse.json(
            { error: "Lỗi server" },
            { status: 500 }
        )
    }
}