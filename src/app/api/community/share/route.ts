import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db-utils"
import { z } from "zod"

const shareContentSchema = z.object({
    promptId: z.string(),
    title: z.string().min(1, "Tiêu đề không được để trống"),
    description: z.string().min(1, "Mô tả không được để trống"),
    subject: z.string(),
    gradeLevel: z.number().min(6).max(9),
    tags: z.array(z.string()).optional()
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
        const validatedData = shareContentSchema.parse(body)

        // Verify that the prompt belongs to the user
        const prompt = await prisma.generatedPrompt.findFirst({
            where: {
                id: validatedData.promptId,
                userId: user.id
            }
        })

        if (!prompt) {
            return NextResponse.json(
                { error: "Không tìm thấy prompt hoặc bạn không có quyền chia sẻ" },
                { status: 404 }
            )
        }

        // Check if already shared
        const existingShare = await prisma.sharedContent.findFirst({
            where: {
                authorId: user.id,
                title: validatedData.title
            }
        })

        if (existingShare) {
            return NextResponse.json(
                { error: "Bạn đã chia sẻ nội dung với tiêu đề này rồi" },
                { status: 400 }
            )
        }

        // Create shared content
        const sharedContent = await prisma.sharedContent.create({
            data: {
                authorId: user.id,
                title: validatedData.title,
                description: validatedData.description,
                content: prompt.generatedText,
                subject: validatedData.subject,
                gradeLevel: validatedData.gradeLevel,
                tags: validatedData.tags ? JSON.stringify(validatedData.tags) : null
            },
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
                author: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        })

        // Update the original prompt to mark as shared
        await prisma.generatedPrompt.update({
            where: { id: validatedData.promptId },
            data: { isShared: true }
        })

        // Parse tags back to array
        const sharedContentResponse = {
            ...sharedContent,
            tags: sharedContent.tags ? JSON.parse(sharedContent.tags) : []
        }

        return NextResponse.json(sharedContentResponse)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            )
        }

        console.error("Lỗi chia sẻ nội dung:", error)
        return NextResponse.json(
            { error: "Lỗi server" },
            { status: 500 }
        )
    }
}