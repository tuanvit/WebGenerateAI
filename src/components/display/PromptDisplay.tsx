"use client"

import { AIToolButtons, CopyPromptButton } from '@/components/integration'
import { GeneratedPrompt } from '@/types/prompt'
import { useState } from 'react'

interface PromptDisplayProps {
    prompt: GeneratedPrompt
    onSave?: (prompt: GeneratedPrompt) => Promise<void>
    onShare?: (prompt: GeneratedPrompt) => Promise<void>
    showActions?: boolean
}

export default function PromptDisplay({
    prompt,
    onSave,
    onShare,
    showActions = true
}: PromptDisplayProps) {
    const [isSaving, setIsSaving] = useState(false)
    const [isSharing, setIsSharing] = useState(false)

    const handleSave = async () => {
        if (!onSave) return

        setIsSaving(true)
        try {
            await onSave(prompt)
        } catch (error) {
            console.error('Error saving prompt:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleShare = async () => {
        if (!onShare) return

        setIsSharing(true)
        try {
            await onShare(prompt)
        } catch (error) {
            console.error('Error sharing prompt:', error)
        } finally {
            setIsSharing(false)
        }
    }

    const formatInputParameters = () => {
        const params = prompt.inputParameters as any
        const formatted: string[] = []

        if (params.subject) formatted.push(`Môn học: ${params.subject}`)
        if (params.gradeLevel) formatted.push(`Lớp: ${params.gradeLevel}`)
        if (params.lessonName) formatted.push(`Bài học: ${params.lessonName}`)
        if (params.topic) formatted.push(`Chủ đề: ${params.topic}`)
        if (params.pedagogicalStandard) formatted.push(`Chuẩn: ${params.pedagogicalStandard}`)
        if (params.outputFormat) {
            const formatLabel = params.outputFormat === 'four-column' ? '4 cột' : '5 cột'
            formatted.push(`Định dạng: ${formatLabel}`)
        }
        if (params.slideCount) formatted.push(`Số slide: ${params.slideCount}`)
        if (params.questionCount) formatted.push(`Số câu hỏi: ${params.questionCount}`)
        if (params.questionType) {
            const typeLabels = {
                'multiple-choice': 'Trắc nghiệm',
                'short-answer': 'Tự luận ngắn',
                'essay': 'Tự luận dài'
            }
            formatted.push(`Loại câu hỏi: ${typeLabels[params.questionType as keyof typeof typeLabels]}`)
        }
        if (params.bloomLevels && params.bloomLevels.length > 0) {
            const levelLabels = {
                'recognition': 'Nhận biết',
                'comprehension': 'Thông hiểu',
                'application': 'Vận dụng',
                'analysis': 'Phân tích',
                'synthesis': 'Tổng hợp',
                'evaluation': 'Đánh giá'
            }
            const levels = params.bloomLevels.map((level: string) =>
                levelLabels[level as keyof typeof levelLabels]
            ).join(', ')
            formatted.push(`Mức độ tư duy: ${levels}`)
        }

        return formatted
    }

    const getToolLabel = (tool: string) => {
        const labels = {
            'chatgpt': 'ChatGPT',
            'gemini': 'Gemini',
            'copilot': 'Microsoft Copilot',
            'canva-ai': 'Canva AI',
            'gamma-app': 'Gamma App'
        }
        return labels[tool as keyof typeof labels] || tool
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-blue-900">
                            Prompt đã tạo
                        </h3>
                        <p className="text-sm text-blue-600 mt-1">
                            Tối ưu cho {getToolLabel(prompt.targetTool)}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        {prompt.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Input Parameters */}
            <div className="px-6 py-4 bg-gray-50 border-b">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin đầu vào:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {formatInputParameters().map((param, index) => (
                        <span key={index} className="text-sm text-gray-600">
                            {param}
                        </span>
                    ))}
                </div>
            </div>

            {/* Generated Prompt Content */}
            <div className="px-6 py-6">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-700">Nội dung prompt:</h4>
                    <CopyPromptButton
                        prompt={prompt.generatedText}
                        className="text-sm"
                    />
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                        {prompt.generatedText}
                    </pre>
                </div>
            </div>

            {/* AI Tool Integration */}
            <div className="px-6 py-4 bg-gray-50 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Sử dụng với công cụ AI:
                </h4>
                <AIToolButtons
                    prompt={prompt.generatedText}
                    selectedTool={prompt.targetTool as any}
                />
            </div>

            {/* Action Buttons */}
            {showActions && (
                <div className="px-6 py-4 bg-white border-t flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                        Tạo lúc: {new Date(prompt.createdAt).toLocaleString('vi-VN')}
                    </div>

                    <div className="flex space-x-3">
                        {onSave && (
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        Lưu vào thư viện
                                    </>
                                )}
                            </button>
                        )}

                        {onShare && (
                            <button
                                onClick={handleShare}
                                disabled={isSharing}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSharing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang chia sẻ...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                        </svg>
                                        Chia sẻ cộng đồng
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}