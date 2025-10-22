'use client';

import React, { useState, useEffect } from 'react';
import { PromptTemplate } from '@/services/templates/SubjectTemplateService';
import TemplateRecommendations from './TemplateRecommendations';
import { TemplateSelectionCriteria } from '@/services/templates/TemplateSelectionEngine';

interface TemplateSelectorProps {
    subject: string;
    gradeLevel: 6 | 7 | 8 | 9;
    outputType: 'lesson-plan' | 'presentation' | 'assessment';
    onTemplateSelect: (template: PromptTemplate) => void;
    selectedTemplate?: PromptTemplate | null;
    userPreferences?: any;
    enableIntelligentRecommendations?: boolean;
}

export default function TemplateSelector({
    subject,
    gradeLevel,
    outputType,
    onTemplateSelect,
    selectedTemplate,
    userPreferences,
    enableIntelligentRecommendations = true
}: TemplateSelectorProps) {
    const [templates, setTemplates] = useState<PromptTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAllTemplates, setShowAllTemplates] = useState(false);
    const [viewMode, setViewMode] = useState<'smart' | 'basic'>('smart');

    useEffect(() => {
        if (subject && gradeLevel && outputType) {
            fetchRecommendedTemplates();
        }
    }, [subject, gradeLevel, outputType]);

    const fetchRecommendedTemplates = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/templates?subject=${encodeURIComponent(subject)}&gradeLevel=${gradeLevel}&outputType=${outputType}`
            );
            const result = await response.json();

            if (result.success) {
                setTemplates(result.data);
            } else {
                setError(result.error || 'Không thể tải danh sách template');
            }
        } catch (err) {
            setError('Lỗi kết nối. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllTemplates = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/templates?subject=${encodeURIComponent(subject)}`);
            const result = await response.json();

            if (result.success) {
                setTemplates(result.data);
                setShowAllTemplates(true);
            } else {
                setError(result.error || 'Không thể tải danh sách template');
            }
        } catch (err) {
            setError('Lỗi kết nối. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
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
            beginner: 'Cơ bản',
            intermediate: 'Trung bình',
            advanced: 'Nâng cao',
        };
        return texts[difficulty as keyof typeof texts] || difficulty;
    };

    const getOutputTypeText = (outputType: string) => {
        const texts = {
            'lesson-plan': 'Giáo án',
            'presentation': 'Thuyết trình',
            'assessment': 'Đánh giá',
            'interactive': 'Tương tác',
            'research': 'Nghiên cứu'
        };
        return texts[outputType as keyof typeof texts] || outputType;
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700">📋 Template chuyên môn</h3>
                    <div className="animate-pulse h-4 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 rounded-lg h-24"></div>
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
                            onClick={fetchRecommendedTemplates}
                            className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (templates.length === 0) {
        return (
            <div className="text-center p-6 text-gray-500">
                <span className="text-3xl mb-3 block">📋</span>
                <p className="text-sm">Chưa có template cho môn học này.</p>
                <button
                    onClick={fetchAllTemplates}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                    Xem tất cả template
                </button>
            </div>
        );
    }

    // Prepare criteria for intelligent recommendations
    const criteria: TemplateSelectionCriteria = {
        subject,
        gradeLevel,
        outputType,
        difficulty: 'intermediate', // Default
        userExperience: 'intermediate' // Default
    };

    return (
        <div className="space-y-4">
            {/* Mode Toggle */}
            {enableIntelligentRecommendations && (
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700">
                        📋 Template chuyên môn
                    </h3>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setViewMode('smart')}
                            className={`px-3 py-1 rounded-md text-xs ${viewMode === 'smart'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            🎯 Thông minh
                        </button>
                        <button
                            onClick={() => setViewMode('basic')}
                            className={`px-3 py-1 rounded-md text-xs ${viewMode === 'basic'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            📋 Cơ bản
                        </button>
                    </div>
                </div>
            )}

            {/* Smart Recommendations */}
            {enableIntelligentRecommendations && viewMode === 'smart' && (
                <TemplateRecommendations
                    criteria={criteria}
                    onTemplateSelect={onTemplateSelect}
                    selectedTemplate={selectedTemplate}
                    userPreferences={userPreferences}
                />
            )}

            {/* Basic Template List */}
            {(!enableIntelligentRecommendations || viewMode === 'basic') && (
                <>
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-700">
                            📋 Template chuyên môn
                        </h3>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                                {templates.length} template
                            </span>
                            {!showAllTemplates && (
                                <button
                                    onClick={fetchAllTemplates}
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                    Xem tất cả →
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {templates.map((template) => (
                            <div
                                key={template.id}
                                onClick={() => onTemplateSelect(template)}
                                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedTemplate?.id === template.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 text-sm">
                                            {template.name}
                                        </h4>
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                            {template.description}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end space-y-1 ml-3">
                                        <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(template.difficulty)}`}>
                                            {getDifficultyText(template.difficulty)}
                                        </span>
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                            {getOutputTypeText(template.outputType)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex flex-wrap gap-1">
                                        {template.tags.slice(0, 3).map((tag, index) => (
                                            <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                        {template.tags.length > 3 && (
                                            <span className="text-xs text-gray-500">
                                                +{template.tags.length - 3}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs text-gray-500">
                                            Lớp {template.gradeLevel.join(', ')}
                                        </span>
                                        <span className="text-xs text-blue-600">
                                            {template.variables.length} biến
                                        </span>
                                    </div>
                                </div>

                                {selectedTemplate?.id === template.id && (
                                    <div className="mt-3 pt-3 border-t border-blue-200">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-blue-700 font-medium">
                                                ✓ Template đã chọn
                                            </span>
                                            <span className="text-xs text-blue-600">
                                                {template.compliance.join(', ')}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {templates.length > 0 && (
                        <div className="text-center pt-2">
                            <button
                                onClick={fetchRecommendedTemplates}
                                className="text-xs text-gray-500 hover:text-gray-700"
                            >
                                Làm mới danh sách
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}