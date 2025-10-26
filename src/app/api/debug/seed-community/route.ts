import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db-utils';

/**
 * POST /api/debug/seed-community - Add sample community content
 */
export async function POST(request: NextRequest) {
    try {
        // Get or create a sample user
        let sampleUser = await prisma.user.findFirst({
            where: { email: 'sample@teacher.com' }
        });

        if (!sampleUser) {
            sampleUser = await prisma.user.create({
                data: {
                    email: 'sample@teacher.com',
                    name: 'Cô Nguyễn Thị Lan',
                    school: 'THCS Nguyễn Du',
                    subjects: JSON.stringify(['Lịch sử', 'Địa lý']),
                    gradeLevel: JSON.stringify([6, 7, 8, 9])
                }
            });
        }

        // Sample content data
        const sampleContent = [
            {
                title: 'Bài giảng Lịch sử Việt Nam - Thời kỳ đấu tranh chống thực dân Pháp',
                description: 'Tài liệu giảng dạy về giai đoạn lịch sử quan trọng của dân tộc Việt Nam',
                content: `# Bài giảng: Thời kỳ đấu tranh chống thực dân Pháp

## I. Mục tiêu bài học
- Kiến thức: Học sinh nắm được các sự kiện quan trọng trong cuộc đấu tranh chống thực dân Pháp
- Kỹ năng: Phát triển kỹ năng phân tích tài liệu lịch sử
- Thái độ: Giáo dục lòng yêu nước, tự hào dân tộc

## II. Nội dung chính
### 1. Bối cảnh lịch sử
- Thực dân Pháp xâm lược Việt Nam (1858-1884)
- Chính sách thống trị của thực dân Pháp

### 2. Các cuộc khởi nghĩa
- Khởi nghĩa Cần Vương (1885-1896)
- Phong trào Đông Du (1905-1908)
- Khởi nghĩa Yên Thế (1884-1913)

### 3. Ý nghĩa lịch sử
- Thể hiện tinh thần bất khuất của dân tộc
- Tạo tiền đề cho các phong trào cách mạng sau này`,
                subject: 'Lịch sử',
                gradeLevel: 8,
                tags: JSON.stringify(['#LịchSử', '#ViệtNam', '#ThựcDânPháp', '#KhởiNghĩa']),
                rating: 4.8,
                ratingCount: 156,
                authorId: sampleUser.id
            },
            {
                title: 'Kế hoạch bài dạy Toán 8 - Phương trình bậc nhất một ẩn',
                description: 'Kế hoạch bài dạy chi tiết cho chương phương trình bậc nhất một ẩn',
                content: `# Kế hoạch bài dạy: Phương trình bậc nhất một ẩn

## I. Mục tiêu
- Kiến thức: Nắm được khái niệm phương trình bậc nhất một ẩn
- Kỹ năng: Giải được phương trình bậc nhất một ẩn
- Thái độ: Rèn luyện tính chính xác, logic

## II. Chuẩn bị
- Bảng phụ, phấn màu
- Bài tập về nhà

## III. Tiến trình dạy học
### 1. Kiểm tra bài cũ (5 phút)
- Nhắc lại khái niệm phương trình
- Nghiệm của phương trình

### 2. Bài mới (30 phút)
#### a) Khái niệm phương trình bậc nhất một ẩn
- Định nghĩa: ax + b = 0 (a ≠ 0)
- Ví dụ: 2x + 3 = 0

#### b) Cách giải
- Chuyển vế: 2x = -3
- Chia hai vế: x = -3/2

### 3. Luyện tập (8 phút)
- Bài tập 1: 3x - 6 = 0
- Bài tập 2: -2x + 8 = 0

### 4. Củng cố (2 phút)
- Nhắc lại công thức tổng quát
- Các bước giải phương trình`,
                subject: 'Toán học',
                gradeLevel: 8,
                tags: JSON.stringify(['#Toán8', '#PhươngTrình', '#BậcNhất', '#GiáoÁn']),
                rating: 4.6,
                ratingCount: 89,
                authorId: sampleUser.id
            },
            {
                title: 'Slide thuyết trình Địa lý - Khí hậu nhiệt đới',
                description: 'Bài thuyết trình về đặc điểm khí hậu nhiệt đới Việt Nam',
                content: `# Slide thuyết trình: Khí hậu nhiệt đới

## Slide 1: Tiêu đề
**Khí hậu nhiệt đới Việt Nam**
- Môn: Địa lý lớp 6
- Giáo viên: [Tên giáo viên]

## Slide 2: Mục tiêu bài học
- Nắm được đặc điểm khí hậu nhiệt đới
- Hiểu được ảnh hưởng của khí hậu đến đời sống
- Biết cách bảo vệ môi trường

## Slide 3: Đặc điểm nhiệt độ
- Nhiệt độ cao quanh năm (25-27°C)
- Biên độ nhiệt nhỏ
- Không có mùa đông lạnh

## Slide 4: Đặc điểm lượng mưa
- Lượng mưa lớn (1500-2000mm/năm)
- Có 2 mùa rõ rệt: mùa mưa và mùa khô
- Mưa tập trung vào mùa hè

## Slide 5: Ảnh hưởng đến đời sống
- Thuận lợi: Trồng trọt quanh năm
- Khó khăn: Bão lũ, hạn hán
- Cần biện pháp thích ứng

## Slide 6: Bài tập
1. Nêu đặc điểm khí hậu nhiệt đới?
2. Khí hậu ảnh hưởng như thế nào đến nông nghiệp?`,
                subject: 'Địa lý',
                gradeLevel: 6,
                tags: JSON.stringify(['#ĐịaLý', '#KhíHậu', '#NhiệtĐới', '#Slide']),
                rating: 4.4,
                ratingCount: 67,
                authorId: sampleUser.id
            }
        ];

        // Create sample content
        const createdContent = [];
        for (const content of sampleContent) {
            try {
                const created = await prisma.sharedContent.create({
                    data: content,
                    include: {
                        author: {
                            select: {
                                name: true,
                                school: true
                            }
                        }
                    }
                });
                createdContent.push(created);

                // Create some sample ratings for this content
                const ratingUsers = [
                    { email: 'teacher1@school.com', name: 'Thầy Minh', rating: 5 },
                    { email: 'teacher2@school.com', name: 'Cô Hương', rating: 4 },
                    { email: 'teacher3@school.com', name: 'Thầy Nam', rating: 5 }
                ];

                for (const ratingUser of ratingUsers) {
                    try {
                        // Get or create rating user
                        let user = await prisma.user.findFirst({
                            where: { email: ratingUser.email }
                        });

                        if (!user) {
                            user = await prisma.user.create({
                                data: {
                                    email: ratingUser.email,
                                    name: ratingUser.name,
                                    subjects: JSON.stringify(['Toán học']),
                                    gradeLevel: JSON.stringify([6, 7, 8, 9])
                                }
                            });
                        }

                        // Create rating if user is not the author
                        if (user.id !== created.authorId) {
                            await prisma.contentRating.create({
                                data: {
                                    userId: user.id,
                                    contentId: created.id,
                                    rating: ratingUser.rating
                                }
                            });
                        }
                    } catch (ratingError) {
                        console.log('Rating might already exist for user:', ratingUser.email);
                    }
                }

                // Recalculate average rating
                const ratings = await prisma.contentRating.findMany({
                    where: { contentId: created.id }
                });

                if (ratings.length > 0) {
                    const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
                    const averageRating = totalRating / ratings.length;

                    await prisma.sharedContent.update({
                        where: { id: created.id },
                        data: {
                            rating: averageRating,
                            ratingCount: ratings.length
                        }
                    });
                }

            } catch (error) {
                console.log('Content might already exist:', content.title);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Đã tạo ${createdContent.length} nội dung mẫu`,
            data: createdContent
        });

    } catch (error) {
        console.error('Error seeding community content:', error);
        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi tạo dữ liệu mẫu' },
            { status: 500 }
        );
    }
}