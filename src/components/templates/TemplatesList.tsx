'use client';

import { useState, useEffect } from 'react';
import { PromptTemplate } from '@/services/templates/SubjectTemplateService';

interface TemplatesListProps {
    onSelectTemplate?: (template: PromptTemplate) => void;
    showActions?: boolean;
}

export default function TemplatesList({ onSelectTemplate, showActions = true }: TemplatesListProps) {
    const [templates, setTemplates] = useState<PromptTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSubject, setFilterSubject] = useState('');
    const [filterOutputType, setFilterOutputType] = useState('');
    const [filterGradeLevel, setFilterGradeLevel] = useState('');

    useEffect(() => {
        const loadTemplates = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/templates');
                if (!response.ok) throw new Error('Failed to load templates');

                const data = await response.json();
                setTemplates(data.templates || []);
            } catch (err) {
                setError('Không thể tải danh sách templates');
                console.error('Error loading templates:', err);
            } finally {
                setLoading(false);
            }
        };

        loadTemplates();
    }, []);

    // Filter templates
    const filteredTemplates = templates.filter(template => {
        const matchesSearch = !searchTerm ||
            template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesSubject = !filterSubject || template.subject === filterSubject;
        const matchesOutputType = !filterOutputType || template.outputType === filterOutputType;
        const matchesGradeLevel = !filterGradeLevel ||
            template.gradeLevel.includes(parseInt(filterGradeLevel) as 6 | 7 | 8 | 9);

        return matchesSearch && matchesSubject && matchesOutputType && matchesGradeLevel;
    });

    // Get unique values for filters
    const subjects = [...new Set(templates.map(t => t.subject))];
    const outputTypes = [...new Set(templates.map(t => t.outputType))];
    const gradeLevels = ['6', '7', '8', '9'];

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
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Đang tải templates...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                    <span className="text-red-600 mr-2">⚠️</span>
                    <span className="text-red-800">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Tìm kiếm và lọc</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tìm kiếm
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tên, mô tả, tags..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Subject Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Môn học
                        </label>
                        <select
                            value={filterSubject}
                            onChange={(e) => setFilterSubject(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Tất cả môn học</option>
                            {subjects.map(subject => (
                                <option key={subject} value={subject}>{subject}</option>
                            ))}
                        </select>
                    </div>

                    {/* Output Type Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Loại đầu ra
                        </label>
                        <select
                            value={filterOutputType}
                            onChange={(e) => setFilterOutputType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Tất cả loại</option>
                            {outputTypes.map(type => (
                                <option key={type} value={type}>
                                    {outputTypeNames[type] || type}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Grade Level Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Lớp
                        </label>
                        <select
                            value={filterGradeLevel}
                            onChange={(e) => setFilterGradeLevel(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Tất cả lớp</option>
                            {gradeLevels.map(grade => (
                                <option key={grade} value={grade}>Lớp {grade}</option>
                            ))}
                        </select>
                    </div>

                    {/* Clear Filters */}
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterSubject('');
                                setFilterOutputType('');
                                setFilterGradeLevel('');
                            }}
                            className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            🗑️ Xóa bộ lọc
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                    Hiển thị <span className="font-medium">{filteredTemplates.length}</span> trong tổng số <span className="font-medium">{templates.length}</span> templates
                </div>
            </div>

            {/* Templates Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                                    Lớp
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Độ khó
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tags
                                </th>
                                {showActions && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Hành động
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTemplates.map((template) => (
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
                                            <div className="text-sm text-gray-500 line-clamp-2">
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
                                        <div className="flex flex-wrap gap-1">
                                            {template.gradeLevel.map((grade) => (
                                                <span
                                                    key={grade}
                                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                                >
                                                    {grade}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyColors[template.difficulty]}`}>
                                            {difficultyNames[template.difficulty]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {template.tags.slice(0, 3).map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                            {template.tags.length > 3 && (
                                                <span className="text-xs text-gray-500">
                                                    +{template.tags.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    {showActions && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => {
                                                        // Show preview modal
                                                        alert(`Xem trước: ${template.name}`);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Xem trước"
                                                >
                                                    👁️
                                                </button>
                                                <button
                                                    onClick={() => onSelectTemplate?.(template)}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Sử dụng template"
                                                >
                                                    ✨
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* No Results */}
            {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📝</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Không tìm thấy template nào
                    </h3>
                    <p className="text-gray-600">
                        Thử thay đổi bộ lọc để tìm template phù hợp
                    </p>
                </div>
            )}
        </div>
    );
}