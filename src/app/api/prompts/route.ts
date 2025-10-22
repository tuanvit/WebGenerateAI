import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db-utils"
import { ensureUserExists } from "@/lib/user-utils"
import { z } from "zod"

const createPromptSchema = z.object({
    title: z.string().min(1, "Tiêu đề không được để trống"),
    content: z.string().min(1, "Nội dung prompt không được để trống"),
    inputParameters: z.any(),
    targetTool: z.string(),
    tags: z.array(z.string()).optional(),
    isShared: z.boolean().default(false)
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

        // Ensure user exists
        const user = await ensureUserExists(session.user.email, session.user.name)

        const body = await request.json()
        const validatedData = createPromptSchema.parse(body)

        const prompt = await prisma.generatedPrompt.create({
            data: {
                userId: user.id,
                inputParameters: validatedData.inputParameters,
                generatedText: validatedData.content,
                targetTool: validatedData.targetTool,
                isShared: validatedData.isShared,
                tags: validatedData.tags ? JSON.stringify(validatedData.tags) : null
            },
            select: {
                id: true,
                inputParameters: true,
                generatedText: true,
                targetTool: true,
                isShared: true,
                tags: true,
                createdAt: true,
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        })

        // Parse tags back to array
        const promptResponse = {
            ...prompt,
            tags: prompt.tags ? JSON.parse(prompt.tags) : []
        }

        return NextResponse.json(promptResponse)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            )
        }

        console.error("Lỗi tạo prompt:", error)
        return NextResponse.json(
            { error: "Lỗi server" },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: "Không có quyền truy cập" },
                { status: 401 }
            )
        }

        // Ensure user exists
        const user = await ensureUserExists(session.user.email, session.user.name)

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const skip = (page - 1) * limit

        const prompts = await prisma.generatedPrompt.findMany({
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

        // Parse tags for each prompt
        const promptsResponse = prompts.map(prompt => ({
            ...prompt,
            tags: prompt.tags ? JSON.parse(prompt.tags) : []
        }))

        const total = await prisma.generatedPrompt.count({
            where: { userId: user.id }
        })

        return NextResponse.json({
            prompts: promptsResponse,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error("Lỗi lấy danh sách prompts:", error)
        return NextResponse.json(
            { error: "Lỗi server" },
            { status: 500 }
        )
    }
}