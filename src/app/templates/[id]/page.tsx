'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PromptTemplate } from '@/services/templates/SubjectTemplateService';

export default function TemplateDetailPage() {
    const params = useParams();
    const router = useRouter();
    const templateId = params.id as string;

    const [template, setTemplate] = useState<PromptTemplate | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [previewVariables, setPreviewVariables] = useState<Record<string, string>>({});
    const [renderedPreview, setRenderedPreview] = useState<string>('');

    useEffect(() => {
        const loadTemplate = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/templates');
                if (!response.ok) throw new Error('Failed to load templates');

                const data = await response.json();
                const foundTemplate = data.templates.find((t: PromptTemplate) => t.id === templateId);

                if (!foundTemplate) {
                    setError('Template không tồn tại');
                    return;
                }

                setTemplate(foundTemplate);

                // Initialize preview variables with default values
                const initialVariables: Record<string, string> = {};
                foundTemplate.variables.forEach((variable: any) => {
                    initialVariables[variable.name] = variable.defaultValue || variable.placeholder || '';
                });
                setPreviewVariables(initialVariables);

            } catch (err) {
                setError('Không thể tải thông tin template');
                console.error('Error loading template:', err);
            } finally {
                setLoading(false);
            }
        };

        if (templateId) {
            loadTemplate();
        }
    }, [templateId]);

    useEffect(() => {
        if (template) {
            // Render preview with current variables
            let preview = template.template;
            Object.entries(previewVariables).forEach(([key, value]) => {
                const regex = new RegExp(`{{${key}}}`, 'g');
                preview = preview.replace(regex, value || `[${key}]`);
            });
            setRenderedPreview(preview);
        }
    }, [template, previewVariables]);

    const handleVariableChange = (variableName: string, value: string) => {
        setPreviewVariables(prev => ({
            ...prev,
            [variableName]: value
        }));
    };

    const handleUseTemplate = () => {
        router.push(`/create-prompt?template=${templateId}`);
    };

    const outputTypeNames: Record<string, string> = {
        'lesson-plan': 'Kế hoạch bài dạy',
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
                    <p className="text-gray-600">Đang tải thông tin template...</p>
                </div>
            </div>
        );
    }

    if (error || !template) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => router.push('/templates')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Quay lại danh sách templates
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => router.push('/templates')}
                            className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                            ← Quay lại danh sách
                        </button>
                        <button
                            onClick={handleUseTemplate}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                            ✨ Sử dụng template này
                        </button>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {template.name}
                    </h1>
                    <p className="text-lg text-gray-600">
                        {template.description}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Template Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Basic Info */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                📋 Thông tin cơ bản
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <span className="text-sm font-medium text-gray-700">Môn học:</span>
                                    <div className="mt-1">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                            {template.subject}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-sm font-medium text-gray-700">Loại đầu ra:</span>
                                    <div className="mt-1">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                            {outputTypeNames[template.outputType] || template.outputType}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-sm font-medium text-gray-700">Lớp học:</span>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {template.gradeLevel.map((grade) => (
                                            <span
                                                key={grade}
                                                className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-gray-100 text-gray-800"
                                            >
                                                Lớp {grade}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-sm font-medium text-gray-700">Độ khó:</span>
                                    <div className="mt-1">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${difficultyColors[template.difficulty]}`}>
                                            {difficultyNames[template.difficulty]}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                🏷️ Tags
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {template.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Compliance */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                ✅ Tuân thủ chuẩn
                            </h3>
                            <div className="space-y-2">
                                {template.compliance.map((standard) => (
                                    <div key={standard} className="flex items-center">
                                        <span className="text-green-600 mr-2">✓</span>
                                        <span className="text-sm text-gray-700">{standard}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recommended Tools */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                🛠️ Công cụ AI khuyến nghị
                            </h3>
                            <div className="space-y-2">
                                {template.recommendedTools.map((tool) => (
                                    <div key={tool} className="flex items-center">
                                        <span className="text-blue-600 mr-2">🤖</span>
                                        <span className="text-sm text-gray-700 capitalize">{tool}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Template Content & Preview */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Variables Input */}
                        {template.variables.length > 0 && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    📝 Điền thông tin
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {template.variables.map((variable) => (
                                        <div key={variable.name}>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {variable.label}
                                                {variable.required && <span className="text-red-500 ml-1">*</span>}
                                            </label>
                                            {variable.description && (
                                                <p className="text-xs text-gray-500 mb-2">{variable.description}</p>
                                            )}

                                            {variable.type === 'textarea' ? (
                                                <textarea
                                                    value={previewVariables[variable.name] || ''}
                                                    onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                                                    placeholder={variable.placeholder}
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            ) : variable.type === 'select' ? (
                                                <select
                                                    value={previewVariables[variable.name] || ''}
                                                    onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="">Chọn...</option>
                                                    {variable.options?.map((option) => (
                                                        <option key={option} value={option}>{option}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={previewVariables[variable.name] || ''}
                                                    onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                                                    placeholder={variable.placeholder}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Preview */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                👁️ Xem trước prompt
                            </h3>
                            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                                    {renderedPreview}
                                </pre>
                            </div>
                        </div>

                        {/* Examples */}
                        {template.examples.length > 0 && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    💡 Ví dụ sử dụng
                                </h3>
                                <div className="space-y-4">
                                    {template.examples.map((example, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <h4 className="font-medium text-gray-900 mb-2">
                                                {example.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 mb-3">
                                                {example.description}
                                            </p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700 mb-2">Đầu vào mẫu:</h5>
                                                    <div className="bg-blue-50 rounded p-3 text-sm">
                                                        {Object.entries(example.sampleInput).map(([key, value]) => (
                                                            <div key={key} className="mb-1">
                                                                <span className="font-medium">{key}:</span> {value}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700 mb-2">Kết quả mong đợi:</h5>
                                                    <div className="bg-green-50 rounded p-3 text-sm">
                                                        {example.expectedOutput}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}