'use client';

import React, { useState, useEffect } from 'react';
import { AITool, AIToolCategory, RecommendationCriteria } from '@/services/ai-tool-recommendation';
import AIToolRecommendations from './AIToolRecommendations';
import AIToolDetails from './AIToolDetails';

interface AIToolSelectorProps {
    subject: string;
    gradeLevel: 6 | 7 | 8 | 9;
    outputType: 'lesson-plan' | 'presentation' | 'assessment';
    onToolSelect: (tool: AITool) => void;
    selectedTool?: AITool | null;
}

export default function AIToolSelector({
    subject,
    gradeLevel,
    outputType,
    onToolSelect,
    selectedTool
}: AIToolSelectorProps) {
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [selectedToolForDetails, setSelectedToolForDetails] = useState<string | null>(null);
    const [quickTools, setQuickTools] = useState<AITool[]>([]);

    // Map output type to teaching objective and output format
    const getRecommendationCriteria = (): RecommendationCriteria => {
        const objectiveMapping = {
            'lesson-plan': 'lesson-planning' as const,
            'presentation': 'presentation' as const,
            'assessment': 'assessment' as const,
        };

        const outputMapping = {
            'lesson-plan': 'text' as const,
            'presentation': 'visual' as const,
            'assessment': 'text' as const,
        };

        return {
            subject,
            gradeLevel,
            teachingObjective: objectiveMapping[outputType],
            outputType: outputMapping[outputType],
            difficultyPreference: 'beginner'
        };
    };

    // Fetch quick recommendations for popular tools
    useEffect(() => {
        if (subject && gradeLevel) {
            fetchQuickTools();
        }
    }, [subject, gradeLevel, outputType]);

    const fetchQuickTools = async () => {
        try {
            const criteria = getRecommendationCriteria();
            console.log('Sending criteria:', criteria);

            const response = await fetch('/api/ai-tools/recommendations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(criteria),
            });

            const result = await response.json();
            console.log('API response:', result);

            if (result.success) {
                // Get top 3 tools for quick access
                setQuickTools(result.data.slice(0, 3));
            } else {
                console.error('API error:', result.error);
            }
        } catch (error) {
            console.error('Error fetching quick tools:', error);
        }
    };

    const handleToolClick = (tool: AITool) => {
        onToolSelect(tool);
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

    return (
        <div className="space-y-4">
            {/* Selected Tool Display */}
            {selectedTool && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getCategoryIcon(selectedTool.category)}</span>
                            <div>
                                <h4 className="font-medium text-blue-900">{selectedTool.name}</h4>
                                <p className="text-sm text-blue-700">{selectedTool.description}</p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setSelectedToolForDetails(selectedTool.id)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                                Chi tiết
                            </button>
                            <a
                                href={selectedTool.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                            >
                                Mở công cụ →
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Tool Selection */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">Công cụ AI đề xuất</h3>
                    <button
                        onClick={() => setShowRecommendations(true)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        Xem tất cả →
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {quickTools.map((tool) => (
                        <button
                            key={tool.id}
                            onClick={() => handleToolClick(tool)}
                            className={`p-3 border rounded-lg text-left hover:shadow-md transition-all ${selectedTool?.id === tool.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="text-lg">{getCategoryIcon(tool.category)}</span>
                                <span className="font-medium text-sm text-gray-900">{tool.name}</span>
                                {tool.vietnameseSupport && (
                                    <span className="text-xs bg-green-100 text-green-700 px-1 rounded">VN</span>
                                )}
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2">{tool.useCase}</p>
                        </button>
                    ))}
                </div>

                {quickTools.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                        <span className="text-2xl mb-2 block">🔍</span>
                        <p className="text-sm">Chọn môn học và lớp để xem gợi ý công cụ AI</p>
                    </div>
                )}
            </div>

            {/* Full Recommendations Modal */}
            {showRecommendations && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Chọn công cụ AI phù hợp
                            </h2>
                            <button
                                onClick={() => setShowRecommendations(false)}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            <AIToolRecommendations
                                criteria={getRecommendationCriteria()}
                                onToolSelect={(tool) => {
                                    handleToolClick(tool);
                                    setShowRecommendations(false);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Tool Details Modal */}
            {selectedToolForDetails && (
                <AIToolDetails
                    toolId={selectedToolForDetails}
                    onClose={() => setSelectedToolForDetails(null)}
                />
            )}
        </div>
    );
}