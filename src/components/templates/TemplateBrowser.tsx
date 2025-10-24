'use client';

import { useState, useEffect } from 'react';
import { PromptTemplate } from '@/services/templates/SubjectTemplateService';

interface TemplateBrowserProps {
    subject?: string;
    gradeLevel?: number;
    outputType?: string;
    onSelectTemplate: (template: PromptTemplate) => void;
    selectedTemplateId?: string;
}

interface TemplateFilters {
    subject: string;
    gradeLevel: string;
    outputType: string;
    search: string;
}

export default function TemplateBrowser({
    subject,
    gradeLevel,
    outputType,
    onSelectTemplate,
    selectedTemplateId
}: TemplateBrowserProps) {
    const [templates, setTemplates] = useState<PromptTemplate[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<PromptTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<PromptTemplate | null>(null);

    const [filters, setFilters] = useState<TemplateFilters>({
        subject: subject || '',
        gradeLevel: gradeLevel?.toString() || '',
        outputType: outputType || '',
        search: ''
    });

    // Load templates
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
    useEffect(() => {
        let filtered = templates;

        if (filters.subject) {
            filtered = filtered.filter(t => t.subject === filters.subject);
        }

        if (filters.gradeLevel) {
            const grade = parseInt(filters.gradeLevel) as 6 | 7 | 8 | 9;
            filtered = filtered.filter(t =>
                t.gradeLevel.includes(grade) || t.gradeLevel.length === 0
            );
        }

        if (filters.outputType) {
            filtered = filtered.filter(t => t.outputType === filters.outputType);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(t =>
                t.name.toLowerCase().includes(searchLower) ||
                t.description.toLowerCase().includes(searchLower) ||
                t.tags.some(tag => tag.toLowerCase().includes(searchLower))
            );
        }

        setFilteredTemplates(filtered);
    }, [templates, filters]);

    const handlePreview = async (template: PromptTemplate) => {
        setPreviewTemplate(template);
    };

    const handleUseTemplate = (template: PromptTemplate) => {
        onSelectTemplate(template);
        setPreviewTemplate(null);
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lọc Templates</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tìm kiếm
                        </label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            placeholder="Tên template, mô tả..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Môn học
                        </label>
                        <select
                            value={filters.subject}
                            onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Tất cả môn học</option>
                            <option value="Toán">Toán</option>
                            <option value="Ngữ văn">Ngữ văn</option>
                            <option value="Khoa học tự nhiên">Khoa học tự nhiên</option>
                            <option value="Lịch sử và Địa lí">Lịch sử và Địa lí</option>
                            <option value="Giáo dục công dân">Giáo dục công dân</option>
                            <option value="Công nghệ">Công nghệ</option>
                        </select>
                    </div>

                    {/* Grade Level */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Lớp
                        </label>
                        <select
                            value={filters.gradeLevel}
                            onChange={(e) => setFilters(prev => ({ ...prev, gradeLevel: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Tất cả lớp</option>
                            <option value="6">Lớp 6</option>
                            <option value="7">Lớp 7</option>
                            <option value="8">Lớp 8</option>
                            <option value="9">Lớp 9</option>
                        </select>
                    </div>

                    {/* Output Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Loại đầu ra
                        </label>
                        <select
                            value={filters.outputType}
                            onChange={(e) => setFilters(prev => ({ ...prev, outputType: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Tất cả loại</option>
                            <option value="lesson-plan">Giáo án</option>
                            <option value="presentation">Bài thuyết trình</option>
                            <option value="assessment">Đánh giá</option>
                            <option value="activity">Hoạt động</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                    <div
                        key={template.id}
                        className={`bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${selectedTemplateId === template.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <div className="p-4">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 mb-1">
                                        <a
                                            href={`/templates/${template.id}`}
                                            className="hover:text-blue-600 hover:underline"
                                        >
                                            {template.name}
                                        </a>
                                    </h4>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                            {template.subject}
                                        </span>
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                            {template.outputType}
                                        </span>
                                    </div>
                                </div>
                                {selectedTemplateId === template.id && (
                                    <div className="text-blue-600 ml-2">
                                        <span className="text-lg">✓</span>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {template.description}
                            </p>

                            {/* Grade Levels */}
                            {template.gradeLevel.length > 0 && (
                                <div className="mb-3">
                                    <div className="flex flex-wrap gap-1">
                                        {template.gradeLevel.map((grade) => (
                                            <span
                                                key={grade}
                                                className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                                            >
                                                Lớp {grade}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            {template.tags.length > 0 && (
                                <div className="mb-4">
                                    <div className="flex flex-wrap gap-1">
                                        {template.tags.slice(0, 3).map((tag) => (
                                            <span
                                                key={tag}
                                                className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                        {template.tags.length > 3 && (
                                            <span className="text-gray-500 text-xs">
                                                +{template.tags.length - 3} khác
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handlePreview(template)}
                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    👁️ Xem trước
                                </button>
                                <button
                                    onClick={() => handleUseTemplate(template)}
                                    className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    ✨ Sử dụng
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
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

            {/* Preview Modal */}
            {previewTemplate && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Xem trước: {previewTemplate.name}
                            </h3>
                            <button
                                onClick={() => setPreviewTemplate(null)}
                                className="text-gray-400 hover:text-gray-600 text-xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
                            <div className="space-y-4">
                                {/* Template Info */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-700">Môn học:</span>
                                            <span className="ml-2 text-gray-900">{previewTemplate.subject}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Loại:</span>
                                            <span className="ml-2 text-gray-900">{previewTemplate.outputType}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Lớp:</span>
                                            <span className="ml-2 text-gray-900">
                                                {previewTemplate.gradeLevel.length > 0
                                                    ? previewTemplate.gradeLevel.map(g => `Lớp ${g}`).join(', ')
                                                    : 'Tất cả lớp'
                                                }
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Tags:</span>
                                            <span className="ml-2 text-gray-900">
                                                {previewTemplate.tags.join(', ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Mô tả:</h4>
                                    <p className="text-gray-700">{previewTemplate.description}</p>
                                </div>

                                {/* Template Content Preview */}
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Nội dung template:</h4>
                                    <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                                        <pre className="whitespace-pre-wrap text-gray-800">
                                            {previewTemplate.template.substring(0, 500)}
                                            {previewTemplate.template.length > 500 && '...'}
                                        </pre>
                                    </div>
                                </div>

                                {/* Variables */}
                                {previewTemplate.variables && previewTemplate.variables.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Biến cần điền:</h4>
                                        <div className="space-y-2">
                                            {previewTemplate.variables.map((variable) => (
                                                <div key={variable.name} className="bg-blue-50 rounded-lg p-3">
                                                    <div className="font-medium text-blue-900">
                                                        {variable.label}
                                                    </div>
                                                    <div className="text-sm text-blue-700">
                                                        {variable.description}
                                                    </div>
                                                    <div className="text-xs text-blue-600 mt-1">
                                                        Biến: {variable.name}
                                                        {variable.required && <span className="text-red-600 ml-1">*</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">
                            <button
                                onClick={() => setPreviewTemplate(null)}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={() => handleUseTemplate(previewTemplate)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Sử dụng template này
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}