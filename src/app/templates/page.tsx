'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TemplatesPage() {
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [selectedType, setSelectedType] = useState('all');

    const subjects = [
        { value: 'all', label: 'Tất cả môn học' },
        { value: 'toan', label: 'Toán học' },
        { value: 'van', label: 'Ngữ văn' },
        { value: 'anh', label: 'Tiếng Anh' },
        { value: 'su-dia', label: 'Lịch sử & Địa lí' },
        { value: 'khtn', label: 'Khoa học tự nhiên' },
        { value: 'ly', label: 'Vật lí' },
        { value: 'hoa', label: 'Hóa học' },
        { value: 'sinh', label: 'Sinh học' }
    ];

    const types = [
        { value: 'all', label: 'Tất cả loại' },
        { value: 'giao-an', label: 'Giáo án' },
        { value: 'slide', label: 'Slide thuyết trình' },
        { value: 'quiz', label: 'Câu hỏi trắc nghiệm' },
        { value: 'rubric', label: 'Thang đánh giá' }
    ];

    const templates = [
        {
            id: 1,
            title: 'Giáo án Toán 6 - Phân số',
            subject: 'toan',
            type: 'giao-an',
            grade: 6,
            description: 'Mẫu giáo án chi tiết về phân số cho học sinh lớp 6',
            prompt: `Bạn là một giáo viên Toán học chuyên nghiệp. Hãy tạo một giáo án chi tiết cho bài học "Phân số" dành cho học sinh lớp 6.

**Thông tin bài học:**
- Môn học: Toán học
- Lớp: 6
- Tên bài: Phân số
- Thời gian: 45 phút

**Yêu cầu:**
- Tuân thủ chặt chẽ chuẩn GDPT 2018 và Công văn 5512
- Áp dụng phương pháp dạy học tích cực
- Sử dụng đồ dùng trực quan (hình vẽ, mô hình)
- Có hoạt động nhóm và cá nhân

**Định dạng giáo án 5 cột:**
1. Hoạt động của giáo viên
2. Hoạt động của học sinh  
3. Nội dung kiến thức
4. Phương tiện dạy học
5. Ghi chú

**Cấu trúc bài học:**
1. Khởi động (5 phút): Chia bánh pizza để dẫn dắt khái niệm phân số
2. Hình thành kiến thức (30 phút): 
   - Khái niệm phân số
   - Cách đọc và viết phân số
   - Ý nghĩa của tử số và mẫu số
3. Luyện tập (8 phút): Bài tập nhận biết và áp dụng
4. Tóm tắt (2 phút): Củng cố kiến thức chính

Vui lòng tạo giáo án hoàn chỉnh bằng tiếng Việt.`
        },
        {
            id: 2,
            title: 'Slide Ngữ văn 7 - Văn tả người',
            subject: 'van',
            type: 'slide',
            grade: 7,
            description: 'Dàn ý slide về kỹ thuật tả người trong văn học',
            prompt: `Tạo dàn ý slide thuyết trình cho bài học "Văn tả người" môn Ngữ văn lớp 7.

**Yêu cầu slide:**
- Tổng cộng 10 slide
- Thiết kế sinh động, có hình ảnh minh họa
- Phù hợp với học sinh lớp 7

**Cấu trúc:**
1. Slide tiêu đề
2. Mục tiêu bài học
3. Khái niệm văn tả người
4. Đặc điểm của văn tả người
5. Kỹ thuật tả ngoại hình
6. Kỹ thuật tả tính cách
7. Kỹ thuật tả hành động
8. Ví dụ minh họa từ văn học
9. Bài tập thực hành
10. Tóm tắt và bài tập về nhà

Hãy tạo dàn ý chi tiết cho từng slide bằng tiếng Việt.`
        },
        {
            id: 3,
            title: 'Quiz Lịch sử 8 - Cách mạng tháng 8',
            subject: 'su-dia',
            type: 'quiz',
            grade: 8,
            description: 'Bộ câu hỏi trắc nghiệm về Cách mạng tháng 8 năm 1945',
            prompt: `Tạo bộ câu hỏi trắc nghiệm về "Cách mạng tháng 8 năm 1945" cho học sinh lớp 8.

**Yêu cầu:**
- 12 câu hỏi trắc nghiệm 4 đáp án
- Phân bố: 40% Nhận biết, 40% Hiểu, 20% Vận dụng
- Có đáp án và giải thích chi tiết

**Nội dung bao quát:**
- Bối cảnh lịch sử trước Cách mạng
- Diễn biến chính của Cách mạng
- Vai trò của Hồ Chí Minh và Đảng
- Ý nghĩa lịch sử của Cách mạng

**Định dạng:**
Câu [số]: [Nội dung câu hỏi]
A. [Đáp án A]
B. [Đáp án B]
C. [Đáp án C]  
D. [Đáp án D]

Đáp án: [Đáp án đúng]
Giải thích: [Lý do]

Hãy tạo bộ câu hỏi hoàn chỉnh bằng tiếng Việt.`
        },
        {
            id: 4,
            title: 'Rubric Tiếng Anh 9 - Speaking',
            subject: 'anh',
            type: 'rubric',
            grade: 9,
            description: 'Thang đánh giá kỹ năng nói tiếng Anh cho học sinh lớp 9',
            prompt: `Tạo thang đánh giá (rubric) cho kỹ năng Speaking tiếng Anh lớp 9.

**Thông tin:**
- Kỹ năng: Speaking (Nói)
- Lớp: 9
- Thời gian: 5-7 phút/học sinh
- Hình thức: Thuyết trình cá nhân

**4 mức độ đánh giá:**
1. Excellent (4 điểm)
2. Good (3 điểm)
3. Fair (2 điểm)
4. Poor (1 điểm)

**6 tiêu chí đánh giá:**
1. Pronunciation & Intonation (Phát âm)
2. Vocabulary (Từ vựng)
3. Grammar (Ngữ pháp)
4. Fluency (Độ trưng)
5. Content (Nội dung)
6. Confidence (Tự tin)

**Yêu cầu:**
- Mô tả cụ thể từng mức độ cho mỗi tiêu chí
- Phù hợp với trình độ học sinh lớp 9
- Có bảng tổng kết điểm

Hãy tạo thang đánh giá chi tiết bằng tiếng Việt.`
        },
        {
            id: 5,
            title: 'Giáo án Vật lí 9 - Định luật Ôm',
            subject: 'ly',
            type: 'giao-an',
            grade: 9,
            description: 'Giáo án thí nghiệm về định luật Ôm',
            prompt: `Tạo giáo án thí nghiệm "Định luật Ôm" cho học sinh lớp 9.

**Thông tin bài học:**
- Môn: Vật lí
- Lớp: 9
- Bài: Định luật Ôm
- Loại: Bài thí nghiệm

**Yêu cầu đặc biệt:**
- Tập trung vào thí nghiệm thực hành
- Hướng dẫn sử dụng dụng cụ an toàn
- Phân tích kết quả thí nghiệm
- Rút ra công thức định luật Ôm

**Dụng cụ thí nghiệm:**
- Nguồn điện, ampe kế, vôn kế
- Điện trở mẫu, dây dẫn
- Khóa điện, biến trở

**Cấu trúc:**
1. Khởi động: Đặt vấn đề về mối quan hệ U, I, R
2. Thí nghiệm 1: Khảo sát I theo U (R không đổi)
3. Thí nghiệm 2: Khảo sát I theo R (U không đổi)
4. Phân tích kết quả và rút ra định luật
5. Vận dụng giải bài tập

Tạo giáo án chi tiết với định dạng 5 cột.`
        },
        {
            id: 6,
            title: 'Slide Hóa học 8 - Bảng tuần hoàn',
            subject: 'hoa',
            type: 'slide',
            grade: 8,
            description: 'Slide giới thiệu bảng tuần hoàn các nguyên tố hóa học',
            prompt: `Tạo dàn ý slide "Bảng tuần hoàn các nguyên tố hóa học" lớp 8.

**Mục tiêu:**
- Giới thiệu cấu trúc bảng tuần hoàn
- Giải thích quy luật sắp xếp
- Ứng dụng trong học tập

**Cấu trúc 12 slide:**
1. Tiêu đề và giới thiệu
2. Lịch sử phát hiện bảng tuần hoàn
3. Cấu trúc tổng quát của bảng tuần hoàn
4. Khái niệm chu kì
5. Khái niệm nhóm (phân nhóm)
6. Quy luật sắp xếp theo số hiệu nguyên tử
7. Tính chất biến đổi tuần hoàn
8. Các nhóm nguyên tố tiêu biểu
9. Ứng dụng của bảng tuần hoàn
10. Bài tập vận dụng
11. Tóm tắt kiến thức
12. Câu hỏi ôn tập

**Yêu cầu:**
- Có hình ảnh bảng tuần hoàn đầy đủ
- Ví dụ cụ thể về các nguyên tố
- Phù hợp với trình độ lớp 8

Tạo dàn ý chi tiết cho từng slide.`
        }
    ];

    const filteredTemplates = templates.filter(template => {
        const subjectMatch = selectedSubject === 'all' || template.subject === selectedSubject;
        const typeMatch = selectedType === 'all' || template.type === selectedType;
        return subjectMatch && typeMatch;
    });

    const copyPrompt = (prompt: string) => {
        navigator.clipboard.writeText(prompt);
        alert('Đã sao chép prompt mẫu!');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Thư Viện Prompt Mẫu
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Bộ sưu tập prompt chuyên nghiệp theo từng môn học và loại nội dung
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Môn học
                            </label>
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {subjects.map((subject) => (
                                    <option key={subject.value} value={subject.value}>
                                        {subject.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Loại prompt
                            </label>
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {types.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {filteredTemplates.map((template) => (
                        <div key={template.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {template.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-3">
                                            {template.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 mb-4">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                        Lớp {template.grade}
                                    </span>
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                        {types.find(t => t.value === template.type)?.label}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <button
                                        onClick={() => copyPrompt(template.prompt)}
                                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-sm font-medium"
                                    >
                                        📋 Sao chép Prompt
                                    </button>

                                    <details className="group">
                                        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                                            👁️ Xem nội dung prompt
                                        </summary>
                                        <div className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-700 max-h-40 overflow-y-auto">
                                            <pre className="whitespace-pre-wrap">{template.prompt}</pre>
                                        </div>
                                    </details>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredTemplates.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy prompt mẫu</h3>
                        <p className="mt-1 text-sm text-gray-500">Thử thay đổi bộ lọc để xem thêm prompt khác.</p>
                    </div>
                )}

                {/* Call to Action */}
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                        Tạo prompt tùy chỉnh cho bài học của bạn
                    </h3>
                    <p className="text-blue-700 mb-4">
                        Sử dụng công cụ tạo prompt chuyên nghiệp để tạo nội dung phù hợp với yêu cầu cụ thể
                    </p>
                    <Link
                        href="/generate"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
                    >
                        🚀 Tạo Prompt Mới
                    </Link>
                </div>
            </div>
        </div>
    );
}