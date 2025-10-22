"use client"

import { useState, useEffect } from 'react';
import { useComplianceChecker } from '@/hooks/useEducationalValidation';

interface ComplianceIndicatorProps {
    content: string;
    gradeLevel: number;
    subject: string;
    className?: string;
}

export default function ComplianceIndicator({
    content,
    gradeLevel,
    subject,
    className = ''
}: ComplianceIndicatorProps) {
    const { complianceResults, isChecking, checkCompliance } = useComplianceChecker();
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        if (content.length >= 10 && gradeLevel && subject) {
            const timer = setTimeout(() => {
                checkCompliance(content, gradeLevel, subject);
            }, 1000); // 1 second debounce

            setDebounceTimer(timer);
        }

        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
        };
    }, [content, gradeLevel, subject, checkCompliance]);

    if (!content || content.length < 10) {
        return null;
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const getGradeColor = (grade: string) => {
        if (grade === 'A' || grade === 'B') return 'text-green-700 bg-green-100';
        if (grade === 'C') return 'text-yellow-700 bg-yellow-100';
        return 'text-red-700 bg-red-100';
    };

    return (
        <div className={`mt-4 space-y-3 ${className}`}>
            {isChecking && (
                <div className="flex items-center space-x-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">Đang kiểm tra tuân thủ chuẩn...</span>
                </div>
            )}

            {complianceResults.overall && (
                <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Đánh giá tuân thủ chuẩn giáo dục</h4>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Điểm tổng:</span>
                            <span className={`px-2 py-1 rounded text-sm font-medium ${getScoreColor(complianceResults.overall.score)}`}>
                                {complianceResults.overall.score}/100
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${getGradeColor(complianceResults.overall.grade)}`}>
                                {complianceResults.overall.grade}
                            </span>
                        </div>
                    </div>

                    {/* Individual Standards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        {complianceResults.gdpt2018 && (
                            <div className={`p-3 rounded border ${getScoreColor(complianceResults.gdpt2018.score)}`}>
                                <div className="font-medium text-sm">GDPT 2018</div>
                                <div className="text-lg font-bold">{complianceResults.gdpt2018.score}%</div>
                            </div>
                        )}

                        {complianceResults.cv5512 && (
                            <div className={`p-3 rounded border ${getScoreColor(complianceResults.cv5512.score)}`}>
                                <div className="font-medium text-sm">CV 5512</div>
                                <div className="text-lg font-bold">{complianceResults.cv5512.score}%</div>
                            </div>
                        )}

                        {complianceResults.terminology && (
                            <div className={`p-3 rounded border ${getScoreColor(complianceResults.terminology.score)}`}>
                                <div className="font-medium text-sm">Thuật ngữ</div>
                                <div className="text-lg font-bold">{complianceResults.terminology.score}%</div>
                            </div>
                        )}
                    </div>

                    {/* Recommendations */}
                    {complianceResults.overall.recommendations && complianceResults.overall.recommendations.length > 0 && (
                        <div className="border-t pt-3">
                            <h5 className="font-medium text-gray-900 mb-2">Gợi ý cải thiện:</h5>
                            <ul className="space-y-1">
                                {complianceResults.overall.recommendations.slice(0, 4).map((recommendation, index) => (
                                    <li key={index} className="text-sm text-gray-700 flex items-start">
                                        <span className="text-blue-500 mr-2">•</span>
                                        <span>{recommendation}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Detailed Suggestions */}
            {(complianceResults.gdpt2018?.suggestions.length || complianceResults.cv5512?.suggestions.length) && (
                <div className="space-y-2">
                    {complianceResults.gdpt2018 && complianceResults.gdpt2018.suggestions.length > 0 && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                            <h6 className="font-medium text-blue-800 text-sm mb-1">Gợi ý GDPT 2018:</h6>
                            <ul className="text-sm text-blue-700 space-y-1">
                                {complianceResults.gdpt2018.suggestions.slice(0, 2).map((suggestion, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>{suggestion}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {complianceResults.cv5512 && complianceResults.cv5512.suggestions.length > 0 && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded">
                            <h6 className="font-medium text-green-800 text-sm mb-1">Gợi ý CV 5512:</h6>
                            <ul className="text-sm text-green-700 space-y-1">
                                {complianceResults.cv5512.suggestions.slice(0, 2).map((suggestion, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>{suggestion}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Simplified compliance badge for inline display
export function ComplianceBadge({
    score,
    grade,
    size = 'sm'
}: {
    score: number;
    grade: string;
    size?: 'sm' | 'md' | 'lg'
}) {
    const getGradeColor = (grade: string) => {
        if (grade === 'A' || grade === 'B') return 'bg-green-100 text-green-800 border-green-200';
        if (grade === 'C') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-red-100 text-red-800 border-red-200';
    };

    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-2 text-base'
    };

    return (
        <div className={`inline-flex items-center space-x-1 rounded-full border font-medium ${getGradeColor(grade)} ${sizeClasses[size]}`}>
            <span>Chuẩn:</span>
            <span className="font-bold">{grade}</span>
            <span className="text-gray-600">({score}%)</span>
        </div>
    );
}

// Progress indicator for compliance score
export function ComplianceProgress({
    score,
    label,
    showPercentage = true
}: {
    score: number;
    label: string;
    showPercentage?: boolean
}) {
    const getProgressColor = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                {showPercentage && (
                    <span className="text-sm text-gray-600">{score}%</span>
                )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(score)}`}
                    style={{ width: `${Math.min(score, 100)}%` }}
                ></div>
            </div>
        </div>
    );
}