'use client';

import React, { useState, useEffect } from 'react';
import { AITool, AIToolCategory } from '@/services/ai-tool-recommendation';
import Link from 'next/link';

interface TrendingAIToolsProps {
    limit?: number;
    showHeader?: boolean;
}

export default function TrendingAITools({ limit = 6, showHeader = true }: TrendingAIToolsProps) {
    const [trendingTools, setTrendingTools] = useState<AITool[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTrendingTools();
    }, [limit]);

    const fetchTrendingTools = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/ai-tools/trending?limit=${limit}`);
            const result = await response.json();

            if (result.success) {
                setTrendingTools(result.data);
            } else {
                setError(result.error || 'Không thể tải danh sách công cụ AI thịnh hành');
            }
        } catch (err) {
            setError('Lỗi kết nối. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const getCategoryIcon = (category: AIToolCategory) => {
        const icons = {
            [AIToolCategory.TEXT_GENERATION]: '📝',
            [AIToolCategory.PRESENTATION]: '📊',
            [AIToolCategory.VIDEO]: '🎥',
            [AIToolCategory.SIMULATION]: '🔬',
            [AIToolCategory.IMAGE]: '🎨',
            [AIToolCategory.DATA_ANALYSIS]: '📈',
            [AIToolCategory.ASSESSMENT]: '📋',
            [AIToolCategory.SUBJECT_SPECIFIC]: '🎯',
        };
        return icons[category] || '🔧';
    };

    const getCategoryName = (category: AIToolCategory) => {
        const names = {
            [AIToolCategory.TEXT_GENERATION]: 'Tạo văn bản',
            [AIToolCategory.PRESENTATION]: 'Thuyết trình',
            [AIToolCategory.VIDEO]: 'Video',
            [AIToolCategory.SIMULATION]: 'Mô phỏng',
            [AIToolCategory.IMAGE]: 'Hình ảnh',
            [AIToolCategory.DATA_ANALYSIS]: 'Phân tích dữ liệu',
            [AIToolCategory.ASSESSMENT]: 'Đánh giá',
            [AIToolCategory.SUBJECT_SPECIFIC]: 'Chuyên môn',
        };
        return names[category] || 'Khác';
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {showHeader && (
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">🔥 Công cụ AI thịnh hành</h3>
                        <div className="animate-pulse h-4 w-20 bg-gray-200 rounded"></div>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(limit)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 rounded-lg h-32"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <span className="text-red-400">⚠️</span>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Có lỗi xảy ra</h3>
                        <p className="mt-1 text-sm text-red-700">{error}</p>
                        <button
                            onClick={fetchTrendingTools}
                            className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (trendingTools.length === 0) {
        return (
            <div className="text-center p-8 text-gray-500">
                <span className="text-4xl mb-4 block">🔍</span>
                <p>Không có công cụ AI nào để hiển thị.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {showHeader && (
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                        🔥 Công cụ AI thịnh hành
                    </h3>
                    <Link
                        href="/ai-tools"
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Xem tất cả →
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingTools.map((tool) => (
                    <div
                        key={tool.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl">{getCategoryIcon(tool.category)}</span>
                                <div>
                                    <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                                        {tool.name}
                                    </h4>
                                    <span className="text-xs text-gray-500">
                                        {getCategoryName(tool.category)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                                {tool.vietnameseSupport && (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                        VN
                                    </span>
                                )}
                                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                    Thịnh hành
                                </span>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {tool.description}
                        </p>

                        <div className="space-y-2">
                            <div className="flex flex-wrap gap-1">
                                {tool.subjects.slice(0, 2).map((subject, index) => (
                                    <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                        {subject}
                                    </span>
                                ))}
                                {tool.subjects.length > 2 && (
                                    <span className="text-xs text-gray-500">
                                        +{tool.subjects.length - 2}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                    Lớp {tool.gradeLevel.join(', ')}
                                </span>
                                <a
                                    href={tool.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    Dùng ngay →
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {trendingTools.length >= limit && (
                <div className="text-center pt-4">
                    <Link
                        href="/ai-tools"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Khám phá thêm công cụ AI
                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            )}
        </div>
    );
}