"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { GeneratedPrompt } from '@/types/prompt'
import { VIETNAMESE_SUBJECTS, GRADE_LEVELS } from '@/types/user'
import { PromptDisplay } from '@/components/display'

interface LibraryFilters {
    subject?: string
    gradeLevel?: number
    search?: string
    sortBy?: 'date' | 'subject' | 'grade'
    sortOrder?: 'asc' | 'desc'
}

interface PersonalLibraryDashboardProps {
    onEdit?: (prompt: GeneratedPrompt) => void
    onDelete?: (promptId: string) => Promise<void>
}

// Extended type for personal library items
interface PersonalLibraryItem extends Partial<GeneratedPrompt> {
    // From own prompts
    id: string
    createdAt?: Date
    generatedText?: string
    inputParameters?: any
    targetTool?: string
    isShared?: boolean
    tags?: string[]

    // From saved community content
    title?: string
    description?: string
    subject?: string
    gradeLevel?: number
    rating?: number
    ratingCount?: number
    authorName?: string
    savedAt?: Date
    sortDate?: Date
    type?: 'own' | 'saved'
}

export default function PersonalLibraryDashboard({
    onEdit,
    onDelete
}: PersonalLibraryDashboardProps) {
    const { data: session } = useSession()
    const [prompts, setPrompts] = useState<PersonalLibraryItem[]>([])
    const [filteredPrompts, setFilteredPrompts] = useState<PersonalLibraryItem[]>([])
    const [filters, setFilters] = useState<LibraryFilters>({
        sortBy: 'date',
        sortOrder: 'desc'
    })
    const [isLoading, setIsLoading] = useState(true)
    const [selectedPrompt, setSelectedPrompt] = useState<PersonalLibraryItem | null>(null)

    // Load prompts from API
    useEffect(() => {
        if (session?.user?.email) {
            loadPrompts()
        }
    }, [session])

    // Apply filters when prompts or filters change
    useEffect(() => {
        applyFilters()
    }, [prompts, filters])

    const loadPrompts = async () => {
        try {
            setIsLoading(true)
            console.log('Loading personal library...')
            const response = await fetch('/api/library/personal')
            console.log('Personal library response:', response.status)

            if (response.ok) {
                const data = await response.json()
                console.log('Personal library data:', data)
                setPrompts(data.content || [])
            } else {
                console.error('Failed to load personal library:', response.status, response.statusText)
            }
        } catch (error) {
            console.error('Error loading prompts:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const applyFilters = () => {
        let filtered = [...prompts]

        // Apply subject filter
        if (filters.subject) {
            filtered = filtered.filter(prompt => {
                // For saved content
                if (prompt.subject) {
                    return prompt.subject === filters.subject
                }
                // For own prompts
                const params = prompt.inputParameters as any
                return params?.subject === filters.subject
            })
        }

        // Apply grade level filter
        if (filters.gradeLevel) {
            filtered = filtered.filter(prompt => {
                // For saved content
                if (prompt.gradeLevel) {
                    return prompt.gradeLevel === filters.gradeLevel
                }
                // For own prompts
                const params = prompt.inputParameters as any
                return params?.gradeLevel === filters.gradeLevel
            })
        }

        // Apply search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            filtered = filtered.filter(prompt => {
                // For saved content
                if (prompt.title || prompt.description) {
                    return (
                        prompt.title?.toLowerCase().includes(searchLower) ||
                        prompt.description?.toLowerCase().includes(searchLower) ||
                        prompt.subject?.toLowerCase().includes(searchLower) ||
                        prompt.generatedText?.toLowerCase().includes(searchLower)
                    )
                }
                // For own prompts
                const params = prompt.inputParameters as any
                return (
                    prompt.generatedText?.toLowerCase().includes(searchLower) ||
                    params?.lessonName?.toLowerCase().includes(searchLower) ||
                    params?.topic?.toLowerCase().includes(searchLower) ||
                    params?.subject?.toLowerCase().includes(searchLower)
                )
            })
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue: any, bValue: any

            switch (filters.sortBy) {
                case 'date':
                    aValue = new Date(a.createdAt || a.savedAt || a.sortDate).getTime()
                    bValue = new Date(b.createdAt || b.savedAt || b.sortDate).getTime()
                    break
                case 'subject':
                    aValue = a.subject || (a.inputParameters as any)?.subject || ''
                    bValue = b.subject || (b.inputParameters as any)?.subject || ''
                    break
                case 'grade':
                    aValue = a.gradeLevel || (a.inputParameters as any)?.gradeLevel || 0
                    bValue = b.gradeLevel || (b.inputParameters as any)?.gradeLevel || 0
                    break
                default:
                    aValue = new Date(a.createdAt || a.savedAt || a.sortDate).getTime()
                    bValue = new Date(b.createdAt).getTime()
            }

            if (filters.sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1
            } else {
                return aValue < bValue ? 1 : -1
            }
        })

        setFilteredPrompts(filtered)
    }

    const handleDelete = async (promptId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa prompt này?')) return

        try {
            if (onDelete) {
                await onDelete(promptId)
            } else {
                const response = await fetch(`/api/library/prompts/${promptId}`, {
                    method: 'DELETE'
                })
                if (!response.ok) throw new Error('Failed to delete prompt')
            }

            // Remove from local state
            setPrompts(prompts.filter(p => p.id !== promptId))
            if (selectedPrompt?.id === promptId) {
                setSelectedPrompt(null)
            }
        } catch (error) {
            console.error('Error deleting prompt:', error)
            alert('Có lỗi xảy ra khi xóa prompt')
        }
    }

    const getPromptTitle = (prompt: any) => {
        // If it's saved content from community
        if (prompt.type === 'saved' || prompt.title) {
            return prompt.title || 'Nội dung không có tiêu đề'
        }

        // If it's own prompt
        if (prompt.inputParameters) {
            const params = prompt.inputParameters as any
            return params.lessonName || params.topic || 'Prompt không có tiêu đề'
        }

        return 'Nội dung không có tiêu đề'
    }

    const getPromptSubtitle = (prompt: any) => {
        // If it's saved content from community
        if (prompt.type === 'saved' || prompt.subject) {
            const parts = []
            if (prompt.subject) parts.push(prompt.subject)
            if (prompt.gradeLevel) parts.push(`Lớp ${prompt.gradeLevel}`)
            if (prompt.authorName) parts.push(`Tác giả: ${prompt.authorName}`)
            return parts.join(' • ') || 'Nội dung từ cộng đồng'
        }

        // If it's own prompt
        if (prompt.inputParameters) {
            const params = prompt.inputParameters as any
            const parts = []
            if (params.subject) parts.push(params.subject)
            if (params.gradeLevel) parts.push(`Lớp ${params.gradeLevel}`)
            return parts.join(' • ')
        }

        const getPromptType = (prompt: any) => {
            // Check if it's a saved content from community
            if (prompt.type === 'saved' || prompt.subject) {
                return 'Đã lưu từ cộng đồng'
            }

            // Check if it's own prompt
            if (prompt.inputParameters) {
                const params = prompt.inputParameters as any
                if (params.outputFormat || params.outputType === 'giao-an') return 'Giáo án'
                if (params.slideCount || params.outputType === 'slide') return 'Thuyết trình'
                if (params.questionCount || params.outputType === 'quiz') return 'Đánh giá'
                if (params.outputType === 'rubric') return 'Thang đánh giá'
            }

            return 'Khác'
        }

        if (isLoading) {
            return (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Đang tải thư viện...</p>
                    </div>
                </div>
            )
        }

        return (
            <div className="space-y-6">
                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Tìm kiếm và lọc</h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div>
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                                Tìm kiếm
                            </label>
                            <input
                                type="text"
                                id="search"
                                value={filters.search || ''}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                placeholder="Tìm theo tên bài, chủ đề..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Subject Filter */}
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                Môn học
                            </label>
                            <select
                                id="subject"
                                value={filters.subject || ''}
                                onChange={(e) => setFilters({ ...filters, subject: e.target.value || undefined })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Tất cả môn học</option>
                                {VIETNAMESE_SUBJECTS.map((subject) => (
                                    <option key={subject} value={subject}>{subject}</option>
                                ))}
                            </select>
                        </div>

                        {/* Grade Level Filter */}
                        <div>
                            <label htmlFor="gradeLevel" className="block text-sm font-medium text-gray-700 mb-1">
                                Khối lớp
                            </label>
                            <select
                                id="gradeLevel"
                                value={filters.gradeLevel || ''}
                                onChange={(e) => setFilters({ ...filters, gradeLevel: e.target.value ? Number(e.target.value) : undefined })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Tất cả khối lớp</option>
                                {GRADE_LEVELS.map((grade) => (
                                    <option key={grade} value={grade}>Lớp {grade}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div>
                            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                                Sắp xếp
                            </label>
                            <select
                                id="sort"
                                value={`${filters.sortBy}-${filters.sortOrder}`}
                                onChange={(e) => {
                                    const [sortBy, sortOrder] = e.target.value.split('-')
                                    setFilters({
                                        ...filters,
                                        sortBy: sortBy as 'date' | 'subject' | 'grade',
                                        sortOrder: sortOrder as 'asc' | 'desc'
                                    })
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="date-desc">Mới nhất</option>
                                <option value="date-asc">Cũ nhất</option>
                                <option value="subject-asc">Môn học A-Z</option>
                                <option value="subject-desc">Môn học Z-A</option>
                                <option value="grade-asc">Lớp thấp đến cao</option>
                                <option value="grade-desc">Lớp cao đến thấp</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Summary */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Hiển thị {filteredPrompts.length} trong tổng số {prompts.length} prompt
                    </p>

                    {filteredPrompts.length > 0 && (
                        <button
                            onClick={() => setSelectedPrompt(null)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            {selectedPrompt ? 'Quay lại danh sách' : 'Xem dạng lưới'}
                        </button>
                    )}
                </div>

                {/* Content */}
                {selectedPrompt ? (
                    /* Detailed View */
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setSelectedPrompt(null)}
                                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Quay lại danh sách
                            </button>

                            <div className="flex space-x-2">
                                {onEdit && (
                                    <button
                                        onClick={() => onEdit(selectedPrompt)}
                                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Chỉnh sửa
                                    </button>
                                )}

                                <button
                                    onClick={() => handleDelete(selectedPrompt.id)}
                                    className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Xóa
                                </button>
                            </div>
                        </div>

                        <PromptDisplay
                            prompt={selectedPrompt}
                            showActions={false}
                        />
                    </div>
                ) : filteredPrompts.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có prompt nào</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {prompts.length === 0
                                ? 'Bắt đầu tạo prompt đầu tiên của bạn.'
                                : 'Không tìm thấy prompt nào phù hợp với bộ lọc.'
                            }
                        </p>
                        {prompts.length === 0 && (
                            <div className="mt-6">
                                <a
                                    href="/dashboard"
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Tạo prompt mới
                                </a>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Grid View */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPrompts.map((prompt) => (
                            <div
                                key={prompt.id}
                                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => setSelectedPrompt(prompt)}
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {getPromptType(prompt)}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(prompt.createdAt || prompt.savedAt || prompt.sortDate).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                                        {getPromptTitle(prompt)}
                                    </h3>

                                    <p className="text-sm text-gray-600 mb-3">
                                        {getPromptSubtitle(prompt)}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-wrap gap-1">
                                            {prompt.tags.slice(0, 2).map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                            {prompt.tags.length > 2 && (
                                                <span className="text-xs text-gray-500">
                                                    +{prompt.tags.length - 2}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex space-x-1">
                                            {onEdit && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onEdit(prompt)
                                                    }}
                                                    className="p-1 text-gray-400 hover:text-blue-600"
                                                    title="Chỉnh sửa"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                            )}

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDelete(prompt.id)
                                                }}
                                                className="p-1 text-gray-400 hover:text-red-600"
                                                title="Xóa"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }
}