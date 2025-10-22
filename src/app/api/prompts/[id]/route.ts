import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db-utils"
import { z } from "zod"

const updatePromptSchema = z.object({
    title: z.string().min(1, "Tiêu đề không được để trống").optional(),
    content: z.string().min(1, "Nội dung prompt không được để trống").optional(),
    tags: z.array(z.string()).optional(),
    isShared: z.boolean().optional()
})

export async function GET(
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

        const prompt = await prisma.generatedPrompt.findFirst({
            where: {
                id: params.id,
                userId: user.id
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

        if (!prompt) {
            return NextResponse.json(
                { error: "Không tìm thấy prompt" },
                { status: 404 }
            )
        }

        // Parse tags back to array
        const promptResponse = {
            ...prompt,
            tags: prompt.tags ? JSON.parse(prompt.tags) : []
        }

        return NextResponse.json(promptResponse)
    } catch (error) {
        console.error("Lỗi lấy thông tin prompt:", error)
        return NextResponse.json(
            { error: "Lỗi server" },
            { status: 500 }
        )
    }
}

export async function PUT(
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

        // Verify prompt belongs to user
        const existingPrompt = await prisma.generatedPrompt.findFirst({
            where: {
                id: params.id,
                userId: user.id
            }
        })

        if (!existingPrompt) {
            return NextResponse.json(
                { error: "Không tìm thấy prompt hoặc bạn không có quyền chỉnh sửa" },
                { status: 404 }
            )
        }

        const body = await request.json()
        const validatedData = updatePromptSchema.parse(body)

        const updateData: any = {}
        if (validatedData.content) updateData.generatedText = validatedData.content
        if (validatedData.tags) updateData.tags = JSON.stringify(validatedData.tags)
        if (validatedData.isShared !== undefined) updateData.isShared = validatedData.isShared

        const updatedPrompt = await prisma.generatedPrompt.update({
            where: { id: params.id },
            data: updateData,
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
            ...updatedPrompt,
            tags: updatedPrompt.tags ? JSON.parse(updatedPrompt.tags) : []
        }

        return NextResponse.json(promptResponse)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            )
        }

        console.error("Lỗi cập nhật prompt:", error)
        return NextResponse.json(
            { error: "Lỗi server" },
            { status: 500 }
        )
    }
}

export async function DELETE(
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

        // Verify prompt belongs to user
        const existingPrompt = await prisma.generatedPrompt.findFirst({
            where: {
                id: params.id,
                userId: user.id
            }
        })

        if (!existingPrompt) {
            return NextResponse.json(
                { error: "Không tìm thấy prompt hoặc bạn không có quyền xóa" },
                { status: 404 }
            )
        }

        // Delete the prompt
        await prisma.generatedPrompt.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ message: "Đã xóa prompt thành công" })
    } catch (error) {
        console.error("Lỗi xóa prompt:", error)
        return NextResponse.json(
            { error: "Lỗi server" },
            { status: 500 }
        )
    }
}