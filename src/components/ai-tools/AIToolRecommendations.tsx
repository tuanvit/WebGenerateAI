'use client';

import React, { useState, useEffect } from 'react';
import { AITool, AIToolCategory, RecommendationCriteria } from '@/services/ai-tool-recommendation';

interface AIToolRecommendationsProps {
    criteria: RecommendationCriteria;
    onToolSelect?: (tool: AITool) => void;
}

export default function AIToolRecommendations({ criteria, onToolSelect }: AIToolRecommendationsProps) {
    const [recommendations, setRecommendations] = useState<AITool[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchRecommendations();
    }, [criteria]);

    const fetchRecommendations = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/ai-tools/recommendations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(criteria),
            });

            const result = await response.json();

            if (result.success) {
                setRecommendations(result.data);
            } else {
                setError(result.error || 'Có lỗi xảy ra khi lấy gợi ý công cụ AI');
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

    const getDifficultyColor = (difficulty: string) => {
        const colors = {
            beginner: 'bg-green-100 text-green-800',
            intermediate: 'bg-yellow-100 text-yellow-800',
            advanced: 'bg-red-100 text-red-800',
        };
        return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getDifficultyText = (difficulty: string) => {
        const texts = {
            beginner: 'Dễ sử dụng',
            intermediate: 'Trung bình',
            advanced: 'Nâng cao',
        };
        return texts[difficulty as keyof typeof texts] || difficulty;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Đang tìm công cụ AI phù hợp...</span>
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
                            onClick={fetchRecommendations}
                            className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (recommendations.length === 0) {
        return (
            <div className="text-center p-8 text-gray-500">
                <span className="text-4xl mb-4 block">🔍</span>
                <p>Không tìm thấy công cụ AI phù hợp với yêu cầu của bạn.</p>
                <p className="text-sm mt-2">Hãy thử thay đổi tiêu chí tìm kiếm.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                    Công cụ AI được đề xuất
                </h3>
                <span className="text-sm text-gray-500">
                    {recommendations.length} công cụ phù hợp
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.map((tool) => (
                    <div
                        key={tool.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => onToolSelect?.(tool)}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl">{getCategoryIcon(tool.category)}</span>
                                <div>
                                    <h4 className="font-medium text-gray-900">{tool.name}</h4>
                                    <span className="text-xs text-gray-500">
                                        {getCategoryName(tool.category)}
                                    </span>
                                </div>
                            </div>
                            {tool.vietnameseSupport && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    Tiếng Việt
                                </span>
                            )}
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {tool.description}
                        </p>

                        <div className="flex items-center justify-between mb-3">
                            <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(tool.difficulty)}`}>
                                {getDifficultyText(tool.difficulty)}
                            </span>
                            <span className="text-xs text-gray-500">
                                Lớp {tool.gradeLevel.join(', ')}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{tool.useCase}</span>
                            <a
                                href={tool.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Mở công cụ →
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center pt-4">
                <button
                    onClick={fetchRecommendations}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                    Làm mới gợi ý
                </button>
            </div>
        </div>
    );
}