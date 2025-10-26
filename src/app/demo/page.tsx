'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function DemoPage() {
    const [selectedTool, setSelectedTool] = useState('ChatGPT');
    const [subject, setSubject] = useState('Toán học');
    const [gradeLevel, setGradeLevel] = useState(6);
    const [lessonName, setLessonName] = useState('');
    const [generatedPrompt, setGeneratedPrompt] = useState('');

    const generatePrompt = () => {
        if (!lessonName) {
            alert('Vui lòng nhập tên bài học');
            return;
        }

        const prompt = `Bạn là một giáo viên ${subject} chuyên nghiệp. Hãy tạo một kế hoạch bài dạy chi tiết cho bài học "${lessonName}" dành cho học sinh lớp ${gradeLevel} theo chuẩn GDPT 2018 và Công văn 5512.

Yêu cầu:
- Tuân thủ chặt chẽ chuẩn kiến thức kỹ năng lớp ${gradeLevel}
- Áp dụng phương pháp dạy học tích cực
- Bao gồm hoạt động cá nhân và nhóm
- Có đánh giá năng lực học sinh

Định dạng kế hoạch bài dạy 5 cột:
1. Hoạt động của giáo viên
2. Hoạt động của học sinh  
3. Nội dung kiến thức
4. Phương tiện dạy học
5. Ghi chú

Thời gian: 45 phút
Môn học: ${subject}
Lớp: ${gradeLevel}

Vui lòng trả lời bằng tiếng Việt và tuân thủ chặt chẽ các yêu cầu trên.`;

        setGeneratedPrompt(prompt);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedPrompt);
        alert('Đã sao chép prompt!');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Demo - AI Prompt Generator for Teachers
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Tạo prompt AI cho kế hoạch bài dạy, thuyết trình và đánh giá
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Tạo Prompt Kế Hoạch Bài Dạy</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Môn học
                            </label>
                            <select
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Toán học">Toán học</option>
                                <option value="Ngữ văn">Ngữ văn</option>
                                <option value="Tiếng Anh">Tiếng Anh</option>
                                <option value="Vật lý">Vật lý</option>
                                <option value="Hóa học">Hóa học</option>
                                <option value="Sinh học">Sinh học</option>
                                <option value="Lịch sử">Lịch sử</option>
                                <option value="Địa lý">Địa lý</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Lớp
                            </label>
                            <select
                                value={gradeLevel}
                                onChange={(e) => setGradeLevel(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value={6}>Lớp 6</option>
                                <option value={7}>Lớp 7</option>
                                <option value={8}>Lớp 8</option>
                                <option value={9}>Lớp 9</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên bài học
                        </label>
                        <input
                            type="text"
                            value={lessonName}
                            onChange={(e) => setLessonName(e.target.value)}
                            placeholder="Ví dụ: Phương trình bậc nhất một ẩn"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Công cụ AI đích
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {['ChatGPT', 'Gemini', 'Copilot', 'Canva AI', 'Gamma App'].map((tool) => (
                                <button
                                    key={tool}
                                    onClick={() => setSelectedTool(tool)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium ${selectedTool === tool
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    {tool}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={generatePrompt}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium"
                    >
                        Tạo Prompt
                    </button>
                </div>

                {generatedPrompt && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Prompt được tạo cho {selectedTool}</h3>
                            <button
                                onClick={copyToClipboard}
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                            >
                                Sao chép
                            </button>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-md">
                            <pre className="whitespace-pre-wrap text-sm text-gray-800">
                                {generatedPrompt}
                            </pre>
                        </div>

                        <div className="mt-4 p-4 bg-blue-50 rounded-md">
                            <h4 className="font-medium text-blue-900 mb-2">Hướng dẫn sử dụng:</h4>
                            <ol className="text-sm text-blue-800 space-y-1">
                                <li>1. Sao chép prompt ở trên</li>
                                <li>2. Mở {selectedTool}</li>
                                <li>3. Dán prompt vào và nhấn Enter</li>
                                <li>4. Chờ AI tạo kế hoạch bài dạy hoàn chỉnh</li>
                            </ol>
                        </div>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <Link
                        href="/"
                        className="text-blue-600 hover:text-blue-500 underline"
                    >
                        ← Quay lại trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}