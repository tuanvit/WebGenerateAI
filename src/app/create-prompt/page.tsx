'use client';

import { FileUpload } from '@/components/forms/FileUpload';
import { PromptDisplay } from '@/components/forms/PromptDisplay';
import { useState } from 'react';
// import { AIToolButtons } from '@/components/integration/AIToolButtons';
import AIToolSelector from '@/components/ai-tools/AIToolSelector';
import PromptEditor from '@/components/prompt/PromptEditor';
import TemplateBrowser from '@/components/templates/TemplateBrowser';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import TemplateSelector from '@/components/templates/TemplateSelector';
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
    const [showTemplateBrowser, setShowTemplateBrowser] = useState(false);

    const subjects = [
        'Toán',
        'Văn',
        'Khoa học tự nhiên',
        'Lịch sử & Địa lí',
        'Giáo dục công dân',
        'Công nghệ'
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

    const handleTemplateBrowserSelect = (template: PromptTemplate) => {
        setSelectedTemplate(template);
        setShowTemplateBrowser(false);
        // Auto-switch to template mode if not already
        if (!useTemplate) {
            setUseTemplate(true);
        }
    };

    const handleFileUpload = async (file: File) => {
        setUploadedFile(file);
        const content = `Nội dung trích xuất từ file ${file.name}`;
        setFormData(prev => ({ ...prev, uploadedContent: content }));
    };

    const generatePrompt = async () => {
        if (!formData.lessonName.trim()) {
            alert('Vui lòng nhập chủ đề giáo trình');
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
        return `Bạn là một chuyên gia giáo dục và biên soạn giáo trình ${data.subject} chuyên nghiệp. Hãy tạo giáo trình chi tiết về chủ đề "${data.lessonName}" cho học sinh lớp ${data.grade}.

**Thông tin giáo trình:**
- Môn học: ${data.subject}
- Lớp: ${data.grade}
- Chủ đề: ${data.lessonName}
- Mục tiêu: ${data.objectives}

**Yêu cầu biên soạn giáo trình:**
- Tuân thủ chặt chẽ chuẩn GDPT 2018 và Công văn 5512
- Cấu trúc rõ ràng với các chương, mục, tiểu mục
- Nội dung khoa học, chính xác, phù hợp độ tuổi
- Bao gồm lý thuyết, ví dụ minh họa, bài tập thực hành
- Có hệ thống câu hỏi và bài tập đa dạng
- Phương pháp dạy học tích cực và đánh giá năng lực
- Tích hợp giáo dục kỹ năng sống và giá trị nhân văn

**Cấu trúc giáo trình cần có:**
1. Mục tiêu học tập
2. Nội dung kiến thức cốt lõi
3. Ví dụ và bài tập minh họa
4. Hoạt động thực hành
5. Câu hỏi tự đánh giá
6. Tài liệu tham khảo

${data.uploadedContent ? `\n**Tài liệu tham khảo:**\n${data.uploadedContent}\n` : ''}

Vui lòng trả lời bằng tiếng Việt và tuân thủ chặt chẽ các yêu cầu trên.`;
    };

    const handleSaveToPersonalLibrary = async () => {
        if (!generatedPrompt) return;

        try {
            const response = await fetch('/api/library/prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.lessonName || 'Prompt không có tiêu đề',
                    content: generatedPrompt,
                    subject: formData.subject,
                    gradeLevel: formData.grade,
                    outputType: formData.outputType,
                    inputParameters: formData,
                    templateId: selectedTemplate?.id,
                    templateVariables: templateVariables
                }),
            });

            const result = await response.json();
            if (result.success) {
                alert('✅ Đã lưu prompt vào thư viện cá nhân!');
                return result.data?.id; // Return the saved prompt ID
            } else {
                alert('❌ Lỗi khi lưu prompt: ' + result.error);
                return null;
            }
        } catch (error) {
            console.error('Error saving prompt:', error);
            alert('❌ Lỗi kết nối khi lưu prompt');
            return null;
        }
    };

    const handleShareToCommunity = async () => {
        if (!generatedPrompt) {
            alert('❌ Chưa có prompt để chia sẻ');
            return;
        }

        // Validate required fields
        if (!formData.subject || !formData.grade || formData.grade < 6 || formData.grade > 9) {
            alert('❌ Thông tin môn học hoặc khối lớp không hợp lệ (yêu cầu lớp 6-9)');
            return;
        }

        try {
            // Step 1: Save to personal library first to get promptId
            const saveResponse = await fetch('/api/library/prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.lessonName || 'Prompt không có tiêu đề',
                    content: generatedPrompt,
                    subject: formData.subject,
                    gradeLevel: formData.grade,
                    outputType: formData.outputType,
                    inputParameters: formData,
                    templateId: selectedTemplate?.id,
                    templateVariables: templateVariables
                }),
            });

            const saveResult = await saveResponse.json();
            if (!saveResult.success || !saveResult.data?.id) {
                alert('❌ Lỗi khi lưu prompt: ' + (saveResult.error || 'Không có ID'));
                return;
            }

            const promptId = saveResult.data.id;

            // Step 2: Share to community using the promptId
            const shareResponse = await fetch('/api/community/share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    promptId: promptId,
                    title: formData.lessonName || 'Prompt không có tiêu đề',
                    description: formData.objectives || `Prompt ${formData.outputType} cho ${formData.subject} lớp ${formData.grade}`,
                    subject: formData.subject,
                    gradeLevel: formData.grade,
                    tags: [
                        '#GDPT2018',
                        '#CV5512',
                        `#${formData.subject}`,
                        `#Lớp${formData.grade}`,
                        selectedTemplate ? '#Template' : '#TựDo'
                    ]
                }),
            });

            const shareResult = await shareResponse.json();

            if (shareResponse.ok) {
                alert('🌍 Đã chia sẻ prompt lên cộng đồng thành công!');
            } else {
                alert('❌ Lỗi khi chia sẻ: ' + (shareResult.error || shareResult.details || 'Unknown error'));
                console.error('Share error:', shareResult);
            }
        } catch (error) {
            console.error('Error sharing prompt:', error);
            alert('❌ Lỗi kết nối khi chia sẻ prompt');
        }
    };

    const handleCopyPrompt = async () => {
        if (!generatedPrompt) return;

        try {
            await navigator.clipboard.writeText(generatedPrompt);
            alert('📋 Đã sao chép prompt vào clipboard!');
        } catch (error) {
            console.error('Error copying prompt:', error);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = generatedPrompt;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('📋 Đã sao chép prompt vào clipboard!');
        }
    };

    // const getColorClasses = (color: string, isSelected: boolean) => {
    //     const colors = {
    //         blue: isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    //         green: isSelected ? 'bg-green-600 text-white border-green-600' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
    //         purple: isSelected ? 'bg-purple-600 text-white border-purple-600' : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    //         orange: isSelected ? 'bg-orange-600 text-white border-orange-600' : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
    //         red: isSelected ? 'bg-red-600 text-white border-red-600' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
    //         pink: isSelected ? 'bg-pink-600 text-white border-pink-600' : 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100',
    //         indigo: isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
    //         yellow: isSelected ? 'bg-yellow-600 text-white border-yellow-600' : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
    //         gray: isSelected ? 'bg-gray-600 text-white border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
    //     };
    //     return colors[color as keyof typeof colors] || colors.blue;
    // };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Tạo Prompt Giáo Dục
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Hệ thống thông minh tạo prompt cho giáo án, bài thuyết trình, đánh giá và tài liệu giảng dạy tuân thủ GDPT 2018 và CV 5512
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Side - Input Form */}
                    <div className="space-y-6">
                        {/* Basic Information Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">
                                    {formData.outputType === 'lesson-plan' ? '📚' :
                                        formData.outputType === 'presentation' ? '📊' :
                                            formData.outputType === 'assessment' ? '📝' : '📋'}
                                </span>
                                Thông tin {formData.outputType === 'lesson-plan' ? 'giáo án' :
                                    formData.outputType === 'presentation' ? 'thuyết trình' :
                                        formData.outputType === 'assessment' ? 'đánh giá' : 'nội dung'}
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

                                {/* Output Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Loại đầu ra
                                    </label>
                                    <select
                                        value={formData.outputType}
                                        onChange={(e) => handleInputChange('outputType', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="lesson-plan">📚 Giáo án</option>
                                        <option value="presentation">📊 Bài thuyết trình</option>
                                        <option value="assessment">📝 Đánh giá/Kiểm tra</option>
                                        <option value="interactive">🎮 Hoạt động tương tác</option>
                                        <option value="research">🔬 Nghiên cứu</option>
                                    </select>
                                </div>

                                {/* Lesson Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Chủ đề {formData.outputType === 'lesson-plan' ? 'giáo án' :
                                            formData.outputType === 'presentation' ? 'thuyết trình' :
                                                formData.outputType === 'assessment' ? 'đánh giá' : 'nội dung'} *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.lessonName}
                                        onChange={(e) => handleInputChange('lessonName', e.target.value)}
                                        placeholder={
                                            formData.outputType === 'lesson-plan' ? "Ví dụ: Phương trình bậc nhất một ẩn" :
                                                formData.outputType === 'presentation' ? "Ví dụ: Giới thiệu về hình học" :
                                                    formData.outputType === 'assessment' ? "Ví dụ: Kiểm tra chương 1 - Đại số" :
                                                        "Ví dụ: Chủ đề cần tạo nội dung"
                                        }
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Objectives */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mục tiêu {formData.outputType === 'lesson-plan' ? 'bài học' :
                                            formData.outputType === 'presentation' ? 'thuyết trình' :
                                                formData.outputType === 'assessment' ? 'đánh giá' : 'nội dung'}
                                    </label>
                                    <textarea
                                        value={formData.objectives}
                                        onChange={(e) => handleInputChange('objectives', e.target.value)}
                                        placeholder={
                                            formData.outputType === 'lesson-plan' ? "Mục tiêu kiến thức, kỹ năng, thái độ cần đạt được..." :
                                                formData.outputType === 'presentation' ? "Mục tiêu truyền đạt thông tin, tương tác với khán giả..." :
                                                    formData.outputType === 'assessment' ? "Mục tiêu đánh giá kiến thức, kỹ năng của học sinh..." :
                                                        "Mục tiêu cần đạt được..."
                                        }
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
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

                                    {/* Template Actions */}
                                    <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                                        <div className="flex space-x-4">
                                            <button
                                                onClick={() => setShowTemplateBrowser(true)}
                                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                            >
                                                <span className="mr-1">🔍</span>
                                                Duyệt templates
                                            </button>
                                            <a
                                                href="/templates"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
                                            >
                                                <span className="mr-1">🌐</span>
                                                Quản lý templates
                                            </a>
                                        </div>

                                        {selectedTemplate && (
                                            <button
                                                onClick={() => setSelectedTemplate(null)}
                                                className="text-sm text-gray-600 hover:text-red-600 flex items-center"
                                            >
                                                <span className="mr-1">✕</span>
                                                Bỏ chọn template
                                            </button>
                                        )}
                                    </div>
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
                                                Đang tạo prompt giáo trình...
                                            </span>
                                        ) : (
                                            '📚 Tạo Prompt Giáo Trình'
                                        )}
                                    </button>
                                    {useTemplate && !selectedTemplate && (
                                        <p className="text-sm text-gray-500 text-center mt-2">
                                            Chọn template ở trên hoặc tạo prompt giáo trình tự do
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

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={handleCopyPrompt}
                                            className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                                        >
                                            <span className="mr-1">📋</span>
                                            Sao chép
                                        </button>
                                        <button
                                            onClick={handleSaveToPersonalLibrary}
                                            className="flex items-center px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-sm"
                                        >
                                            <span className="mr-1">💾</span>
                                            Lưu cá nhân
                                        </button>
                                        <button
                                            onClick={handleShareToCommunity}
                                            className="flex items-center px-3 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-sm"
                                        >
                                            <span className="mr-1">🌍</span>
                                            Chia sẻ cộng đồng
                                        </button>
                                    </div>
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
                                            : 'Điền thông tin giáo trình và nhấn "Tạo Prompt" để bắt đầu'
                                        }
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* AI Tool Recommendations */}
                        {formData.subject && formData.grade >= 6 && formData.grade <= 9 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    📚 Công cụ AI đề xuất cho tạo giáo trình
                                </h3>
                                <AIToolSelector
                                    subject={formData.subject}
                                    gradeLevel={formData.grade as 6 | 7 | 8 | 9}
                                    outputType="lesson-plan"
                                    onToolSelect={handleAIToolSelect}
                                    selectedTool={selectedAITool}
                                />
                            </div>
                        )}

                        {/* Tips and Usage Guide */}
                        {generatedPrompt && (
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <span className="mr-2">💡</span>
                                    Mẹo tạo giáo trình hiệu quả
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <h4 className="font-medium text-gray-800 mb-2">📚 Tối ưu nội dung</h4>
                                        <ul className="text-gray-700 space-y-1">
                                            <li>• Yêu cầu "Thêm bài tập thực hành" để tăng tính ứng dụng</li>
                                            <li>• Nói "Bổ sung ví dụ Việt Nam" để gần gũi hơn</li>
                                            <li>• Thêm "Tạo sơ đồ tư duy" để dễ hiểu</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-800 mb-2">🔄 Sau khi tạo</h4>
                                        <ul className="text-gray-700 space-y-1">
                                            <li>• Lưu vào thư viện để phát triển thành bộ giáo trình</li>
                                            <li>• Chia sẻ với cộng đồng để cùng hoàn thiện</li>
                                            <li>• Sử dụng với AI tool để tạo nội dung chi tiết</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}


                    </div>
                </div>
            </div>

            {/* Template Browser Modal */}
            {showTemplateBrowser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Chọn Template
                            </h3>
                            <button
                                onClick={() => setShowTemplateBrowser(false)}
                                className="text-gray-400 hover:text-gray-600 text-xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
                            <TemplateBrowser
                                subject={formData.subject}
                                gradeLevel={formData.grade}
                                outputType={formData.outputType}
                                onSelectTemplate={handleTemplateBrowserSelect}
                                selectedTemplateId={selectedTemplate?.id}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}