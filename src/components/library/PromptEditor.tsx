"use client"

import { useState, useEffect } from 'react'
import { GeneratedPrompt, COMMON_TAGS } from '@/types/prompt'

interface PromptEditorProps {
    prompt: GeneratedPrompt
    onSave: (updatedPrompt: Partial<GeneratedPrompt>) => Promise<void>
    onCancel: () => void
    isLoading?: boolean
}

export default function PromptEditor({
    prompt,
    onSave,
    onCancel,
    isLoading = false
}: PromptEditorProps) {
    const [editedContent, setEditedContent] = useState(prompt.generatedText)
    const [selectedTags, setSelectedTags] = useState<string[]>(prompt.tags)
    const [customTag, setCustomTag] = useState('')
    const [isShared, setIsShared] = useState(prompt.isShared)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!editedContent.trim()) {
            newErrors.content = 'Nội dung prompt không được để trống'
        }

        if (editedContent.length > 10000) {
            newErrors.content = 'Nội dung prompt quá dài (tối đa 10,000 ký tự)'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSave = async () => {
        if (!validateForm()) return

        try {
            await onSave({
                generatedText: editedContent,
                tags: selectedTags,
                isShared: isShared
            })
        } catch (error) {
            console.error('Error saving prompt:', error)
            setErrors({ submit: 'Có lỗi xảy ra khi lưu prompt. Vui lòng thử lại.' })
        }
    }

    const handleTagToggle = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag))
        } else {
            setSelectedTags([...selectedTags, tag])
        }
    }

    const handleAddCustomTag = () => {
        const tag = customTag.trim()
        if (tag && !selectedTags.includes(tag)) {
            const formattedTag = tag.startsWith('#') ? tag : `#${tag}`
            setSelectedTags([...selectedTags, formattedTag])
            setCustomTag('')
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove))
    }

    const getPromptTitle = () => {
        const params = prompt.inputParameters as any
        return params.lessonName || params.topic || 'Prompt không có tiêu đề'
    }

    const getPromptInfo = () => {
        const params = prompt.inputParameters as any
        const info = []
        if (params.subject) info.push(params.subject)
        if (params.gradeLevel) info.push(`Lớp ${params.gradeLevel}`)
        return info.join(' • ')
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-blue-900">
                            Chỉnh sửa prompt
                        </h3>
                        <p className="text-sm text-blue-600 mt-1">
                            {getPromptTitle()}
                        </p>
                        <p className="text-xs text-blue-500 mt-1">
                            {getPromptInfo()}
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={onCancel}
                            disabled={isLoading}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Content Editor */}
                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                        Nội dung prompt *
                    </label>
                    <textarea
                        id="content"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        rows={12}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm ${errors.content ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="Nhập nội dung prompt..."
                    />
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-gray-500">
                            {editedContent.length}/10,000 ký tự
                        </p>
                        {errors.content && <p className="text-sm text-red-600">{errors.content}</p>}
                    </div>
                </div>

                {/* Tags Management */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags
                    </label>

                    {/* Selected Tags */}
                    {selectedTags.length > 0 && (
                        <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-2">Tags đã chọn:</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedTags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                        {tag}
                                        <button
                                            onClick={() => handleRemoveTag(tag)}
                                            className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Common Tags */}
                    <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-2">Tags phổ biến:</p>
                        <div className="flex flex-wrap gap-2">
                            {COMMON_TAGS.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => handleTagToggle(tag)}
                                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${selectedTags.includes(tag)
                                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Tag Input */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={customTag}
                            onChange={(e) => setCustomTag(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTag()}
                            placeholder="Thêm tag tùy chỉnh..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                        <button
                            onClick={handleAddCustomTag}
                            disabled={!customTag.trim()}
                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            Thêm
                        </button>
                    </div>
                </div>

                {/* Sharing Settings */}
                <div>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={isShared}
                            onChange={(e) => setIsShared(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                            Chia sẻ với cộng đồng
                        </span>
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                        Khi được chia sẻ, prompt này sẽ xuất hiện trong thư viện cộng đồng để các giáo viên khác có thể tham khảo.
                    </p>
                </div>

                {/* Error Message */}
                {errors.submit && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{errors.submit}</p>
                    </div>
                )}
            </div>
        </div>
    )
}