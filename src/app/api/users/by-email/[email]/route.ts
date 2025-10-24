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
    { params }: { params: Promise<{ email: string }> }
) {
    try {
        const { email } = await params;
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Không có quyền truy cập" },
                { status: 401 }
            )
        }

        const email = decodeURIComponent(email)

        // Users can only access their own profile
        if (session.user.email !== email) {
            return NextResponse.json(
                { error: "Không có quyền truy cập thông tin này" },
                { status: 403 }
            )
        }

        let user = await prisma.user.findUnique({
            where: { email },
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

        // If user doesn't exist, create one
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name: session.user.name || '',
                    subjects: JSON.stringify([]),
                    gradeLevel: JSON.stringify([]),
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
        }

        // Parse JSON strings back to arrays
        const userResponse = {
            ...user,
            subjects: user.subjects ? JSON.parse(user.subjects) : [],
            gradeLevel: user.gradeLevel ? JSON.parse(user.gradeLevel) : []
        }

        return NextResponse.json(userResponse)
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
    { params }: { params: Promise<{ email: string }> }
) {
    try {
        const { email } = await params;
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Không có quyền truy cập" },
                { status: 401 }
            )
        }

        const email = decodeURIComponent(email)

        // Users can only update their own profile
        if (session.user.email !== email) {
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

        const updatedUser = await prisma.user.upsert({
            where: { email },
            update: {
                name: validatedData.name,
                school: validatedData.school || null,
                subjects: JSON.stringify(validatedData.subjects),
                gradeLevel: JSON.stringify(validatedData.gradeLevel),
                lastLoginAt: new Date()
            },
            create: {
                email,
                name: validatedData.name,
                school: validatedData.school || null,
                subjects: JSON.stringify(validatedData.subjects),
                gradeLevel: JSON.stringify(validatedData.gradeLevel),
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

        // Parse JSON strings back to arrays
        const userResponse = {
            ...updatedUser,
            subjects: updatedUser.subjects ? JSON.parse(updatedUser.subjects) : [],
            gradeLevel: updatedUser.gradeLevel ? JSON.parse(updatedUser.gradeLevel) : []
        }

        return NextResponse.json(userResponse)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
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