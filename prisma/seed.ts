import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // Create sample users (Vietnamese teachers)
    const teacher1 = await prisma.user.upsert({
        where: { email: 'nguyen.van.a@school.edu.vn' },
        update: {},
        create: {
            email: 'nguyen.van.a@school.edu.vn',
            name: 'Nguyễn Văn A',
            school: 'THCS Lê Quý Đôn',
            subjects: ['Toán học', 'Vật lý'],
            gradeLevel: [6, 7, 8, 9],
        },
    })

    const teacher2 = await prisma.user.upsert({
        where: { email: 'tran.thi.b@school.edu.vn' },
        update: {},
        create: {
            email: 'tran.thi.b@school.edu.vn',
            name: 'Trần Thị B',
            school: 'THCS Nguyễn Du',
            subjects: ['Ngữ văn', 'Lịch sử'],
            gradeLevel: [6, 7],
        },
    })

    const teacher3 = await prisma.user.upsert({
        where: { email: 'le.van.c@school.edu.vn' },
        update: {},
        create: {
            email: 'le.van.c@school.edu.vn',
            name: 'Lê Văn C',
            school: 'THCS Trần Hưng Đạo',
            subjects: ['Tiếng Anh', 'Địa lý'],
            gradeLevel: [8, 9],
        },
    })

    // Create sample generated prompts
    const prompt1 = await prisma.generatedPrompt.create({
        data: {
            userId: teacher1.id,
            inputParameters: {
                subject: 'Toán học',
                gradeLevel: 7,
                lessonName: 'Phương trình bậc nhất một ẩn',
                pedagogicalStandard: 'GDPT 2018',
                outputFormat: 'five-column',
                targetTool: 'chatgpt'
            },
            generatedText: 'Bạn là một giáo viên Toán học chuyên nghiệp. Hãy tạo một kế hoạch bài dạy 5 cột cho chủ đề "Phương trình bậc nhất một ẩn" dành cho học sinh lớp 7 theo chuẩn GDPT 2018...',
            targetTool: 'chatgpt',
            tags: ['#Chuẩn5512', '#ToánHọc', '#Lớp7'],
        },
    })

    const prompt2 = await prisma.generatedPrompt.create({
        data: {
            userId: teacher2.id,
            inputParameters: {
                subject: 'Ngữ văn',
                gradeLevel: 6,
                lessonName: 'Tả người',
                pedagogicalStandard: 'GDPT 2018',
                outputFormat: 'four-column',
                targetTool: 'gemini'
            },
            generatedText: 'Bạn là một giáo viên Ngữ văn có kinh nghiệm. Hãy tạo kế hoạch bài dạy 4 cột cho chủ đề "Tả người" dành cho học sinh lớp 6...',
            targetTool: 'gemini',
            tags: ['#NgữVăn', '#TảNgười', '#Lớp6'],
        },
    })

    // Create prompt versions
    await prisma.promptVersion.create({
        data: {
            promptId: prompt1.id,
            version: 1,
            content: prompt1.generatedText,
        },
    })

    await prisma.promptVersion.create({
        data: {
            promptId: prompt2.id,
            version: 1,
            content: prompt2.generatedText,
        },
    })

    // Create shared content
    const sharedContent1 = await prisma.sharedContent.create({
        data: {
            authorId: teacher1.id,
            title: 'Kế hoạch bài dạy: Phương trình bậc nhất',
            description: 'Kế hoạch bài dạy chi tiết cho chủ đề phương trình bậc nhất một ẩn, áp dụng phương pháp dạy học tích cực',
            content: 'Kế hoạch bài dạy 5 cột theo chuẩn CV 5512...',
            subject: 'Toán học',
            gradeLevel: 7,
            tags: ['#Chuẩn5512', '#ToánHọc', '#PhươngTrình', '#DạyHọcTíchCực'],
            rating: 4.5,
            ratingCount: 12,
        },
    })

    const sharedContent2 = await prisma.sharedContent.create({
        data: {
            authorId: teacher2.id,
            title: 'Dàn ý slide: Kỹ năng tả người',
            description: 'Dàn ý slide thuyết trình về kỹ năng tả người trong văn học, phù hợp với học sinh lớp 6',
            content: 'Slide 1: Giới thiệu về kỹ năng tả người...',
            subject: 'Ngữ văn',
            gradeLevel: 6,
            tags: ['#NgữVăn', '#TảNgười', '#KỹNăng', '#SángTạo'],
            rating: 4.2,
            ratingCount: 8,
        },
    })

    // Create content ratings
    await prisma.contentRating.create({
        data: {
            userId: teacher2.id,
            contentId: sharedContent1.id,
            rating: 5,
        },
    })

    await prisma.contentRating.create({
        data: {
            userId: teacher3.id,
            contentId: sharedContent1.id,
            rating: 4,
        },
    })

    await prisma.contentRating.create({
        data: {
            userId: teacher1.id,
            contentId: sharedContent2.id,
            rating: 4,
        },
    })

    // Create user library entries
    await prisma.userLibrary.create({
        data: {
            userId: teacher2.id,
            contentId: sharedContent1.id,
        },
    })

    await prisma.userLibrary.create({
        data: {
            userId: teacher3.id,
            contentId: sharedContent2.id,
        },
    })

    console.log('Seeding completed successfully!')
    console.log(`Created users: ${teacher1.name}, ${teacher2.name}, ${teacher3.name}`)
    console.log(`Created ${2} generated prompts`)
    console.log(`Created ${2} shared content items`)
    console.log(`Created ${3} content ratings`)
    console.log(`Created ${2} user library entries`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })