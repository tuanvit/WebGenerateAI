'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/forms/FileUpload';
import { PromptDisplay } from '@/components/forms/PromptDisplay';
import { AIToolButtons } from '@/components/integration/AIToolButtons';
import PromptEditor from '@/components/prompt/PromptEditor';
import AIToolSelector from '@/components/ai-tools/AIToolSelector';
import TemplateSelector from '@/components/templates/TemplateSelector';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import { AITool } from '@/services/ai-tool-recommendation';
import { PromptTemplate } from '@/services/templates/SubjectTemplateService';

interface FormData {
    subject: string;
    grade: number;
    lessonName: string;
    objectives: string;
    outputType: string;
    uploadedContent?: string;
}

export default function CreatePromptPage() {
    const [formData, setFormData] = useState<FormData>({
        subject: 'Toán',
        grade: 6,
        lessonName: '',
        objectives: '',
        outputType: 'lesson-plan'
    });

    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [showEditor, setShowEditor] = useState(false);
    const [selectedAITool, setSelectedAITool] = useState<AITool | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
    const [useTemplate, setUseTemplate] = useState(true);
    const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});

    const subjects = [
        'Toán',
        'Văn',
        'Khoa học tự nhiên',
        'Lịch sử & Địa lí',
        'Giáo dục công dân',
        'Công nghệ'
    ];

    const outputTypes = [
        { value: 'lesson-plan', label: 'Giáo án', icon: '📚', color: 'blue' },
        { value: 'presentation', label: 'Slide thuyết trình', icon: '📊', color: 'green' },
        { value: 'assessment', label: 'Câu hỏi đánh giá', icon: '📝', color: 'purple' },
        { value: 'interactive', label: 'Hoạt động tương tác', icon: '🎮', color: 'orange' }
    ];

    const handleInputChange = (field: keyof FormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAIToolSelect = (tool: AITool) => {
        setSelectedAITool(tool);
    };

    const handleTemplateSelect = (template: PromptTemplate) => {
        // If clicking the same template, deselect it
        if (selectedTemplate?.id === template.id) {
            setSelectedTemplate(null);
        } else {
            setSelectedTemplate(template);
        }
        setUseTemplate(true);
    };

    const handleTemplatePromptGenerated = (prompt: string, variables: Record<string, string>) => {
        setGeneratedPrompt(prompt);
        setTemplateVariables(variables);
    };

    const handleFileUpload = async (file: File) => {
        setUploadedFile(file);
        const content = `Nội dung trích xuất từ file ${file.name}`;
        setFormData(prev => ({ ...prev, uploadedContent: content }));
    };

    const generatePrompt = async () => {
        if (!formData.lessonName.trim()) {
            alert('Vui lòng nhập tên bài học');
            return;
        }

        setIsGenerating(true);

        try {
            const response = await fetch('/api/generate-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                setGeneratedPrompt(data.prompt);
            } else {
                const prompt = createFallbackPrompt(formData);
                setGeneratedPrompt(prompt);
            }
        } catch (error) {
            console.error('Error generating prompt:', error);
            const prompt = createFallbackPrompt(formData);
            setGeneratedPrompt(prompt);
        } finally {
            setIsGenerating(false);
        }
    };

    const createFallbackPrompt = (data: FormData): string => {
        return `Bạn là một giáo viên ${data.subject} chuyên nghiệp. Hãy tạo ${data.outputType === 'lesson-plan' ? 'giáo án' : 'nội dung'} chi tiết cho bài học "${data.lessonName}" lớp ${data.grade}.

**Thông tin bài học:**
- Môn học: ${data.subject}
- Lớp: ${data.grade}
- Tên bài: ${data.lessonName}
- Mục tiêu: ${data.objectives}

**Yêu cầu:**
- Tuân thủ chặt chẽ chuẩn GDPT 2018 và Công văn 5512
- Áp dụng phương pháp dạy học tích cực
- Bao gồm hoạt động cá nhân và nhóm
- Có đánh giá năng lực học sinh

${data.uploadedContent ? `\n**Tài liệu tham khảo:**\n${data.uploadedContent}\n` : ''}

Vui lòng trả lời bằng tiếng Việt và tuân thủ chặt chẽ các yêu cầu trên.`;
    };

    const getColorClasses = (color: string, isSelected: boolean) => {
        const colors = {
            blue: isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
            green: isSelected ? 'bg-green-600 text-white border-green-600' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
            purple: isSelected ? 'bg-purple-600 text-white border-purple-600' : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
            orange: isSelected ? 'bg-orange-600 text-white border-orange-600' : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
        };
        return colors[color as keyof typeof colors] || colors.blue;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Tạo Prompt AI cho Giáo viên
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Hệ thống thông minh tạo prompt tuân thủ GDPT 2018 và CV 5512
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Side - Input Form */}
                    <div className="space-y-6">
                        {/* Basic Information Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">
                                    📚
                                </span>
                                Thông tin bài học
                            </h2>

                            <div className="space-y-4">
                                {/* Subject and Grade */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Môn học
                                        </label>
                                        <select
                                            value={formData.subject}
                                            onChange={(e) => handleInputChange('subject', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {subjects.map((subject) => (
                                                <option key={subject} value={subject}>
                                                    {subject}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Lớp
                                        </label>
                                        <select
                                            value={formData.grade}
                                            onChange={(e) => handleInputChange('grade', Number(e.target.value))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {[6, 7, 8, 9].map((grade) => (
                                                <option key={grade} value={grade}>
                                                    Lớp {grade}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Lesson Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tên bài học *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.lessonName}
                                        onChange={(e) => handleInputChange('lessonName', e.target.value)}
                                        placeholder="Ví dụ: Phương trình bậc nhất một ẩn"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Objectives */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mục tiêu bài học
                                    </label>
                                    <textarea
                                        value={formData.objectives}
                                        onChange={(e) => handleInputChange('objectives', e.target.value)}
                                        placeholder="Mục tiêu kiến thức, kỹ năng, thái độ..."
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Output Type Selection */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Loại prompt cần tạo
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {outputTypes.map((type) => (
                                    <button
                                        key={type.value}
                                        onClick={() => handleInputChange('outputType', type.value)}
                                        className={`p-4 rounded-lg border-2 text-left transition-all ${getColorClasses(
                                            type.color,
                                            formData.outputType === type.value
                                        )}`}
                                    >
                                        <div className="flex items-center">
                                            <span className="text-2xl mr-3">{type.icon}</span>
                                            <span className="font-medium">{type.label}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Template Toggle */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Phương thức tạo
                                </h3>
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setUseTemplate(false)}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${!useTemplate
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                            }`}
                                    >
                                        🎨 Tự do
                                    </button>
                                    <button
                                        onClick={() => setUseTemplate(true)}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${useTemplate
                                            ? 'bg-white text-purple-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                            }`}
                                    >
                                        📋 Template
                                    </button>
                                </div>
                            </div>

                            {/* Template Selector */}
                            {useTemplate && formData.subject && formData.grade >= 6 && formData.grade <= 9 && (
                                <div>
                                    <TemplateSelector
                                        subject={formData.subject}
                                        gradeLevel={formData.grade as 6 | 7 | 8 | 9}
                                        outputType={formData.outputType as 'lesson-plan' | 'presentation' | 'assessment'}
                                        onTemplateSelect={handleTemplateSelect}
                                        selectedTemplate={selectedTemplate}
                                        enableIntelligentRecommendations={true}
                                        userPreferences={{
                                            favoriteTemplates: [],
                                            recentlyUsedTemplates: [],
                                            preferredDifficulty: 'intermediate',
                                            subjectExpertise: {
                                                [formData.subject]: 'intermediate'
                                            },
                                            compliancePreferences: ['GDPT 2018', 'CV 5512']
                                        }}
                                    />

                                    {/* Clear Template Button */}
                                    {selectedTemplate && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <button
                                                onClick={() => setSelectedTemplate(null)}
                                                className="text-sm text-gray-600 hover:text-red-600 flex items-center"
                                            >
                                                <span className="mr-1">✕</span>
                                                Bỏ chọn template
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Generate Button for Free Mode or when no template selected */}
                            {(!useTemplate || (useTemplate && !selectedTemplate)) && (
                                <div className="mt-4">
                                    <button
                                        onClick={generatePrompt}
                                        disabled={isGenerating || !formData.lessonName.trim()}
                                        className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg"
                                    >
                                        {isGenerating ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Đang tạo prompt...
                                            </span>
                                        ) : (
                                            '🚀 Tạo Prompt'
                                        )}
                                    </button>
                                    {useTemplate && !selectedTemplate && (
                                        <p className="text-sm text-gray-500 text-center mt-2">
                                            Chọn template ở trên hoặc tạo prompt tự do
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* File Upload */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                📎 Tài liệu tham khảo
                            </h3>
                            <FileUpload onFileUpload={handleFileUpload} />
                            {uploadedFile && (
                                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-green-700 flex items-center">
                                        <span className="mr-2">✓</span>
                                        Đã upload: {uploadedFile.name}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side - Results */}
                    <div className="space-y-6">
                        {/* Template Renderer */}
                        {useTemplate && selectedTemplate && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <TemplateRenderer
                                    template={selectedTemplate}
                                    onPromptGenerated={handleTemplatePromptGenerated}
                                    initialVariables={{
                                        lessonName: formData.lessonName,
                                        gradeLevel: formData.grade.toString(),
                                        objectives: formData.objectives,
                                        subject: formData.subject
                                    }}
                                />
                            </div>
                        )}

                        {/* Generated Prompt */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                                    <span className="bg-green-100 text-green-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">
                                        ✨
                                    </span>
                                    Prompt được tạo
                                </h3>
                                {generatedPrompt && (
                                    <button
                                        onClick={() => setShowEditor(!showEditor)}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        {showEditor ? '👁️ Xem' : '✏️ Chỉnh sửa'}
                                    </button>
                                )}
                            </div>

                            {generatedPrompt ? (
                                <div className="space-y-4">
                                    {showEditor ? (
                                        <PromptEditor
                                            initialPrompt={generatedPrompt}
                                            onSave={(editedPrompt) => {
                                                setGeneratedPrompt(editedPrompt);
                                                setShowEditor(false);
                                            }}
                                        />
                                    ) : (
                                        <div className="bg-gray-50 rounded-lg p-4 border">
                                            <PromptDisplay prompt={generatedPrompt} />
                                        </div>
                                    )}


                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <div className="text-6xl mb-4">📝</div>
                                    <h4 className="text-lg font-medium text-gray-700 mb-2">
                                        Chưa có prompt nào được tạo
                                    </h4>
                                    <p className="text-sm">
                                        {useTemplate
                                            ? 'Chọn template và điền thông tin để bắt đầu'
                                            : 'Điền thông tin bài học và nhấn "Tạo Prompt" để bắt đầu'
                                        }
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* AI Tool Recommendations */}
                        {formData.subject && formData.grade >= 6 && formData.grade <= 9 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    🤖 Công cụ AI được đề xuất
                                </h3>
                                <AIToolSelector
                                    subject={formData.subject}
                                    gradeLevel={formData.grade as 6 | 7 | 8 | 9}
                                    outputType={formData.outputType as 'lesson-plan' | 'presentation' | 'assessment'}
                                    onToolSelect={handleAIToolSelect}
                                    selectedTool={selectedAITool}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}