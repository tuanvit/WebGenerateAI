'use client';

import React, { useState, useEffect } from 'react';
import { AIToolDetails as AIToolDetailsType } from '@/services/ai-tool-recommendation';

interface AIToolDetailsProps {
    toolId: string;
    onClose: () => void;
}

export default function AIToolDetails({ toolId, onClose }: AIToolDetailsProps) {
    const [tool, setTool] = useState<AIToolDetailsType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchToolDetails();
    }, [toolId]);

    const fetchToolDetails = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/ai-tools/${toolId}`);
            const result = await response.json();

            if (result.success) {
                setTool(result.data);
            } else {
                setError(result.error || 'Không thể tải thông tin công cụ AI');
            }
        } catch (err) {
            setError('Lỗi kết nối. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const getPricingBadge = (pricingModel: string) => {
        const badges = {
            free: 'bg-green-100 text-green-800',
            freemium: 'bg-blue-100 text-blue-800',
            paid: 'bg-orange-100 text-orange-800',
        };
        const texts = {
            free: 'Miễn phí',
            freemium: 'Freemium',
            paid: 'Trả phí',
        };
        return {
            className: badges[pricingModel as keyof typeof badges] || 'bg-gray-100 text-gray-800',
            text: texts[pricingModel as keyof typeof texts] || pricingModel,
        };
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
                    <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !tool) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <span className="text-4xl mb-4 block">⚠️</span>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Có lỗi xảy ra</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <div className="flex space-x-3 justify-center">
                            <button
                                onClick={fetchToolDetails}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Thử lại
                            </button>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const pricingBadge = getPricingBadge(tool.pricingModel);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-xl font-semibold text-gray-900">{tool.name}</h2>
                        <span className={`px-2 py-1 rounded text-xs ${pricingBadge.className}`}>
                            {pricingBadge.text}
                        </span>
                        {tool.vietnameseSupport && (
                            <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                                Hỗ trợ tiếng Việt
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Description */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Mô tả</h3>
                        <p className="text-gray-600">{tool.description}</p>
                    </div>

                    {/* Use Case */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Ứng dụng</h3>
                        <p className="text-gray-600">{tool.useCase}</p>
                    </div>

                    {/* Features */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Tính năng chính</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                            {tool.features.map((feature, index) => (
                                <li key={index}>{feature}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Integration Instructions */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Hướng dẫn sử dụng</h3>
                        <p className="text-gray-600 bg-gray-50 p-3 rounded">{tool.integrationInstructions}</p>
                    </div>

                    {/* Sample Prompts */}
                    {tool.samplePrompts.length > 0 && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Prompt mẫu</h3>
                            <div className="space-y-2">
                                {tool.samplePrompts.map((prompt, index) => (
                                    <div key={index} className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                                        <p className="text-sm text-gray-700">{prompt}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Subjects and Grade Levels */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Môn học phù hợp</h3>
                            <div className="flex flex-wrap gap-2">
                                {tool.subjects.map((subject, index) => (
                                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                        {subject}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Lớp học</h3>
                            <div className="flex flex-wrap gap-2">
                                {tool.gradeLevel.map((grade, index) => (
                                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                                        Lớp {grade}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Related Tools */}
                    {tool.relatedTools.length > 0 && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Công cụ liên quan</h3>
                            <div className="flex flex-wrap gap-2">
                                {tool.relatedTools.map((relatedToolId, index) => (
                                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                                        {relatedToolId}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                        Độ khó: <span className="font-medium">{tool.difficulty}</span>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                            Đóng
                        </button>
                        <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Mở công cụ →
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}