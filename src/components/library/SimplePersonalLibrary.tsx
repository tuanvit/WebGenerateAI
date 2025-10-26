"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface EditModalProps {
    item: PersonalLibraryItem
    onSave: (content: string, title?: string) => Promise<void>
    onCancel: () => void
}

function EditModal({ item, onSave, onCancel }: EditModalProps) {
    const [content, setContent] = useState('')
    const [title, setTitle] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        setContent(item.generatedText || '')
        setTitle(item.title || item.inputParameters?.lessonName || item.inputParameters?.topic || '')
    }, [item])

    const handleSave = async () => {
        if (!content.trim()) {
            alert('Nội dung không được để trống')
            return
        }

        setIsSaving(true)
        try {
            await onSave(content, title)
        } catch (error) {
            console.error('Error saving:', error)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                            {item.type === 'saved' ? 'Xem nội dung' : 'Chỉnh sửa prompt'}
                        </h3>
                        <button
                            onClick={onCancel}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {item.type !== 'saved' && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tiêu đề
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập tiêu đề..."
                            />
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nội dung
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            readOnly={item.type === 'saved'}
                            className={`w-full h-96 p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${item.type === 'saved' ? 'bg-gray-50' : ''
                                }`}
                            placeholder="Nội dung prompt..."
                        />
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            {item.type === 'saved' ? 'Đóng' : 'Hủy'}
                        </button>
                        {item.type !== 'saved' && (
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

interface PersonalLibraryItem {
    id: string
    title?: string
    description?: string
    generatedText?: string
    subject?: string
    gradeLevel?: number
    createdAt?: string
    savedAt?: string
    sortDate?: string
    type?: 'own' | 'saved'
    inputParameters?: any
    authorName?: string
    tags?: string[]
}

export default function SimplePersonalLibrary() {
    const { data: session } = useSession()
    const [items, setItems] = useState<PersonalLibraryItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [editingItem, setEditingItem] = useState<PersonalLibraryItem | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    useEffect(() => {
        if (session?.user?.email) {
            loadItems()
        }
    }, [session])

    const loadItems = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/library/personal')

            if (response.ok) {
                const data = await response.json()
                console.log('Personal library data:', data)
                setItems(data.content || [])
            } else {
                console.error('Failed to load personal library:', response.status)
            }
        } catch (error) {
            console.error('Error loading personal library:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const getItemTitle = (item: PersonalLibraryItem) => {
        if (item.title) return item.title
        if (item.inputParameters?.lessonName) return item.inputParameters.lessonName
        if (item.inputParameters?.topic) return item.inputParameters.topic
        return 'Nội dung không có tiêu đề'
    }

    const getItemType = (item: PersonalLibraryItem) => {
        if (item.type === 'saved' || item.subject) return 'Đã lưu từ cộng đồng'
        if (item.inputParameters?.outputType === 'giao-an') return 'Kế hoạch bài dạy'
        if (item.inputParameters?.outputType === 'slide') return 'Slide'
        if (item.inputParameters?.outputType === 'quiz') return 'Câu hỏi'
        if (item.inputParameters?.outputType === 'rubric') return 'Thang đánh giá'
        return 'Prompt'
    }

    const getItemDate = (item: PersonalLibraryItem) => {
        const date = item.createdAt || item.savedAt || item.sortDate
        return date ? new Date(date).toLocaleDateString('vi-VN') : 'Không rõ'
    }

    const getItemSubtitle = (item: PersonalLibraryItem) => {
        const parts = []

        if (item.subject) parts.push(item.subject)
        if (item.gradeLevel) parts.push(`Lớp ${item.gradeLevel}`)
        if (item.authorName) parts.push(`Tác giả: ${item.authorName}`)

        if (parts.length === 0 && item.inputParameters) {
            const params = item.inputParameters
            if (params.subject) parts.push(params.subject)
            if (params.grade) parts.push(`Lớp ${params.grade}`)
        }

        return parts.join(' • ') || 'Không có thông tin'
    }

    const handleEdit = (item: PersonalLibraryItem) => {
        setEditingItem(item)
    }

    const handleSaveEdit = async (updatedContent: string, title?: string) => {
        if (!editingItem) return

        try {
            let response

            if (editingItem.type === 'saved') {
                // For saved content, we can't edit the original, but we could create a copy
                alert('Nội dung từ cộng đồng không thể chỉnh sửa. Bạn có thể tạo bản sao.')
                return
            } else {
                // For own prompts
                response = await fetch(`/api/prompts/${editingItem.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: updatedContent,
                        title: title
                    }),
                })
            }

            if (response && response.ok) {
                // Refresh the list
                await loadItems()
                setEditingItem(null)
                alert('Đã cập nhật thành công!')
            } else {
                throw new Error('Failed to update')
            }
        } catch (error) {
            console.error('Error updating item:', error)
            alert('Có lỗi xảy ra khi cập nhật')
        }
    }

    const handleDelete = async (item: PersonalLibraryItem) => {
        if (!confirm('Bạn có chắc chắn muốn xóa mục này?')) {
            return
        }

        setDeletingId(item.id)

        try {
            let response

            if (item.type === 'saved') {
                // For saved content, we need to find the original content ID
                // The item.id might be the userLibrary ID, we need the content ID
                const contentId = item.id // This should be the content ID from the API response
                response = await fetch(`/api/library/personal/saved/${contentId}`, {
                    method: 'DELETE'
                })
            } else {
                // Delete own prompt
                response = await fetch(`/api/prompts/${item.id}`, {
                    method: 'DELETE'
                })
            }

            if (response.ok) {
                // Remove from local state
                setItems(items.filter(i => i.id !== item.id))
                alert('Đã xóa thành công!')
            } else {
                throw new Error('Failed to delete')
            }
        } catch (error) {
            console.error('Error deleting item:', error)
            alert('Có lỗi xảy ra khi xóa')
        } finally {
            setDeletingId(null)
        }
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

    if (items.length === 0) {
        return (
            <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có nội dung</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Bạn chưa tạo prompt nào hoặc lưu nội dung từ cộng đồng.
                </p>
                <div className="mt-6">
                    <a
                        href="/generate"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Tạo prompt mới
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Edit Modal */}
            {editingItem && (
                <EditModal
                    item={editingItem}
                    onSave={handleSaveEdit}
                    onCancel={() => setEditingItem(null)}
                />
            )}

            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Thư viện cá nhân ({items.length} mục)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {getItemType(item)}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {getItemDate(item)}
                                </span>
                            </div>

                            <h4 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                                {getItemTitle(item)}
                            </h4>

                            <p className="text-sm text-gray-600 mb-3">
                                {getItemSubtitle(item)}
                            </p>

                            {item.description && (
                                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                                    {item.description}
                                </p>
                            )}

                            {item.tags && item.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {item.tags.slice(0, 3).map((tag, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                    {item.tags.length > 3 && (
                                        <span className="text-xs text-gray-500">
                                            +{item.tags.length - 3}
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEdit(item)}
                                    className="flex-1 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-md"
                                >
                                    {item.type === 'saved' ? 'Xem chi tiết' : 'Chỉnh sửa'}
                                </button>
                                <button
                                    onClick={() => handleDelete(item)}
                                    disabled={deletingId === item.id}
                                    className="flex-1 text-sm bg-red-50 text-red-700 hover:bg-red-100 px-3 py-2 rounded-md disabled:opacity-50"
                                >
                                    {deletingId === item.id ? 'Đang xóa...' : 'Xóa'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}