import { NextRequest, NextResponse } from "next/server"
import mammoth from "mammoth"

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json(
                { error: "Không tìm thấy file" },
                { status: 400 }
            )
        }

        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: "File quá lớn. Vui lòng chọn file nhỏ hơn 10MB" },
                { status: 400 }
            )
        }

        // Check file type
        const isDocx = file.name.match(/\.docx$/i)
        const isDoc = file.name.match(/\.doc$/i)

        if (!isDocx && !isDoc) {
            return NextResponse.json(
                { error: "Chỉ hỗ trợ file Word (.doc, .docx)" },
                { status: 400 }
            )
        }

        let extractedContent = ""
        let extractionMethod = ""

        try {
            // Convert file to buffer
            const arrayBuffer = await file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            if (isDocx) {
                // Use mammoth for .docx files
                const result = await mammoth.extractRawText({ buffer })
                extractedContent = result.value
                extractionMethod = "mammoth (.docx)"

                // Check for any warnings
                if (result.messages && result.messages.length > 0) {
                    console.log("Mammoth warnings:", result.messages)
                }
            } else if (isDoc) {
                // For .doc files, we'll provide a fallback message
                // Note: mammoth doesn't support .doc files well
                extractedContent = `Lưu ý: File .doc (${file.name}) có thể không được trích xuất hoàn toàn chính xác.

Để có kết quả tốt nhất, vui lòng:
1. Mở file trong Microsoft Word
2. Lưu lại dưới định dạng .docx (Word 2007 trở lên)
3. Tải lên file .docx mới

Hoặc bạn có thể sao chép nội dung từ file Word và dán trực tiếp vào ô văn bản.`
                extractionMethod = "fallback (.doc)"
            }

            // Clean up the extracted text
            extractedContent = cleanExtractedText(extractedContent)

            // Validate extracted content
            if (!extractedContent || extractedContent.trim().length < 10) {
                return NextResponse.json({
                    success: false,
                    error: "Không thể trích xuất nội dung từ file này. Vui lòng kiểm tra lại file hoặc thử định dạng khác.",
                    content: "",
                    filename: file.name,
                    size: file.size,
                    extractionMethod
                })
            }

            return NextResponse.json({
                success: true,
                content: extractedContent,
                filename: file.name,
                size: file.size,
                extractionMethod,
                wordCount: countWords(extractedContent),
                characterCount: extractedContent.length
            })

        } catch (extractionError) {
            console.error("Extraction error:", extractionError)

            // Provide helpful error message based on error type
            let errorMessage = "Không thể trích xuất nội dung từ file này."

            if (extractionError instanceof Error) {
                if (extractionError.message.includes('ZIP')) {
                    errorMessage = "File có vẻ bị hỏng hoặc không phải là file Word hợp lệ."
                } else if (extractionError.message.includes('password')) {
                    errorMessage = "File được bảo vệ bằng mật khẩu. Vui lòng bỏ mật khẩu và thử lại."
                }
            }

            return NextResponse.json({
                success: false,
                error: errorMessage,
                content: "",
                filename: file.name,
                size: file.size,
                extractionMethod: "failed"
            })
        }

    } catch (error) {
        console.error("Server error:", error)
        return NextResponse.json(
            { error: "Lỗi server khi xử lý file" },
            { status: 500 }
        )
    }
}

/**
 * Clean up extracted text by removing excessive whitespace and formatting
 */
function cleanExtractedText(text: string): string {
    if (!text) return ""

    return text
        // Remove excessive line breaks (more than 2 consecutive)
        .replace(/\n{3,}/g, '\n\n')
        // Remove excessive spaces
        .replace(/ {2,}/g, ' ')
        // Remove tabs
        .replace(/\t/g, ' ')
        // Remove carriage returns
        .replace(/\r/g, '')
        // Trim whitespace from each line
        .split('\n')
        .map(line => line.trim())
        .join('\n')
        // Remove leading/trailing whitespace
        .trim()
}

/**
 * Count words in Vietnamese text
 */
function countWords(text: string): number {
    if (!text) return 0

    // Remove extra whitespace and split by spaces
    const words = text.trim().replace(/\s+/g, ' ').split(' ')
    return words.filter(word => word.length > 0).length
}