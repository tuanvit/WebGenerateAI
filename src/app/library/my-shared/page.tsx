'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface SharedContent {
    id: string;
    title: string;
    description: string;
    content: string;
    subject: string;
    gradeLevel: number;
    tags: string[];
    rating: number;
    ratingCount: number;
    author: {
        id: string;
        name: string;
        school?: string;
    };
    createdAt: string;
    updatedAt: string;
    ratings: Array<{
        id: string;
        rating: number;
        comment?: string;
        createdAt: string;
        user: {
            name: string;
            email: string;
        };
    }>;
}

export default function MySharedContentPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [contents, setContents] = useState<SharedContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedContent, setSelectedContent] = useState<SharedContent | null>(null);
    const [editingContent, setEditingContent] = useState<SharedContent | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalCount: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
    });

    const loadMyContent = async (page = 1) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/library/my-shared?page=${page}&limit=10`);
            const data = await response.json();

            if (data.success) {
                setContents(data.data);
                setPagination(data.pagination);
            } else {
                console.error('Error loading content:', data.error);
            }
        } catch (error) {
            console.error('Error loading my content:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (contentId: string) => {
        const contentToDelete = contents.find(item => item.id === contentId);
        if (!contentToDelete) return;

        const confirmDelete = window.confirm(
            `Bạn có chắc chắn muốn xóa "${contentToDelete.title}"?\n\nHành động này không thể hoàn tác.`
        );

        if (!confirmDelete) return;

        try {
            const response = await fetch(`/api/community/content/${contentId}/delete`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                alert('Nội dung đã được xóa thành công!');
                loadMyContent(pagination.page);
            } else {
                alert(data.error || 'Có lỗi xảy ra khi xóa nội dung');
            }
        } catch (error) {
            console.error('Error deleting content:', error);
            alert('Có lỗi xảy ra khi xóa nội dung');
        }
    };

    const handleUpdate = async (contentId: string, updatedData: any) => {
        try {
            const response = await fetch(`/api/community/content/${contentId}/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            const data = await response.json();

            if (data.success) {
                alert('Nội dung đã được cập nhật thành công!');
                setEditingContent(null);
                loadMyContent(pagination.page);
            } else {
                alert(data.error || 'Có lỗi xảy ra khi cập nhật nội dung');
            }
        } catch (error) {
            console.error('Error updating content:', error);
            alert('Có lỗi xảy ra khi cập nhật nội dung');
        }
    };

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        } else if (session) {
            loadMyContent(1);
        }
    }, [session, status, router]);

    if (status === 'loading') {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="text-lg">Đang tải...</div>
        </div>;
    }

    if (!session) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Prompt đã chia sẻ của tôi</h1>
                    <p className="text-gray-600">Quản lý các prompt bạn đã chia sẻ lên cộng đồng</p>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="text-lg">Đang tải nội dung...</div>
                    </div>
                ) : contents.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-500 mb-4">Bạn chưa chia sẻ prompt nào</div>
                        <button
                            onClick={() => router.push('/generate')}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Tạo prompt mới
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Content List */}
                        <div className="space-y-6">
                            {contents.map((content) => (
                                <div key={content.id} className="bg-white rounded-lg shadow-md p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{content.title}</h3>
                                            <p className="text-gray-600 mb-3">{content.description}</p>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                                <span>📚 {content.subject}</span>
                                                <span>🎓 Lớp {content.gradeLevel}</span>
                                                <span>⭐ {content.rating.toFixed(1)} ({content.ratingCount} đánh giá)</span>
                                                <span>📅 {new Date(content.createdAt).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                            {content.tags && content.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {content.tags.map((tag, index) => (
                                                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => setSelectedContent(content)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                            >
                                                Xem chi tiết
                                            </button>
                                            <button
                                                onClick={() => setEditingContent(content)}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDelete(content.id)}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </div>

                                    {/* Ratings/Comments */}
                                    {content.ratings && content.ratings.length > 0 && (
                                        <div className="border-t pt-4">
                                            <h4 className="font-semibold text-gray-900 mb-3">
                                                Đánh giá & Nhận xét từ cộng đồng ({content.ratings.length}):
                                            </h4>
                                            <div className="space-y-4 max-h-60 overflow-y-auto">
                                                {content.ratings.map((rating) => (
                                                    <div key={rating.id} className="bg-gray-50 rounded-lg p-3">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-medium text-gray-900">{rating.user.name}</span>
                                                                <div className="flex">
                                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                                        <span key={star} className={star <= rating.rating ? 'text-yellow-400' : 'text-gray-300'}>
                                                                            ⭐
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <span className="text-xs text-gray-500">
                                                                {new Date(rating.createdAt).toLocaleDateString('vi-VN')}
                                                            </span>
                                                        </div>
                                                        {rating.comment && (
                                                            <p className="text-sm text-gray-700 bg-white p-2 rounded border-l-4 border-blue-200">
                                                                "{rating.comment}"
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center space-x-2 mt-8">
                                <button
                                    onClick={() => loadMyContent(pagination.page - 1)}
                                    disabled={!pagination.hasPrev}
                                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Trước
                                </button>

                                <span className="px-4 py-2 text-sm text-gray-700">
                                    Trang {pagination.page} / {pagination.totalPages}
                                </span>

                                <button
                                    onClick={() => loadMyContent(pagination.page + 1)}
                                    disabled={!pagination.hasNext}
                                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Detail Modal */}
                {selectedContent && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-2xl font-bold text-gray-900">{selectedContent.title}</h2>
                                    <button
                                        onClick={() => setSelectedContent(null)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="prose max-w-none">
                                    <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                                        {selectedContent.content}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {editingContent && (
                    <EditContentModal
                        content={editingContent}
                        onSave={(updatedData) => handleUpdate(editingContent.id, updatedData)}
                        onCancel={() => setEditingContent(null)}
                    />
                )}
            </div>
        </div>
    );
}

// Edit Modal Component
function EditContentModal({ content, onSave, onCancel }: {
    content: SharedContent;
    onSave: (data: any) => void;
    onCancel: () => void;
}) {
    const [formData, setFormData] = useState({
        title: content.title,
        description: content.description,
        content: content.content,
        subject: content.subject,
        gradeLevel: content.gradeLevel,
        tags: content.tags
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa prompt</h2>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung</label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                rows={10}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Môn học</label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Khối lớp</label>
                                <select
                                    value={formData.gradeLevel}
                                    onChange={(e) => setFormData({ ...formData, gradeLevel: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value={6}>Lớp 6</option>
                                    <option value={7}>Lớp 7</option>
                                    <option value={8}>Lớp 8</option>
                                    <option value={9}>Lớp 9</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}