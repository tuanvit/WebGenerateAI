"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Header from "@/components/layout/Header"
import PromptEditor from "@/components/prompt/PromptEditor"

export default function TestPromptEditorPage() {
    const { data: session } = useSession()
    const [samplePrompt] = useState(`Bạn là một giáo viên Lịch sử chuyên nghiệp. Hãy tạo một kế hoạch bài dạy chi tiết cho bài học "Chiến tranh thế giới thứ nhất" dành cho học sinh lớp 8.

**Thông tin bài học:**
- Môn học: Lịch sử
- Lớp: 8
- Tên bài: Chiến tranh thế giới thứ nhất
- Mục tiêu: Học sinh hiểu được nguyên nhân, diễn biến và hậu quả của chiến tranh thế giới thứ nhất

**Yêu cầu:**
- Tuân thủ chặt chẽ chuẩn GDPT 2018 và Công văn 5512
- Áp dụng phương pháp dạy học tích cực
- Bao gồm hoạt động cá nhân và nhóm
- Có đánh giá năng lực học sinh

**Định dạng kế hoạch bài dạy 5 cột:**
1. Hoạt động của giáo viên
2. Hoạt động của học sinh  
3. Nội dung kiến thức
4. Phương tiện dạy học
5. Ghi chú

Thời gian: 45 phút
Vui lòng trả lời bằng tiếng Việt và tuân thủ chặt chẽ các yêu cầu trên.`)

    const [sampleFormData] = useState({
        subject: 'Lịch sử',
        grade: 8,
        lessonName: 'Chiến tranh thế giới thứ nhất',
        objectives: 'Học sinh hiểu được nguyên nhân, diễn biến và hậu quả của chiến tranh thế giới thứ nhất',
        outputType: 'giao-an',
        style: 'chi-tiet'
    })

    if (!session) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <main className="py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-2xl mx-auto text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Vui lòng đăng nhập
                        </h1>
                        <p className="text-gray-600">
                            Bạn cần đăng nhập để sử dụng tính năng chỉnh sửa và lưu prompt.
                        </p>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Test Prompt Editor
                        </h1>
                        <p className="text-gray-600">
                            Trang test tính năng chỉnh sửa, lưu và chia sẻ prompt
                        </p>
                    </div>

                    <PromptEditor
                        initialPrompt={samplePrompt}
                        formData={sampleFormData}
                        onSave={(prompt) => {
                            console.log('Prompt saved:', prompt)
                            alert('Prompt đã được lưu thành công!')
                        }}
                        onShare={(prompt) => {
                            console.log('Prompt shared:', prompt)
                            alert('Prompt đã được chia sẻ lên cộng đồng!')
                        }}
                    />
                </div>
            </main>
        </div>
    )
}