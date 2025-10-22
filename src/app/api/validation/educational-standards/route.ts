import { NextResponse } from 'next/server';
import { z } from 'zod';
import { asyncHandler, ValidationError } from '@/lib/error-handling';
import { educationalStandardsValidator } from '@/services/validation/EducationalStandardsValidator';
import { BloomTaxonomyLevel } from '@/types/prompt';

// Validation schemas for different validation types
const LessonPlanValidationSchema = z.object({
    type: z.literal('lesson-plan'),
    data: z.object({
        subject: z.string(),
        gradeLevel: z.number(),
        lessonName: z.string(),
        pedagogicalStandard: z.string(),
    })
});

const PresentationValidationSchema = z.object({
    type: z.literal('presentation'),
    data: z.object({
        subject: z.string(),
        gradeLevel: z.number(),
        lessonName: z.string(),
        curriculumContent: z.string(),
        slideCount: z.number(),
    })
});

const AssessmentValidationSchema = z.object({
    type: z.literal('assessment'),
    data: z.object({
        subject: z.string(),
        gradeLevel: z.number(),
        topic: z.string(),
        questionCount: z.number(),
        bloomLevels: z.array(z.nativeEnum(BloomTaxonomyLevel)),
        questionType: z.string(),
    })
});

const ContentComplianceSchema = z.object({
    type: z.literal('content-compliance'),
    data: z.object({
        content: z.string().min(10, 'Nội dung quá ngắn để kiểm tra'),
        gradeLevel: z.number(),
        subject: z.string(),
    })
});

const ValidationRequestSchema = z.discriminatedUnion('type', [
    LessonPlanValidationSchema,
    PresentationValidationSchema,
    AssessmentValidationSchema,
    ContentComplianceSchema
]);

export const POST = asyncHandler(async (request: Request) => {
    const body = await request.json();
    const validatedRequest = ValidationRequestSchema.parse(body);

    let result;

    switch (validatedRequest.type) {
        case 'lesson-plan':
            result = educationalStandardsValidator.validateLessonPlan(validatedRequest.data);
            break;

        case 'presentation':
            result = educationalStandardsValidator.validatePresentation(validatedRequest.data);
            break;

        case 'assessment':
            result = educationalStandardsValidator.validateAssessment(validatedRequest.data);
            break;

        case 'content-compliance':
            const complianceReport = educationalStandardsValidator.validateLessonContent(
                validatedRequest.data.content,
                validatedRequest.data.gradeLevel as any,
                validatedRequest.data.subject as any
            );

            result = {
                isValid: complianceReport.overall.score >= 70,
                errors: complianceReport.overall.score < 50 ? ['Nội dung không đạt chuẩn tối thiểu'] : [],
                warnings: complianceReport.overall.score < 80 ? ['Nội dung cần cải thiện'] : [],
                suggestions: complianceReport.overall.recommendations,
                complianceScore: complianceReport.overall.score,
                detailedReport: complianceReport
            };
            break;

        default:
            throw new ValidationError('Loại xác thực không được hỗ trợ');
    }

    return NextResponse.json({
        success: true,
        data: result
    });
});

// GET endpoint for validation rules and guidelines
export const GET = asyncHandler(async (request: Request) => {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const guidelines = {
        'lesson-plan': {
            title: 'Hướng dẫn tạo giáo án theo GDPT 2018 và CV 5512',
            requirements: [
                'Tên bài học phải phản ánh mục tiêu và nội dung cụ thể',
                'Tuân thủ cấu trúc 4 hoặc 5 cột theo CV 5512',
                'Tích hợp phát triển năng lực và phẩm chất theo GDPT 2018',
                'Sử dụng thuật ngữ sư phạm chuyên nghiệp',
                'Phù hợp với khối lớp 6-9 (THCS)'
            ],
            keywords: {
                gdpt2018: ['năng lực', 'phẩm chất', 'tích hợp', 'hoạt động trải nghiệm'],
                cv5512: ['mục tiêu bài học', 'nội dung bài học', 'phương pháp dạy học', 'đánh giá kết quả']
            }
        },
        'presentation': {
            title: 'Hướng dẫn tạo slide thuyết trình',
            requirements: [
                'Nội dung phải dựa trên chương trình giáo dục chính thức',
                'Cấu trúc: Mở đầu - Nội dung chính - Kết luận',
                'Số slide phù hợp với thời gian và độ tuổi học sinh',
                'Tích hợp hình ảnh và hoạt động tương tác',
                'Tuân thủ nguyên tắc thiết kế giáo dục'
            ],
            slideGuidelines: {
                'grades-6-7': 'Nên có 7-12 slide, nội dung đơn giản, trực quan',
                'grades-8-9': 'Có thể có 10-15 slide, nội dung phong phú hơn'
            }
        },
        'assessment': {
            title: 'Hướng dẫn tạo câu hỏi đánh giá',
            requirements: [
                'Phân bố cân bằng các mức độ tư duy Bloom',
                'Phù hợp với khối lớp và mục tiêu bài học',
                'Câu hỏi rõ ràng, không gây nhầm lẫn',
                'Có đáp án và thang điểm cụ thể',
                'Đánh giá được cả kiến thức và kỹ năng'
            ],
            bloomGuidelines: {
                'grades-6-7': 'Tập trung vào Nhận biết, Thông hiểu, ít Vận dụng',
                'grades-8-9': 'Cân bằng tất cả các mức độ, tăng Phân tích, Tổng hợp'
            }
        }
    };

    if (type && guidelines[type as keyof typeof guidelines]) {
        return NextResponse.json({
            success: true,
            data: guidelines[type as keyof typeof guidelines]
        });
    }

    return NextResponse.json({
        success: true,
        data: {
            availableTypes: Object.keys(guidelines),
            generalGuidelines: {
                gradeRestriction: 'Hệ thống chỉ hỗ trợ lớp 6-9 (THCS)',
                subjects: 'Chỉ các môn học trong chương trình GDPT 2018',
                standards: 'Tuân thủ GDPT 2018 và Công văn 5512',
                language: 'Sử dụng tiếng Việt và thuật ngữ sư phạm chuẩn'
            }
        }
    });
});