'use client';

import { useState, useEffect } from 'react';
import { PromptTemplate } from '@/services/templates/SubjectTemplateService';

interface DetailedTemplate {
    id: string;
    name: string;
    description: string;
    subject: string;
    gradeLevel: (6 | 7 | 8 | 9)[];
    outputType: string;
    tags: string[];
    difficulty: string;
    compliance: string[];
    recommendedTools: string[];
    variableCount: number;
    exampleCount: number;
    templateLength: number;
}

interface DetailedStats {
    totalTemplates: number;
    totalVariables: number;
    totalExamples: number;
    averageComplexity: {
        beginner: number;
        intermediate: number;
        advanced: number;
    };
    bySubject: Record<string, any>;
    byOutputType: Record<string, any>;
}

export default function TemplatesAdminPage() {
    const [templates, setTemplates] = useState<DetailedTemplate[]>([]);
    const [stats, setStats] = useState<DetailedStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<DetailedTemplate | null>(null);
    const [viewMode, setViewMode] = useState<'overview' | 'list' | 'stats'>('overview');

    useEffect(() => {
        const loadDetailedData = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/templates/detailed');
                if (!response.ok) throw new Error('Failed to load detailed templates');

                const data = await response.json();
                setTemplates(data.templates);
                setStats(data.stats);
            } catch (err) {
                setError('Không thể tải thông tin chi tiết templates');
                console.error('Error loading detailed templates:', err);
            } finally {
                setLoading(false);
            }
        };

        loadDetailedData();
    }, []);

    const outputTypeNames: Record<string, string> = {
        'lesson-plan': 'Giáo án',
        'presentation': 'Bài thuyết trình',
        'assessment': 'Đánh giá',
        'interactive': 'Tương tác',
        'research': 'Nghiên cứu'
    };

    const difficultyNames: Record<string, string> = {
        'beginner': 'Cơ bản',
        'intermediate': 'Trung bình',
        'advanced': 'Nâng cao'
    };

    const difficultyColors: Record<string, string> = {
        'beginner': 'bg-green-100 text-green-800',
        'intermediate': 'bg-yellow-100 text-yellow-800',
        'advanced': 'bg-red-100 text-red-800'
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải thông tin chi tiết...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        🔧 Quản lý Templates - Chi tiết
                    </h1>
                    <p className="text-lg text-gray-600">
                        Xem thông tin chi tiết và thống kê về tất cả templates trong hệ thống
                    </p>
                </div>

                {/* Navigation */}
                <div className="mb-6">
                    <nav className="flex space-x-4">
                        {[
                            { key: 'overview', label: 'Tổng quan', icon: '📊' },
                            { key: 'list', label: 'Danh sách chi tiết', icon: '📋' },
                            { key: 'stats', label: 'Thống kê', icon: '📈' }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setViewMode(tab.key as any)}
                                className={`flex items-center px-4 py-2 rounded-lg font-medium ${viewMode === tab.key
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                {viewMode === 'overview' && stats && (
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                                <div className="text-3xl font-bold text-blue-600 mb-2">
                                    {stats.totalTemplates}
                                </div>
                                <div className="text-gray-600">Tổng Templates</div>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                                <div className="text-3xl font-bold text-green-600 mb-2">
                                    {stats.totalVariables}
                                </div>
                                <div className="text-gray-600">Tổng Biến</div>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                                <div className="text-3xl font-bold text-purple-600 mb-2">
                                    {stats.totalExamples}
                                </div>
                                <div className="text-gray-600">Tổng Ví dụ</div>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                                <div className="text-3xl font-bold text-orange-600 mb-2">
                                    {Math.round(stats.totalVariables / stats.totalTemplates * 10) / 10}
                                </div>
                                <div className="text-gray-600">TB Biến/Template</div>
                            </div>
                        </div>

                        {/* Complexity Distribution */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                📊 Phân bố độ khó
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600 mb-1">
                                        {stats.averageComplexity.beginner}
                                    </div>
                                    <div className="text-sm text-gray-600">Cơ bản</div>
                                    <div className="text-xs text-gray-500">
                                        {Math.round(stats.averageComplexity.beginner / stats.totalTemplates * 100)}%
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600 mb-1">
                                        {stats.averageComplexity.intermediate}
                                    </div>
                                    <div className="text-sm text-gray-600">Trung bình</div>
                                    <div className="text-xs text-gray-500">
                                        {Math.round(stats.averageComplexity.intermediate / stats.totalTemplates * 100)}%
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600 mb-1">
                                        {stats.averageComplexity.advanced}
                                    </div>
                                    <div className="text-sm text-gray-600">Nâng cao</div>
                                    <div className="text-xs text-gray-500">
                                        {Math.round(stats.averageComplexity.advanced / stats.totalTemplates * 100)}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Subject Breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    📚 Theo môn học
                                </h3>
                                <div className="space-y-4">
                                    {Object.entries(stats.bySubject).map(([subject, data]) => (
                                        <div key={subject} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-medium text-gray-900">{subject}</h4>
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                                                    {data.count} templates
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Độ khó: {data.difficulties.beginner} cơ bản, {data.difficulties.intermediate} trung bình, {data.difficulties.advanced} nâng cao
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    🎯 Theo loại đầu ra
                                </h3>
                                <div className="space-y-4">
                                    {Object.entries(stats.byOutputType).map(([type, data]) => (
                                        <div key={type} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-medium text-gray-900">
                                                    {outputTypeNames[type] || type}
                                                </h4>
                                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                                                    {data.count} templates
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Môn học: {data.subjects.join(', ')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {viewMode === 'list' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Template
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Môn học
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Loại
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Độ khó
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Biến
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ví dụ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Độ dài
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Hành động
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {templates.map((template) => (
                                        <tr key={template.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        <a
                                                            href={`/templates/${template.id}`}
                                                            className="hover:text-blue-600 hover:underline"
                                                        >
                                                            {template.name}
                                                        </a>
                                                    </div>
                                                    <div className="text-sm text-gray-500 line-clamp-1">
                                                        {template.description}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {template.subject}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {outputTypeNames[template.outputType] || template.outputType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyColors[template.difficulty]}`}>
                                                    {difficultyNames[template.difficulty]}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {template.variableCount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {template.exampleCount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {Math.round(template.templateLength / 100) / 10}k ký tự
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <a
                                                    href={`/templates/${template.id}`}
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                >
                                                    Xem chi tiết
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {viewMode === 'stats' && stats && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                📈 Thống kê chi tiết
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">Thống kê tổng quan:</h4>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li>• Tổng số templates: <strong>{stats.totalTemplates}</strong></li>
                                        <li>• Tổng số biến: <strong>{stats.totalVariables}</strong></li>
                                        <li>• Tổng số ví dụ: <strong>{stats.totalExamples}</strong></li>
                                        <li>• Trung bình biến/template: <strong>{Math.round(stats.totalVariables / stats.totalTemplates * 10) / 10}</strong></li>
                                        <li>• Trung bình ví dụ/template: <strong>{Math.round(stats.totalExamples / stats.totalTemplates * 10) / 10}</strong></li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">Phân bố độ khó:</h4>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li>• Cơ bản: <strong>{stats.averageComplexity.beginner}</strong> ({Math.round(stats.averageComplexity.beginner / stats.totalTemplates * 100)}%)</li>
                                        <li>• Trung bình: <strong>{stats.averageComplexity.intermediate}</strong> ({Math.round(stats.averageComplexity.intermediate / stats.totalTemplates * 100)}%)</li>
                                        <li>• Nâng cao: <strong>{stats.averageComplexity.advanced}</strong> ({Math.round(stats.averageComplexity.advanced / stats.totalTemplates * 100)}%)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}