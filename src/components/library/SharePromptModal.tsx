"use client"

import { COMMON_TAGS, GeneratedPrompt } from '@/types/prompt'
import { useState } from 'react'

interface SharePromptModalProps {
    prompt: GeneratedPrompt
    isOpen: boolean
    onClose: () => void
    onShare: (shareData: ShareData) => Promise<void>
    isLoading?: boolean
}

interface ShareData {
    promptId: string
    title: string
    description: string
    subject: string
    gradeLevel: number
    tags: string[]
}

export default function SharePromptModal({
    prompt,
    isOpen,
    onClose,
    onShare,
    isLoading = false
}: SharePromptModalProps) {
    const params = prompt.inputParameters as any

    const [title, setTitle] = useState(() => {
        return params.lessonName || params.topic || 'Prompt không có tiêu đề'
    })
    const [description, setDescription] = useState('')
    const [selectedTags, setSelectedTags] = useState<string[]>(prompt.tags || [])
    const [customTag, setCustomTag] = useState('')
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Extract subject and gradeLevel from inputParameters
    const subject = params.subject || ''
    const gradeLevel = params.gradeLevel || params.grade || 6

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!title.trim()) {
            newErrors.title = 'Tiêu đề không được để trống'
        }

        if (title.length > 200) {
            newErrors.title = 'Tiêu đề quá dài (tối đa 200 ký tự)'
        }

        if (description.length > 1000) {
            newErrors.description = 'Mô tả quá dài (tối đa 1000 ký tự)'
        }

        if (!subject) {
            newErrors.subject = 'Không tìm thấy môn học trong prompt'
        }

        if (!gradeLevel || gradeLevel < 6 || gradeLevel > 9) {
            newErrors.gradeLevel = 'Khối lớp phải từ 6-9'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        try {
            const shareData: ShareData = {
                promptId: prompt.id,
                title: title.trim(),
                description: description.trim(),
                subject: subject,
                gradeLevel: gradeLevel,
                tags: selectedTags
            }

            // Call API directly instead of using callback
            const response = await fetch('/api/community/share', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(shareData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Không thể chia sẻ prompt')
            }

            const result = await response.json()
            console.log('Shared successfully:', result)

            // Call the callback if provided (for parent component to refresh)
            if (onShare) {
                await onShare(shareData)
            }

            alert('Đã chia sẻ prompt thành công!')
            onClose()
        } catch (error) {
            console.error('Error sharing prompt:', error)
            setErrors({
                submit: error instanceof Error ? error.message : 'Có lỗi xảy ra khi chia sẻ prompt. Vui lòng thử lại.'
            })
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

    const getPromptInfo = () => {
        const params = prompt.inputParameters as any
        const info = []
        if (params.subject) info.push(params.subject)
        if (params.gradeLevel) info.push(`Lớp ${params.gradeLevel}`)
        return info.join(' • ')
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">
                                Chia sẻ prompt với cộng đồng
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                {getPromptInfo()}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                Tiêu đề *
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Nhập tiêu đề cho prompt..."
                            />
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-sm text-gray-500">
                                    {title.length}/200 ký tự
                                </p>
                                {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Mô tả (tùy chọn)
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Mô tả ngắn gọn về prompt này, cách sử dụng, hoặc lưu ý đặc biệt..."
                            />
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-sm text-gray-500">
                                    {description.length}/1000 ký tự
                                </p>
                                {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
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
                                                    type="button"
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
                                            type="button"
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
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
                                    placeholder="Thêm tag tùy chỉnh..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCustomTag}
                                    disabled={!customTag.trim()}
                                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    Thêm
                                </button>
                            </div>
                        </div>

                        {/* Subject and Grade Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                            <div className="flex items-start">
                                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-blue-900 mb-1">Thông tin prompt</p>
                                    <p className="text-sm text-blue-700">
                                        Môn học: <span className="font-semibold">{subject || 'Không xác định'}</span>
                                        {' • '}
                                        Lớp: <span className="font-semibold">{gradeLevel}</span>
                                    </p>
                                    {(!subject || gradeLevel < 6 || gradeLevel > 9) && (
                                        <p className="text-sm text-red-600 mt-2">
                                            ⚠️ Prompt này thiếu thông tin môn học hoặc khối lớp không hợp lệ (6-9)
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {errors.submit && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-600">{errors.submit}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang chia sẻ...
                                    </>
                                ) : (
                                    'Chia sẻ với cộng đồng'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}