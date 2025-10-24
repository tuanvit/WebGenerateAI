import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db-utils"
import { z } from "zod"

const updateUserSchema = z.object({
    name: z.string().min(1, "Tên không được để trống"),
    school: z.string().optional(),
    subjects: z.array(z.string()).min(1, "Phải chọn ít nhất một môn học"),
    gradeLevel: z.array(z.number().min(6).max(9)).min(1, "Phải chọn ít nhất một khối lớp")
})

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Không có quyền truy cập" },
                { status: 401 }
            )
        }

        // Users can only access their own profile
        if (session.user.id !== id) {
            return NextResponse.json(
                { error: "Không có quyền truy cập thông tin này" },
                { status: 403 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                school: true,
                subjects: true,
                gradeLevel: true,
                createdAt: true,
                lastLoginAt: true
            }
        })

        if (!user) {
            return NextResponse.json(
                { error: "Không tìm thấy người dùng" },
                { status: 404 }
            )
        }

        return NextResponse.json(user)
    } catch (error) {
        console.error("Lỗi lấy thông tin người dùng:", error)
        return NextResponse.json(
            { error: "Lỗi server" },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Không có quyền truy cập" },
                { status: 401 }
            )
        }

        // Users can only update their own profile
        if (session.user.id !== id) {
            return NextResponse.json(
                { error: "Không có quyền cập nhật thông tin này" },
                { status: 403 }
            )
        }

        const body = await request.json()
        const validatedData = updateUserSchema.parse(body)

        // Validate grade levels are within allowed range (6-9)
        const invalidGrades = validatedData.gradeLevel.filter(grade => grade < 6 || grade > 9)
        if (invalidGrades.length > 0) {
            return NextResponse.json(
                { error: "Chỉ hỗ trợ khối lớp 6-9" },
                { status: 400 }
            )
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                name: validatedData.name,
                school: validatedData.school || null,
                subjects: validatedData.subjects,
                gradeLevel: validatedData.gradeLevel,
                lastLoginAt: new Date()
            },
            select: {
                id: true,
                email: true,
                name: true,
                school: true,
                subjects: true,
                gradeLevel: true,
                createdAt: true,
                lastLoginAt: true
            }
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            )
        }

        console.error("Lỗi cập nhật người dùng:", error)
        return NextResponse.json(
            { error: "Lỗi server" },
            { status: 500 }
        )
    }
}