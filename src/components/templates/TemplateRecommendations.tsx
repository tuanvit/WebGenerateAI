'use client';

import React, { useState, useEffect } from 'react';
import { TemplateMatch, TemplateSelectionCriteria } from '@/services/templates/TemplateSelectionEngine';
import { PromptTemplate } from '@/services/templates/SubjectTemplateService';

interface TemplateRecommendationsProps {
    criteria: TemplateSelectionCriteria;
    onTemplateSelect: (template: PromptTemplate) => void;
    selectedTemplate?: PromptTemplate | null;
    userPreferences?: any;
}

export default function TemplateRecommendations({
    criteria,
    onTemplateSelect,
    selectedTemplate,
    userPreferences
}: TemplateRecommendationsProps) {
    const [matches, setMatches] = useState<TemplateMatch[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDetails, setShowDetails] = useState<string | null>(null);

    useEffect(() => {
        if (criteria.subject && criteria.gradeLevel && criteria.outputType) {
            fetchRecommendations();
        }
    }, [criteria]);

    const fetchRecommendations = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/templates/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    criteria,
                    userPreferences,
                    action: userPreferences ? 'personalized' : 'findAll'
                }),
            });

            const result = await response.json();
            if (result.success) {
                setMatches(result.data || []);
            } else {
                setError(result.error || 'Không thể lấy đề xuất template');
            }
        } catch (err) {
            setError('Lỗi kết nối. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const getConfidenceColor = (confidence: string) => {
        switch (confidence) {
            case 'high': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getConfidenceText = (confidence: string) => {
        switch (confidence) {
            case 'high': return 'Rất phù hợp';
            case 'medium': return 'Phù hợp';
            case 'low': return 'Ít phù hợp';
            default: return confidence;
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 60) return 'text-green-600';
        if (score >= 40) return 'text-yellow-600';
        return 'text-red-600';
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700">🎯 Đề xuất thông minh</h3>
                    <div className="animate-pulse h-4 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
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
                    <div className="shrink-0">
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

    if (matches.length === 0) {
        return (
            <div className="text-center p-6 text-gray-500">
                <span className="text-3xl mb-3 block">🎯</span>
                <p className="text-sm">Không tìm thấy template phù hợp với tiêu chí này.</p>
                <button
                    onClick={fetchRecommendations}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">
                    🎯 Đề xuất thông minh
                </h3>
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                        {matches.length} template
                    </span>
                    {userPreferences && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            Cá nhân hóa
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                {matches.map((match, index) => (
                    <div
                        key={match.template.id}
                        className={`border rounded-lg transition-all hover:shadow-md ${selectedTemplate?.id === match.template.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <div
                            onClick={() => onTemplateSelect(match.template)}
                            className="p-4 cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <h4 className="font-medium text-gray-900 text-sm">
                                            {match.template.name}
                                        </h4>
                                        {index === 0 && (
                                            <span className="text-xs bg-gold-100 text-gold-700 px-2 py-1 rounded">
                                                🏆 Tốt nhất
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-600 line-clamp-2">
                                        {match.template.description}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end space-y-1 ml-3">
                                    <div className="flex items-center space-x-2">
                                        <span className={`text-xs font-bold ${getScoreColor(match.score)}`}>
                                            {match.score}%
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded ${getConfidenceColor(match.confidence)}`}>
                                            {getConfidenceText(match.confidence)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Match Reasons */}
                            <div className="flex flex-wrap gap-1 mb-2">
                                {(match.reasons || []).slice(0, 3).map((reason, idx) => (
                                    <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                        ✓ {reason}
                                    </span>
                                ))}
                                {(match.reasons || []).length > 3 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowDetails(showDetails === match.template.id ? null : match.template.id);
                                        }}
                                        className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                        +{(match.reasons || []).length - 3} lý do khác
                                    </button>
                                )}
                            </div>

                            {/* Template Info */}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Lớp {match.template.gradeLevel.join(', ')}</span>
                                <span>{match.template.variables.length} biến</span>
                                <span>{match.template.examples.length} ví dụ</span>
                            </div>
                        </div>

                        {/* Detailed Reasons */}
                        {showDetails === match.template.id && (
                            <div className="border-t border-gray-200 p-4 bg-gray-50">
                                <h5 className="text-xs font-medium text-gray-700 mb-2">
                                    Tại sao template này phù hợp:
                                </h5>
                                <div className="space-y-1">
                                    {(match.reasons || []).map((reason, idx) => (
                                        <div key={idx} className="flex items-center text-xs text-gray-600">
                                            <span className="text-green-500 mr-2">✓</span>
                                            {reason}
                                        </div>
                                    ))}
                                </div>

                                {/* Score Breakdown */}
                                <div className="mt-3 pt-3 border-t border-gray-300">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-600">Điểm phù hợp:</span>
                                        <span className={`font-bold ${getScoreColor(match.score)}`}>
                                            {match.score}/100
                                        </span>
                                    </div>
                                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${match.score >= 60 ? 'bg-green-500' :
                                                match.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                            style={{ width: `${Math.min(match.score, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Selected Indicator */}
                        {selectedTemplate?.id === match.template.id && (
                            <div className="border-t border-blue-200 p-3 bg-blue-50">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-blue-700 font-medium">
                                        ✓ Template đã chọn
                                    </span>
                                    <span className="text-xs text-blue-600">
                                        {match.template.compliance.join(', ')}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Refresh Button */}
            <div className="text-center pt-2">
                <button
                    onClick={fetchRecommendations}
                    className="text-xs text-gray-500 hover:text-gray-700"
                >
                    🔄 Làm mới đề xuất
                </button>
            </div>
        </div>
    );
}