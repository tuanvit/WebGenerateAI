"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { GeneratedPrompt } from '@/types/prompt'
import { VIETNAMESE_SUBJECTS, GRADE_LEVELS } from '@/types/user'
import { COMMON_TAGS } from '@/types/prompt'
import { CommunityContentCard } from '../community/CommunityContentCard'
import { StarRating } from '../ui/StarRating'
import { RatingWithComment } from '../community/RatingWithComment'

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null
    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

interface SharedContent {
    id: string
    title: string
    description: string
    content: string
    subject: string
    gradeLevel: 6 | 7 | 8 | 9
    tags: string[]
    rating: number
    ratingCount: number
    author: {
        name: string
        school?: string
    }
    createdAt: string
    updatedAt: string
}

interface CommunityFilters {
    subject?: string
    gradeLevel?: number
    tags?: string[]
    search?: string
    sortBy?: 'rating' | 'date' | 'popular'
    sortOrder?: 'asc' | 'desc'
}

interface CommunityLibraryBrowserProps {
    onSaveToPersonal?: (content: SharedContent) => Promise<void>
}

export default function CommunityLibraryBrowser({
    onSaveToPersonal
}: CommunityLibraryBrowserProps) {
    const { data: session } = useSession()
    const [content, setContent] = useState<SharedContent[]>([])
    const [filters, setFilters] = useState<CommunityFilters>({
        sortBy: 'rating',
        sortOrder: 'desc'
    })
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalCount: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
    })
    const [isLoading, setIsLoading] = useState(true)
    const [isContentLoading, setIsContentLoading] = useState(false)
    const [selectedContent, setSelectedContent] = useState<SharedContent | null>(null)
    const [userRatings, setUserRatings] = useState<Record<string, number>>({})
    const [savedContent, setSavedContent] = useState<Set<string>>(new Set())
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [showRatingModal, setShowRatingModal] = useState<string | null>(null)
    const [searchInput, setSearchInput] = useState('')
    const [isSearching, setIsSearching] = useState(false)

    // Load community content from API
    useEffect(() => {
        loadCommunityContent(1, true) // Initial load
        loadUserData()
    }, [session])

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce((searchTerm: string) => {
            setFilters(prev => ({ ...prev, search: searchTerm }))
            setIsSearching(false)
        }, 500),
        []
    )

    // Handle search input change
    const handleSearchChange = (value: string) => {
        setSearchInput(value)
        setIsSearching(true)
        debouncedSearch(value)
    }

    // Reload when non-search filters change
    useEffect(() => {
        loadCommunityContent(1, false) // Content refresh
    }, [filters.subject, filters.gradeLevel])

    // Reload when search filter changes (after debounce)
    useEffect(() => {
        if (filters.search !== undefined) {
            loadCommunityContent(1, false) // Content refresh
        }
    }, [filters.search])

    const loadCommunityContent = async (page = 1, isInitialLoad = false) => {
        try {
            // Use different loading states for initial load vs content refresh
            if (isInitialLoad) {
                setIsLoading(true)
            } else {
                setIsContentLoading(true)
            }

            // Build query parameters
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pagination.limit.toString()
            })

            // Add filters to params
            if (filters.subject) params.append('subject', filters.subject)
            if (filters.gradeLevel) params.append('gradeLevel', filters.gradeLevel.toString())
            if (filters.search) params.append('topic', filters.search)

            const response = await fetch(`/api/community/content?${params}`, {
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            })

            if (response.ok) {
                const data = await response.json()
                let contentData = data.data || []

                console.log('API Response:', data)
                console.log('Content data:', contentData)

                // Ensure tags is always an array and process data format
                const processedContent = contentData.map((item: any) => ({
                    ...item,
                    tags: Array.isArray(item.tags) ? item.tags : (item.tags ? JSON.parse(item.tags) : []),
                    author: item.author || { name: item.authorName || 'Ẩn danh', school: '' }
                }))

                console.log('Processed content:', processedContent)
                setContent(processedContent)

                // Update pagination info
                if (data.pagination) {
                    console.log('Pagination info:', data.pagination)
                    setPagination(data.pagination)
                } else {
                    // Fallback pagination if API doesn't return pagination info
                    setPagination({
                        page: 1,
                        limit: 10,
                        totalCount: processedContent.length,
                        totalPages: 1,
                        hasNext: false,
                        hasPrev: false
                    })
                }
            }
        } catch (error) {
            console.error('Error loading community content:', error)
        } finally {
            if (isInitialLoad) {
                setIsLoading(false)
            } else {
                setIsContentLoading(false)
            }
        }
    }

    const loadUserData = async () => {
        if (!session) return

        try {
            // Load user ratings and saved content
            try {
                const ratingsResponse = await fetch('/api/community/user/ratings')
                if (ratingsResponse.ok) {
                    const ratingsData = await ratingsResponse.json()
                    setUserRatings(ratingsData.data || {})
                } else {
                    setUserRatings({})
                }
            } catch {
                setUserRatings({})
            }

            try {
                const savedResponse = await fetch('/api/community/saved')
                if (savedResponse.ok) {
                    const savedData = await savedResponse.json()
                    const savedIds = new Set<string>(savedData.data?.map((item: any) => item.id) || [])
                    setSavedContent(savedIds)
                } else {
                    setSavedContent(new Set())
                }
            } catch {
                setSavedContent(new Set())
            }
        } catch (error) {
            console.error('Error loading user data:', error)
            // Initialize with empty data on error
            setUserRatings({})
            setSavedContent(new Set())
        }
    }

    const applyFilters = () => {
        let filtered = [...content]

        // Apply subject filter
        if (filters.subject) {
            filtered = filtered.filter(item => item.subject === filters.subject)
        }

        // Apply grade level filter
        if (filters.gradeLevel) {
            filtered = filtered.filter(item => item.gradeLevel === filters.gradeLevel)
        }

        // Apply tags filter
        if (filters.tags && filters.tags.length > 0) {
            filtered = filtered.filter(item =>
                filters.tags!.some(tag => item.tags.includes(tag))
            )
        }

        // Apply search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(searchLower) ||
                item.description.toLowerCase().includes(searchLower) ||
                item.content.toLowerCase().includes(searchLower) ||
                item.subject.toLowerCase().includes(searchLower) ||
                item.author.name.toLowerCase().includes(searchLower)
            )
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue: any, bValue: any

            switch (filters.sortBy) {
                case 'rating':
                    aValue = a.rating
                    bValue = b.rating
                    break
                case 'date':
                    aValue = new Date(a.updatedAt).getTime()
                    bValue = new Date(b.updatedAt).getTime()
                    break
                case 'popular':
                    aValue = a.ratingCount
                    bValue = b.ratingCount
                    break
                default:
                    aValue = a.rating
                    bValue = b.rating
            }

            if (filters.sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1
            } else {
                return aValue < bValue ? 1 : -1
            }
        })

        // No longer needed - using API pagination
    }

    const handleRating = async (contentId: string, rating: number) => {
        if (!session) return
        setShowRatingModal(contentId)
    }

    const handleRatingSubmit = async (contentId: string, rating: number, comment?: string) => {
        try {
            const response = await fetch(`/api/community/content/${contentId}/rating`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rating, comment }),
            })

            if (response.ok) {
                const previousRating = userRatings[contentId] || 0

                // Update local state immediately for better UX
                setUserRatings({ ...userRatings, [contentId]: rating })

                // Update content rating in local state
                setContent(prevContent =>
                    prevContent.map(item => {
                        if (item.id === contentId) {
                            let newRating: number
                            let newRatingCount: number

                            if (previousRating === 0) {
                                // First time rating - add new rating
                                newRating = ((item.rating * item.ratingCount) + rating) / (item.ratingCount + 1)
                                newRatingCount = item.ratingCount + 1
                            } else {
                                // Update existing rating - replace old rating with new one
                                const totalWithoutOld = (item.rating * item.ratingCount) - previousRating
                                newRating = (totalWithoutOld + rating) / item.ratingCount
                                newRatingCount = item.ratingCount // Keep same count
                            }

                            return {
                                ...item,
                                rating: newRating,
                                ratingCount: newRatingCount
                            }
                        }
                        return item
                    })
                )

                // Get message from API response
                const responseData = await response.json()
                const message = responseData.message || (previousRating === 0 ? 'Đánh giá đã được ghi nhận!' : 'Đánh giá đã được cập nhật!')
                alert(message)
                setShowRatingModal(null)
            } else {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Lỗi không xác định')
            }
        } catch (error) {
            console.error('Error rating content:', error)
            const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi đánh giá. Vui lòng thử lại.'
            alert(errorMessage)
        }
    }

    const handleSaveToPersonal = async (contentId: string) => {
        if (!session) {
            alert('Vui lòng đăng nhập để lưu nội dung')
            return
        }

        try {
            const response = await fetch(`/api/community/content/${contentId}/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save to personal library')
            }

            setSavedContent(prev => new Set([...prev, contentId]))
            alert(data.message || 'Đã lưu vào thư viện cá nhân!')
        } catch (error) {
            console.error('Error saving to personal library:', error)
            const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi lưu vào thư viện cá nhân'
            alert(errorMessage)
        }
    }

    const handleDeleteContent = async (contentId: string) => {
        if (!session) {
            alert('Vui lòng đăng nhập để xóa nội dung')
            return
        }

        const contentToDelete = content.find(item => item.id === contentId)
        if (!contentToDelete) return

        // Confirm deletion
        const confirmDelete = window.confirm(
            `Bạn có chắc chắn muốn xóa "${contentToDelete.title}"?\n\nHành động này không thể hoàn tác.`
        )

        if (!confirmDelete) return

        try {
            const response = await fetch(`/api/community/content/${contentId}/delete`, {
                method: 'DELETE',
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete content')
            }

            // Remove from local state
            setContent(prev => prev.filter(item => item.id !== contentId))
            alert(data.message || 'Nội dung đã được xóa thành công!')

            // Reload current page to refresh data
            loadCommunityContent(pagination.page, false)
        } catch (error) {
            console.error('Error deleting content:', error)
            const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xóa nội dung'
            alert(errorMessage)
        }
    }

    const handleUnsaveFromPersonal = async (contentId: string) => {
        if (!session) return

        try {
            const response = await fetch(`/api/community/content/${contentId}/save`, {
                method: 'DELETE',
            })

            if (response.ok) {
                setSavedContent(prev => {
                    const newSet = new Set(prev)
                    newSet.delete(contentId)
                    return newSet
                })
                alert('Đã xóa khỏi thư viện cá nhân!')
            }
        } catch (error) {
            console.error('Error unsaving content:', error)
            alert('Có lỗi xảy ra khi xóa khỏi thư viện.')
        }
    }

    const handleShare = (contentId: string) => {
        // Copy link to clipboard
        const url = `${window.location.origin}/community/content/${contentId}`
        navigator.clipboard.writeText(url).then(() => {
            alert('Đã sao chép liên kết!')
        }).catch(() => {
            alert('Không thể sao chép liên kết')
        })
    }

    const handleReport = (contentId: string) => {
        // This would open a report modal
        alert('Tính năng báo cáo sẽ được triển khai sớm')
    }

    const handleAdapt = async (contentId: string) => {
        try {
            const response = await fetch(`/api/community/content/${contentId}/adapt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customizations: 'Đã tùy chỉnh từ thư viện cộng đồng'
                }),
            })

            if (response.ok) {
                const data = await response.json()
                alert('Đã tạo bản tùy chỉnh trong thư viện cá nhân!')
            }
        } catch (error) {
            console.error('Error adapting content:', error)
            alert('Có lỗi xảy ra khi tùy chỉnh nội dung.')
        }
    }

    const handleTagFilter = (tag: string) => {
        const currentTags = filters.tags || []
        if (currentTags.includes(tag)) {
            setFilters({
                ...filters,
                tags: currentTags.filter(t => t !== tag)
            })
        } else {
            setFilters({
                ...filters,
                tags: [...currentTags, tag]
            })
        }
    }



    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải thư viện cộng đồng...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tìm kiếm và lọc</h3>

                <div className="space-y-4">
                    {/* Search */}
                    <div>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Tìm kiếm theo tiêu đề, mô tả, tác giả..."
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {isSearching && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                                </div>
                            )}
                            {searchInput && !isSearching && (
                                <button
                                    onClick={() => {
                                        setSearchInput('')
                                        setFilters(prev => ({ ...prev, search: '' }))
                                    }}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                        sortBy: sortBy as 'rating' | 'date' | 'popular',
                                        sortOrder: sortOrder as 'asc' | 'desc'
                                    })
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="rating-desc">Đánh giá cao nhất</option>
                                <option value="rating-asc">Đánh giá thấp nhất</option>
                                <option value="date-desc">Mới nhất</option>
                                <option value="date-asc">Cũ nhất</option>
                                <option value="popular-desc">Phổ biến nhất</option>
                            </select>
                        </div>
                    </div>

                    {/* Tag Filters */}
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Tags:</p>
                        <div className="flex flex-wrap gap-2">
                            {COMMON_TAGS.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => handleTagFilter(tag)}
                                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${filters.tags?.includes(tag)
                                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Summary & Pagination Info */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-600">
                        Hiển thị {content.length} nội dung (Trang {pagination.page}/{pagination.totalPages} - Tổng: {pagination.totalCount})
                    </p>
                    {session && (
                        <a
                            href="/library/my-shared"
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            📝 Quản lý prompt của tôi
                        </a>
                    )}
                </div>

                {content.length > 0 && !selectedContent && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            {selectedContent ? (
                /* Detailed View */
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSelectedContent(null)}
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Quay lại danh sách
                        </button>

                        <button
                            onClick={() => handleSaveToPersonal(selectedContent.id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Lưu vào thư viện cá nhân
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* Header */}
                        <div className="bg-green-50 px-6 py-4 border-b border-green-100">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-green-900">
                                        {selectedContent.title}
                                    </h3>
                                    <p className="text-sm text-green-600 mt-1">
                                        {selectedContent.subject} • Lớp {selectedContent.gradeLevel}
                                    </p>
                                    <p className="text-sm text-green-600 mt-1">
                                        Tác giả: {selectedContent.author.name}
                                        {selectedContent.author.school && ` • ${selectedContent.author.school}`}
                                    </p>
                                </div>
                                <div className="ml-4">
                                    <StarRating
                                        rating={selectedContent.rating}
                                        totalRatings={selectedContent.ratingCount}
                                        size="md"
                                        interactive={session ? true : false}
                                        onRatingChange={session ? (rating) => handleRating(selectedContent.id, rating) : undefined}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {selectedContent.description && (
                            <div className="px-6 py-4 bg-gray-50 border-b">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Mô tả:</h4>
                                <p className="text-sm text-gray-600">{selectedContent.description}</p>
                            </div>
                        )}

                        {/* Content */}
                        <div className="px-6 py-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-4">Nội dung:</h4>
                            <div className="bg-gray-50 rounded-lg p-4 border">
                                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                                    {selectedContent.content}
                                </pre>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="px-6 py-4 bg-gray-50 border-t">
                            <div className="flex flex-wrap gap-2">
                                {selectedContent.tags.map((tag, index) => (
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
                </div>
            ) : content.length === 0 ? (
                /* Empty State */
                <div className="text-center py-12">
                    {(isLoading || isContentLoading) ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mr-3"></div>
                            <span className="text-gray-600">Đang tải nội dung...</span>
                        </div>
                    ) : (
                        <>
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                {filters.search ? `Không tìm thấy kết quả cho "${filters.search}"` : 'Không tìm thấy nội dung'}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {filters.search
                                    ? 'Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc'
                                    : 'Chưa có nội dung nào được chia sẻ trong cộng đồng.'
                                }
                            </p>
                            {filters.search && (
                                <button
                                    onClick={() => {
                                        setSearchInput('')
                                        setFilters(prev => ({ ...prev, search: '' }))
                                    }}
                                    className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Xóa tìm kiếm
                                </button>
                            )}
                        </>
                    )}
                </div>
            ) : (
                <div className="relative">
                    {/* Content Loading Overlay */}
                    {isContentLoading && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                            <div className="flex items-center gap-3 text-gray-600">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                                <span>Đang tải nội dung...</span>
                            </div>
                        </div>
                    )}

                    {/* Grid/List View */}
                    <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-6'} ${isContentLoading ? 'opacity-50 pointer-events-none' : ''} transition-opacity duration-200`}>
                        {content.map((item) => (
                            <div key={item.id} className="border rounded-lg p-6 bg-white shadow hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-semibold text-lg text-gray-900 flex-1 pr-4">{item.title}</h3>
                                    {session?.user?.id === item.author?.id && (
                                        <button
                                            onClick={() => handleDeleteContent(item.id)}
                                            className="p-2 text-red-400 hover:text-red-600 rounded-full hover:bg-red-50"
                                            title="Xóa nội dung"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                <p className="text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                                <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                                    <span>📚 {item.subject}</span>
                                    <span>🎓 Lớp {item.gradeLevel}</span>
                                    <span>👤 {item.author?.name}</span>
                                </div>

                                {/* Tags */}
                                {item.tags && item.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {item.tags.slice(0, 3).map((tag, index) => (
                                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                {tag}
                                            </span>
                                        ))}
                                        {item.tags.length > 3 && (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                +{item.tags.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Rating and Actions */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => handleRating(item.id, star)}
                                                    className={`text-lg ${star <= (userRatings[item.id] || 0)
                                                        ? 'text-yellow-400'
                                                        : star <= item.rating
                                                            ? 'text-yellow-300'
                                                            : 'text-gray-300'
                                                        } hover:text-yellow-400 transition-colors`}
                                                    disabled={!session}
                                                    title={session ? `Đánh giá ${star} sao` : 'Đăng nhập để đánh giá'}
                                                >
                                                    ⭐
                                                </button>
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            {item.rating.toFixed(1)} ({item.ratingCount} đánh giá)
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => setSelectedContent(item)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                    >
                                        Xem chi tiết
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center space-x-2 mt-8">
                            <button
                                onClick={() => loadCommunityContent(pagination.page - 1, false)}
                                disabled={!pagination.hasPrev || isContentLoading}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trước
                            </button>

                            <div className="flex space-x-1">
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (pagination.totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (pagination.page <= 3) {
                                        pageNum = i + 1;
                                    } else if (pagination.page >= pagination.totalPages - 2) {
                                        pageNum = pagination.totalPages - 4 + i;
                                    } else {
                                        pageNum = pagination.page - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => loadCommunityContent(pageNum, false)}
                                            disabled={isContentLoading}
                                            className={`px-3 py-2 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${pageNum === pagination.page
                                                ? 'text-white bg-blue-600 border border-blue-600'
                                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => loadCommunityContent(pagination.page + 1, false)}
                                disabled={!pagination.hasNext || isContentLoading}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Rating Modal */}
            {showRatingModal && (
                <RatingWithComment
                    contentId={showRatingModal}
                    currentRating={userRatings[showRatingModal] || 0}
                    onSubmit={(rating, comment) => handleRatingSubmit(showRatingModal, rating, comment)}
                    onCancel={() => setShowRatingModal(null)}
                />
            )}
        </div>
    )
}