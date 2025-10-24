import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const shareContentSchema = z.object({
    promptId: z.string().min(1, "Prompt ID không được để trống"),
    title: z.string().min(1, "Tiêu đề không được để trống"),
    description: z.string().min(1, "Mô tả không được để trống"),
    subject: z.string().min(1, "Môn học không được để trống"),
    gradeLevel: z
        .number()
        .int("Khối lớp phải là số nguyên")
        .min(6, "Khối lớp tối thiểu là 6")
        .max(9, "Khối lớp tối đa là 9"),
    tags: z.array(z.string()).optional().default([]),
});

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: "Không có quyền truy cập" },
                { status: 401 }
            );
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Không tìm thấy người dùng" },
                { status: 404 }
            );
        }

        const body = await request.json();

        // Validate the data
        const validationResult = shareContentSchema.safeParse(body);

        if (!validationResult.success) {
            console.error("Validation errors:", validationResult.error.issues);
            const errorMessages = validationResult.error.issues
                .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
                .join(", ");
            return NextResponse.json(
                {
                    error: "Dữ liệu không hợp lệ",
                    details: errorMessages,
                    issues: validationResult.error.issues,
                },
                { status: 400 }
            );
        }

        const validatedData = validationResult.data;

        // Verify that the prompt belongs to the user
        const prompt = await prisma.generatedPrompt.findFirst({
            where: {
                id: validatedData.promptId,
                userId: user.id,
            },
        });
        ``;
        if (!prompt) {
            return NextResponse.json(
                {
                    error: "Không tìm thấy prompt hoặc bạn không có quyền chia sẻ",
                },
                { status: 404 }
            );
        }

        // Check if already shared
        const existingShare = await prisma.sharedContent.findFirst({
            where: {
                authorId: user.id,
                title: validatedData.title,
            },
        });

        if (existingShare) {
            return NextResponse.json(
                { error: "Bạn đã chia sẻ nội dung với tiêu đề này rồi" },
                { status: 400 }
            );
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
                tags: validatedData.tags
                    ? JSON.stringify(validatedData.tags)
                    : null,
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
                        email: true,
                    },
                },
            },
        });

        // Update the original prompt to mark as shared
        await prisma.generatedPrompt.update({
            where: { id: validatedData.promptId },
            data: { isShared: true },
        });

        // Parse tags back to array
        const sharedContentResponse = {
            ...sharedContent,
            tags: sharedContent.tags ? JSON.parse(sharedContent.tags) : [],
        };

        return NextResponse.json(sharedContentResponse);
    } catch (error) {
        console.error("Lỗi chia sẻ nội dung:", error);

        if (error instanceof z.ZodError) {
            const errorMessages = error.issues
                .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
                .join(", ");
            return NextResponse.json(
                {
                    error: "Dữ liệu không hợp lệ",
                    details: errorMessages,
                    issues: error.issues,
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                error: "Lỗi server",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
