'use client';

import { useState, useEffect } from 'react';
import { StarRating } from '@/components/ui/StarRating';

interface Content {
    id: string;
    title: string;
    description: string;
    rating: number;
    ratingCount: number;
    author: {
        name: string;
        school: string;
    };
}

export default function TestRatingUIPage() {
    const [contents, setContents] = useState<Content[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const loadContents = async () => {
        try {
            const response = await fetch('/api/community/content');
            const data = await response.json();
            if (data.success) {
                setContents(data.data);
            }
        } catch (error) {
            console.error('Error loading contents:', error);
        }
    };

    const handleRate = async (contentId: string, rating: number) => {
        setLoading(true);
        try {
            const response = await fetch('/api/debug/test-rating-simple', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contentId, rating }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage(`✅ ${data.message} - Rating: ${rating}⭐`);
                // Reload contents to see updated ratings
                await loadContents();
            } else {
                setMessage(`❌ Error: ${data.error}`);
            }
        } catch (error) {
            setMessage(`❌ Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const seedData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/debug/seed-community', {
                method: 'POST',
            });
            const data = await response.json();

            if (data.success) {
                setMessage(`✅ ${data.message}`);
                await loadContents();
            } else {
                setMessage(`❌ Error: ${data.error}`);
            }
        } catch (error) {
            setMessage(`❌ Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadContents();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center">Test Rating System UI</h1>

                <div className="mb-8 text-center">
                    <button
                        onClick={seedData}
                        disabled={loading}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 mr-4"
                    >
                        {loading ? 'Seeding...' : 'Seed Sample Data'}
                    </button>

                    <button
                        onClick={loadContents}
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Reload Contents'}
                    </button>
                </div>

                {message && (
                    <div className="mb-6 p-4 bg-white rounded-lg shadow text-center">
                        <p className="text-lg">{message}</p>
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {contents.map((content) => (
                        <div key={content.id} className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                                {content.title}
                            </h3>

                            <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                                {content.description}
                            </p>

                            <div className="text-xs text-gray-500 mb-4">
                                <p>Tác giả: {content.author.name}</p>
                                {content.author.school && (
                                    <p>Trường: {content.author.school}</p>
                                )}
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-gray-600">
                                        {content.rating.toFixed(1)}⭐ ({content.ratingCount} đánh giá)
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Test Rating:</p>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((rating) => (
                                            <button
                                                key={rating}
                                                onClick={() => handleRate(content.id, rating)}
                                                disabled={loading}
                                                className="px-2 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 rounded disabled:opacity-50"
                                            >
                                                {rating}⭐
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {contents.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">
                            Chưa có nội dung nào. Hãy nhấn "Seed Sample Data" để tạo dữ liệu mẫu.
                        </p>
                    </div>
                )}

                <div className="mt-12 bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Hướng dẫn test:</h2>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        <li>Nhấn "Seed Sample Data" để tạo dữ liệu mẫu</li>
                        <li>Thử đánh giá các nội dung bằng cách nhấn các nút sao</li>
                        <li>Quan sát rating trung bình và số lượng đánh giá thay đổi</li>
                        <li>Đánh giá lại cùng một nội dung để test chức năng cập nhật</li>
                        <li>Kiểm tra console để xem log chi tiết</li>
                    </ol>

                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h3 className="font-semibold text-yellow-800 mb-2">Lưu ý:</h3>
                        <ul className="list-disc list-inside space-y-1 text-yellow-700 text-sm">
                            <li>Đây là test không cần đăng nhập (sử dụng test user)</li>
                            <li>Mỗi lần đánh giá sẽ cập nhật rating trung bình</li>
                            <li>Đánh giá lại sẽ thay thế đánh giá cũ (không tạo mới)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}