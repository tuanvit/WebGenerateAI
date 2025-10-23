'use client';

import React, { useState, useEffect } from 'react';
import { AITool, AIToolDetails, AIToolCategory, RecommendationCriteria } from '@/services/ai-tool-recommendation';
import AIToolRecommendations from './AIToolRecommendations';
import AIToolDetailsModal from './AIToolDetails';

interface AIToolSelectorProps {
    subject: string;
    gradeLevel: 6 | 7 | 8 | 9;
    outputType: string;
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
    const [quickTools, setQuickTools] = useState<AIToolDetails[]>([]);

    // Map output type to teaching objective and output format
    const getRecommendationCriteria = (): RecommendationCriteria => {
        const objectiveMapping: Record<string, 'lesson-planning' | 'presentation' | 'assessment'> = {
            'text-generation': 'lesson-planning',
            'presentation': 'presentation',
            'video': 'presentation',
            'image': 'presentation',
            'simulation': 'lesson-planning',
            'assessment': 'assessment',
            'data-analysis': 'lesson-planning',
            'coding': 'lesson-planning',
            'curriculum-creation': 'lesson-planning', // Curriculum creation is a form of lesson planning
            // Legacy support
            'lesson-plan': 'lesson-planning',
        };

        const outputMapping: Record<string, 'text' | 'visual'> = {
            'text-generation': 'text',
            'presentation': 'visual',
            'video': 'visual',
            'image': 'visual',
            'simulation': 'visual',
            'assessment': 'text',
            'data-analysis': 'visual',
            'coding': 'text',
            'curriculum-creation': 'text', // Curriculum creation primarily produces text content
            // Legacy support
            'lesson-plan': 'text',
        };

        return {
            subject,
            gradeLevel,
            teachingObjective: objectiveMapping[outputType] || 'lesson-planning',
            outputType: outputMapping[outputType] || 'text',
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
            // Special handling for curriculum creation
            if (outputType === 'curriculum-creation') {
                const response = await fetch(`/api/ai-tools/curriculum?subject=${encodeURIComponent(subject)}&gradeLevel=${gradeLevel}&limit=6`);
                const result = await response.json();

                if (result.success && result.data.length > 0) {
                    setQuickTools(result.data.slice(0, 3));
                    return;
                }
            }

            // First try to get tools from our comprehensive database based on output type
            const response = await fetch(`/api/ai-tools?category=${getCategoryFromOutputType(outputType)}&subject=${encodeURIComponent(subject)}&gradeLevel=${gradeLevel}&limit=6`);
            const result = await response.json();

            if (result.success && result.data.length > 0) {
                // Prioritize Vietnamese-supported tools
                const sortedTools = result.data.sort((a: AIToolDetails, b: AIToolDetails) => {
                    if (a.vietnameseSupport && !b.vietnameseSupport) return -1;
                    if (!a.vietnameseSupport && b.vietnameseSupport) return 1;
                    return 0;
                });
                setQuickTools(sortedTools.slice(0, 3));
            } else {
                // Fallback to recommendation API
                const criteria = getRecommendationCriteria();
                const recResponse = await fetch('/api/ai-tools/recommendations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(criteria),
                });

                const recResult = await recResponse.json();
                if (recResult.success) {
                    setQuickTools(recResult.data.slice(0, 3));
                }
            }
        } catch (error) {
            console.error('Error fetching quick tools:', error);
        }
    };

    const getCategoryFromOutputType = (outputType: string): string => {
        const categoryMapping: Record<string, string> = {
            'text-generation': 'text-generation',
            'presentation': 'presentation',
            'video': 'video',
            'image': 'image',
            'simulation': 'simulation',
            'assessment': 'assessment',
            'data-analysis': 'data-analysis',
            'coding': 'simulation', // MakeCode, Scratch are in simulation category
            'curriculum-creation': 'text-generation', // Focus on text-based curriculum tools
            // Legacy support
            'lesson-plan': 'text-generation',
        };
        return categoryMapping[outputType] || 'text-generation';
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
                    <h3 className="text-sm font-medium text-gray-700">
                        {outputType === 'curriculum-creation' ? 'Công cụ AI đề xuất cho tạo giáo trình' : 'Công cụ AI đề xuất cho giáo án'}
                    </h3>
                    <button
                        onClick={() => setShowRecommendations(true)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        Xem tất cả →
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {quickTools.map((tool) => (
                        <button
                            key={tool.id}
                            onClick={() => handleToolClick(tool)}
                            className={`p-4 border rounded-lg text-left hover:shadow-md transition-all ${selectedTool?.id === tool.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-start space-x-3">
                                <span className="text-2xl mt-1">{getCategoryIcon(tool.category)}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="font-semibold text-gray-900">{tool.name}</span>
                                        {tool.vietnameseSupport && (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">VN</span>
                                        )}
                                        <span className={`text-xs px-2 py-1 rounded ${tool.pricingModel === 'free' ? 'bg-green-100 text-green-700' :
                                            tool.pricingModel === 'freemium' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {tool.pricingModel === 'free' ? 'Miễn phí' :
                                                tool.pricingModel === 'freemium' ? 'Freemium' : 'Trả phí'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{tool.description}</p>
                                    <p className="text-xs text-gray-500">{tool.useCase}</p>
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <a
                                        href={tool.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-center"
                                    >
                                        Mở →
                                    </a>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {quickTools.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                        <span className="text-3xl mb-2 block">🔍</span>
                        <p className="text-sm">Đang tải gợi ý công cụ AI phù hợp...</p>
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
                <AIToolDetailsModal
                    toolId={selectedToolForDetails}
                    onClose={() => setSelectedToolForDetails(null)}
                />
            )}
        </div>
    );
}