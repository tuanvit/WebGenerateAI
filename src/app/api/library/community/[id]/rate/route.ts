import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db-utils"
import { z } from "zod"

const rateContentSchema = z.object({
    rating: z.number().min(1).max(5)
})

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const body = await request.json()
        const { rating } = rateContentSchema.parse(body)

        // Check if content exists
        const content = await prisma.sharedContent.findUnique({
            where: { id: params.id }
        })

        if (!content) {
            return NextResponse.json(
                { error: "Không tìm thấy nội dung" },
                { status: 404 }
            )
        }

        // Upsert rating
        await prisma.contentRating.upsert({
            where: {
                userId_contentId: {
                    userId: user.id,
                    contentId: params.id
                }
            },
            update: {
                rating
            },
            create: {
                userId: user.id,
                contentId: params.id,
                rating
            }
        })

        // Recalculate average rating
        const ratings = await prisma.contentRating.findMany({
            where: { contentId: params.id }
        })

        const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0)
        const averageRating = totalRating / ratings.length
        const ratingCount = ratings.length

        // Update shared content
        await prisma.sharedContent.update({
            where: { id: params.id },
            data: {
                rating: averageRating,
                ratingCount
            }
        })

        return NextResponse.json({
            newRating: averageRating,
            newRatingCount: ratingCount,
            userRating: rating
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            )
        }

        console.error("Lỗi đánh giá nội dung:", error)
        return NextResponse.json(
            { error: "Lỗi server" },
            { status: 500 }
        )
    }
}