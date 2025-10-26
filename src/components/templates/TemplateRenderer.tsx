'use client';

import { PromptTemplate, TemplateVariable } from '@/services/templates/SubjectTemplateService';
import React, { useEffect, useState } from 'react';

// Helper functions
const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
        case 'beginner': return 'bg-green-100 text-green-700';
        case 'intermediate': return 'bg-yellow-100 text-yellow-700';
        case 'advanced': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
        case 'beginner': return 'Cơ bản';
        case 'intermediate': return 'Trung bình';
        case 'advanced': return 'Nâng cao';
        default: return difficulty;
    }
};

const getOutputTypeText = (outputType: string) => {
    switch (outputType) {
        case 'lesson_plan': return 'Kế hoạch bài dạy';
        case 'presentation': return 'Bài thuyết trình';
        case 'assessment': return 'Đánh giá';
        case 'activity': return 'Hoạt động';
        case 'worksheet': return 'Bài tập';
        default: return outputType;
    }
};

interface TemplateRendererProps {
    template: PromptTemplate;
    onPromptGenerated: (prompt: string, variables: Record<string, string>) => void;
    initialVariables?: Record<string, string>;
}

export default function TemplateRenderer({
    template,
    onPromptGenerated,
    initialVariables = {}
}: TemplateRendererProps) {
    const [variables, setVariables] = useState<Record<string, string>>(initialVariables);
    const [preview, setPreview] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        // Initialize variables with default values
        const defaultVariables: Record<string, string> = {};
        template.variables.forEach(variable => {
            if (variable.defaultValue) {
                defaultVariables[variable.name] = variable.defaultValue;
            }
        });
        setVariables(prev => ({ ...defaultVariables, ...prev }));
    }, [template]);

    const handleVariableChange = (variableName: string, value: string) => {
        setVariables(prev => ({ ...prev, [variableName]: value }));
    };

    const generatePreview = async () => {
        try {
            const response = await fetch('/api/templates/render', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    templateId: template.id,
                    variables,
                    preview: true
                }),
            });

            const result = await response.json();
            if (result.success) {
                setPreview(result.data.renderedPrompt);
                setShowPreview(true);
            }
        } catch (error) {
            console.error('Error generating preview:', error);
        }
    };

    const generateFullPrompt = async () => {
        // Validate required fields
        const missingRequired = template.variables
            .filter(variable => variable.required && !variables[variable.name]?.trim())
            .map(variable => variable.label);

        if (missingRequired.length > 0) {
            alert(`Vui lòng điền đầy đủ thông tin: ${missingRequired.join(', ')}`);
            return;
        }

        setIsGenerating(true);

        try {
            const response = await fetch('/api/templates/render', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    templateId: template.id,
                    variables,
                    preview: false
                }),
            });

            const result = await response.json();
            if (result.success) {
                onPromptGenerated(result.data.renderedPrompt, variables);
            } else {
                alert(result.error || 'Có lỗi xảy ra khi tạo prompt');
            }
        } catch (error) {
            console.error('Error generating prompt:', error);
            alert('Lỗi kết nối. Vui lòng thử lại.');
        } finally {
            setIsGenerating(false);
        }
    };

    const renderVariableInput = (variable: TemplateVariable) => {
        const commonProps = {
            id: variable.name,
            value: variables[variable.name] || '',
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
                handleVariableChange(variable.name, e.target.value),
            className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            placeholder: variable.placeholder
        };

        switch (variable.type) {
            case 'text':
                return <input type="text" {...commonProps} />;

            case 'textarea':
                return <textarea rows={3} {...commonProps} />;

            case 'select':
                return (
                    <select {...commonProps}>
                        <option value="">-- Chọn --</option>
                        {variable.options?.map((option, index) => (
                            <option key={`${index}-${option}`} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                );

            case 'multiselect':
                return (
                    <div className="space-y-2">
                        {variable.options?.map((option, index) => (
                            <label key={`${index}-${option}`} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={variables[variable.name]?.split(',').includes(option) || false}
                                    onChange={(e) => {
                                        const currentValues = variables[variable.name]?.split(',').filter(v => v) || [];
                                        let newValues;
                                        if (e.target.checked) {
                                            newValues = [...currentValues, option];
                                        } else {
                                            newValues = currentValues.filter(v => v !== option);
                                        }
                                        handleVariableChange(variable.name, newValues.join(','));
                                    }}
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-700">{option}</span>
                            </label>
                        ))}
                    </div>
                );

            default:
                return <input type="text" {...commonProps} />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Template Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-medium text-blue-900">{template.name}</h3>
                        <p className="text-sm text-blue-700 mt-1">{template.description}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                        <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(template.difficulty)}`}>
                            {getDifficultyText(template.difficulty)}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {getOutputTypeText(template.outputType)}
                        </span>
                    </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                    {template.compliance.map((standard, index) => (
                        <span key={index} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            ✓ {standard}
                        </span>
                    ))}
                </div>

                {/* Recommended AI Tools */}
                {template.recommendedTools && template.recommendedTools.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                        <div className="text-xs text-blue-700 mb-2">🤖 Công cụ AI được đề xuất:</div>
                        <div className="flex flex-wrap gap-2">
                            {template.recommendedTools.map((tool, index) => (
                                <span key={index} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                    {tool}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Template Variables Form */}
            <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Điền thông tin bài học</h4>

                {template.variables.map((variable) => (
                    <div key={variable.name}>
                        <label htmlFor={variable.name} className="block text-sm font-medium text-gray-700 mb-1">
                            {variable.label}
                            {variable.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {renderVariableInput(variable)}
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
                <button
                    onClick={generatePreview}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                >
                    👁️ Xem trước
                </button>
                <button
                    onClick={generateFullPrompt}
                    disabled={isGenerating}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
                >
                    {isGenerating ? 'Đang tạo...' : '🚀 Tạo Prompt'}
                </button>
            </div>

            {/* Preview Modal */}
            {showPreview && preview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Xem trước Template</h3>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto max-h-[60vh]">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                                    {preview}
                                </pre>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border-t border-gray-200">
                            <span className="text-sm text-gray-500">
                                Đây chỉ là bản xem trước (500 ký tự đầu)
                            </span>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                >
                                    Đóng
                                </button>
                                <button
                                    onClick={() => {
                                        setShowPreview(false);
                                        generateFullPrompt();
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Tạo Prompt đầy đủ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Template Examples */}
            {template.examples.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">💡 Ví dụ mẫu</h4>
                    <div className="space-y-3">
                        {template.examples.map((example, index) => (
                            <div key={index} className="bg-white p-3 rounded border">
                                <h5 className="font-medium text-sm text-gray-900">{example.title}</h5>
                                <p className="text-xs text-gray-600 mt-1">{example.description}</p>
                                <button
                                    onClick={() => {
                                        setVariables(prev => ({ ...prev, ...example.sampleInput }));
                                    }}
                                    className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                                >
                                    Sử dụng ví dụ này →
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}