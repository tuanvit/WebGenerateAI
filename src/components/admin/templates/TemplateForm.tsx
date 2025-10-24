'use client';

import React, { useState, useEffect } from 'react';
import { TemplateData, TemplateVariableData, TemplateExampleData } from '@/lib/admin/repositories/templates-repository';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Plus,
    Trash2,
    Eye,
    Save,
    X,
    FileText,
    Settings,
    TestTube,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface TemplateFormProps {
    template?: TemplateData;
    onSave: (template: TemplateData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

const SUBJECTS = [
    'Toán',
    'Văn',
    'Khoa học tự nhiên',
    'Lịch sử & Địa lí',
    'Giáo dục công dân',
    'Công nghệ'
];

const OUTPUT_TYPES = [
    { value: 'lesson-plan', label: 'Giáo án' },
    { value: 'presentation', label: 'Bài thuyết trình' },
    { value: 'assessment', label: 'Đánh giá' },
    { value: 'interactive', label: 'Tương tác' },
    { value: 'research', label: 'Nghiên cứu' }
];

const DIFFICULTIES = [
    { value: 'beginner', label: 'Cơ bản' },
    { value: 'intermediate', label: 'Trung bình' },
    { value: 'advanced', label: 'Nâng cao' }
];

const VARIABLE_TYPES = [
    { value: 'text', label: 'Văn bản' },
    { value: 'textarea', label: 'Văn bản dài' },
    { value: 'select', label: 'Lựa chọn' },
    { value: 'multiselect', label: 'Đa lựa chọn' }
];

const COMPLIANCE_OPTIONS = [
    'GDPT 2018',
    'CV 5512',
    'Chuẩn năng lực Toán học',
    'Chuẩn năng lực Ngữ văn',
    'Chuẩn năng lực KHTN'
];

export default function TemplateForm({
    template,
    onSave,
    onCancel,
    loading = false
}: TemplateFormProps) {
    const [formData, setFormData] = useState<TemplateData>({
        name: '',
        description: '',
        subject: '',
        gradeLevel: [],
        outputType: 'lesson-plan',
        templateContent: '',
        recommendedTools: [],
        tags: [],
        difficulty: 'beginner',
        compliance: [],
        variables: [],
        examples: []
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab] = useState('basic');
    const [previewMode, setPreviewMode] = useState(false);
    const [previewVariables, setPreviewVariables] = useState<Record<string, string>>({});

    // Initialize form data
    useEffect(() => {
        if (template) {
            setFormData({
                ...template,
                variables: template.variables || [],
                examples: template.examples || []
            });

            // Initialize preview variables with default values
            const defaultVars: Record<string, string> = {};
            template.variables?.forEach(variable => {
                defaultVars[variable.name] = variable.defaultValue || '';
            });
            setPreviewVariables(defaultVars);
        }
    }, [template]);

    // Handle basic field changes
    const handleFieldChange = (field: keyof TemplateData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Handle grade level changes
    const handleGradeLevelChange = (grade: number, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            gradeLevel: checked
                ? [...prev.gradeLevel, grade].sort()
                : prev.gradeLevel.filter(g => g !== grade)
        }));
    };

    // Handle compliance changes
    const handleComplianceChange = (compliance: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            compliance: checked
                ? [...(prev.compliance || []), compliance]
                : (prev.compliance || []).filter(c => c !== compliance)
        }));
    };

    // Handle tags input
    const handleTagsChange = (tagsString: string) => {
        const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        setFormData(prev => ({ ...prev, tags }));
    };

    // Handle recommended tools input
    const handleRecommendedToolsChange = (toolsString: string) => {
        const tools = toolsString.split(',').map(tool => tool.trim()).filter(tool => tool.length > 0);
        setFormData(prev => ({ ...prev, recommendedTools: tools }));
    };

    // Add new variable
    const addVariable = () => {
        const newVariable: TemplateVariableData = {
            name: '',
            label: '',
            description: '',
            type: 'text',
            required: false,
            placeholder: '',
            options: [],
            defaultValue: ''
        };

        setFormData(prev => ({
            ...prev,
            variables: [...(prev.variables || []), newVariable]
        }));
    };

    // Update variable
    const updateVariable = (index: number, field: keyof TemplateVariableData, value: any) => {
        setFormData(prev => ({
            ...prev,
            variables: prev.variables?.map((variable, i) =>
                i === index ? { ...variable, [field]: value } : variable
            ) || []
        }));
    };

    // Remove variable
    const removeVariable = (index: number) => {
        setFormData(prev => ({
            ...prev,
            variables: prev.variables?.filter((_, i) => i !== index) || []
        }));
    };

    // Add new example
    const addExample = () => {
        const newExample: TemplateExampleData = {
            title: '',
            description: '',
            sampleInput: {},
            expectedOutput: ''
        };

        setFormData(prev => ({
            ...prev,
            examples: [...(prev.examples || []), newExample]
        }));
    };

    // Update example
    const updateExample = (index: number, field: keyof TemplateExampleData, value: any) => {
        setFormData(prev => ({
            ...prev,
            examples: prev.examples?.map((example, i) =>
                i === index ? { ...example, [field]: value } : example
            ) || []
        }));
    };

    // Remove example
    const removeExample = (index: number) => {
        setFormData(prev => ({
            ...prev,
            examples: prev.examples?.filter((_, i) => i !== index) || []
        }));
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Tên template là bắt buộc';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Mô tả là bắt buộc';
        }

        if (!formData.subject) {
            newErrors.subject = 'Môn học là bắt buộc';
        }

        if (formData.gradeLevel.length === 0) {
            newErrors.gradeLevel = 'Phải chọn ít nhất một lớp';
        }

        if (!formData.templateContent.trim()) {
            newErrors.templateContent = 'Nội dung template là bắt buộc';
        }

        // Validate variables
        formData.variables?.forEach((variable, index) => {
            if (!variable.name.trim()) {
                newErrors[`variable_${index}_name`] = 'Tên biến là bắt buộc';
            }
            if (!variable.label.trim()) {
                newErrors[`variable_${index}_label`] = 'Nhãn biến là bắt buộc';
            }
        });

        // Validate examples
        formData.examples?.forEach((example, index) => {
            if (!example.title.trim()) {
                newErrors[`example_${index}_title`] = 'Tiêu đề ví dụ là bắt buộc';
            }
            if (!example.expectedOutput.trim()) {
                newErrors[`example_${index}_output`] = 'Kết quả mong đợi là bắt buộc';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin nhập vào');
            return;
        }

        try {
            await onSave(formData);
        } catch (error) {
            // Error handling is done in parent component
        }
    };

    // Render template preview
    const renderPreview = () => {
        let preview = formData.templateContent;

        // Replace variables with preview values
        Object.entries(previewVariables).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            preview = preview.replace(regex, value || `[${key}]`);
        });

        return preview;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                    {template ? 'Chỉnh sửa Template' : 'Tạo Template mới'}
                </h2>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setPreviewMode(!previewMode)}
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        {previewMode ? 'Chỉnh sửa' : 'Xem trước'}
                    </Button>
                    <Button type="button" variant="outline" onClick={onCancel}>
                        <X className="h-4 w-4 mr-2" />
                        Hủy
                    </Button>
                </div>
            </div>

            {previewMode ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Xem trước Template</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Preview variables input */}
                        {formData.variables && formData.variables.length > 0 && (
                            <div className="space-y-4">
                                <h4 className="font-medium">Nhập giá trị cho các biến:</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {formData.variables.map((variable, index) => (
                                        <div key={index}>
                                            <Label>{variable.label}</Label>
                                            <Input
                                                value={previewVariables[variable.name] || ''}
                                                onChange={(e) => setPreviewVariables(prev => ({
                                                    ...prev,
                                                    [variable.name]: e.target.value
                                                }))}
                                                placeholder={variable.placeholder}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Preview content */}
                        <div>
                            <h4 className="font-medium mb-2">Kết quả:</h4>
                            <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                                {renderPreview()}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <form onSubmit={handleSubmit}>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="basic">
                                <FileText className="h-4 w-4 mr-2" />
                                Thông tin cơ bản
                            </TabsTrigger>
                            <TabsTrigger value="content">
                                <Settings className="h-4 w-4 mr-2" />
                                Nội dung
                            </TabsTrigger>
                            <TabsTrigger value="variables">
                                <Settings className="h-4 w-4 mr-2" />
                                Biến
                            </TabsTrigger>
                            <TabsTrigger value="examples">
                                <TestTube className="h-4 w-4 mr-2" />
                                Ví dụ
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Thông tin cơ bản</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="name">Tên template *</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => handleFieldChange('name', e.target.value)}
                                                placeholder="Nhập tên template"
                                                className={errors.name ? 'border-red-500' : ''}
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="subject">Môn học *</Label>
                                            <Select
                                                value={formData.subject}
                                                onValueChange={(value) => handleFieldChange('subject', value)}
                                            >
                                                <SelectTrigger className={errors.subject ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Chọn môn học" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {SUBJECTS.map(subject => (
                                                        <SelectItem key={subject} value={subject}>
                                                            {subject}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.subject && (
                                                <p className="text-sm text-red-600 mt-1">{errors.subject}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Mô tả *</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => handleFieldChange('description', e.target.value)}
                                            placeholder="Mô tả template"
                                            rows={3}
                                            className={errors.description ? 'border-red-500' : ''}
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="outputType">Loại đầu ra</Label>
                                            <Select
                                                value={formData.outputType}
                                                onValueChange={(value) => handleFieldChange('outputType', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {OUTPUT_TYPES.map(type => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="difficulty">Độ khó</Label>
                                            <Select
                                                value={formData.difficulty}
                                                onValueChange={(value) => handleFieldChange('difficulty', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {DIFFICULTIES.map(difficulty => (
                                                        <SelectItem key={difficulty.value} value={difficulty.value}>
                                                            {difficulty.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Lớp học *</Label>
                                        <div className="flex flex-wrap gap-4 mt-2">
                                            {[6, 7, 8, 9].map(grade => (
                                                <div key={grade} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`grade-${grade}`}
                                                        checked={formData.gradeLevel.includes(grade)}
                                                        onCheckedChange={(checked) => handleGradeLevelChange(grade, checked as boolean)}
                                                    />
                                                    <Label htmlFor={`grade-${grade}`}>Lớp {grade}</Label>
                                                </div>
                                            ))}
                                        </div>
                                        {errors.gradeLevel && (
                                            <p className="text-sm text-red-600 mt-1">{errors.gradeLevel}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</Label>
                                        <Input
                                            id="tags"
                                            value={formData.tags?.join(', ') || ''}
                                            onChange={(e) => handleTagsChange(e.target.value)}
                                            placeholder="tag1, tag2, tag3"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="recommendedTools">Công cụ AI khuyến nghị (phân cách bằng dấu phẩy)</Label>
                                        <Input
                                            id="recommendedTools"
                                            value={formData.recommendedTools?.join(', ') || ''}
                                            onChange={(e) => handleRecommendedToolsChange(e.target.value)}
                                            placeholder="ChatGPT, Gemini, Copilot"
                                        />
                                    </div>

                                    <div>
                                        <Label>Tiêu chuẩn tuân thủ</Label>
                                        <div className="flex flex-wrap gap-4 mt-2">
                                            {COMPLIANCE_OPTIONS.map(compliance => (
                                                <div key={compliance} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`compliance-${compliance}`}
                                                        checked={formData.compliance?.includes(compliance) || false}
                                                        onCheckedChange={(checked) => handleComplianceChange(compliance, checked as boolean)}
                                                    />
                                                    <Label htmlFor={`compliance-${compliance}`}>{compliance}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="content" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Nội dung Template</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div>
                                        <Label htmlFor="templateContent">Nội dung template *</Label>
                                        <p className="text-sm text-gray-600 mb-2">
                                            Nội dung phải có ít nhất 50 ký tự. Sử dụng {`{{tên_biến}}`} để đánh dấu các biến.
                                        </p>
                                        <div className="mt-2">
                                            <Textarea
                                                id="templateContent"
                                                value={formData.templateContent}
                                                onChange={(e) => handleFieldChange('templateContent', e.target.value)}
                                                placeholder="Nhập nội dung template. Ví dụ: Tạo bài giảng về {{chu_de}} cho lớp {{lop}}..."
                                                rows={15}
                                                className={`font-mono ${errors.templateContent ? 'border-red-500' : ''}`}
                                            />
                                            <div className="flex justify-between items-center mt-1">
                                                <div>
                                                    {errors.templateContent && (
                                                        <p className="text-sm text-red-600">{errors.templateContent}</p>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    {formData.templateContent.length}/50 ký tự tối thiểu
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-600">
                                            <AlertCircle className="h-4 w-4 inline mr-1" />
                                            Sử dụng cú pháp {`{{tên_biến}}`} để đánh dấu các biến trong template.
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="variables" className="space-y-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Biến Template</CardTitle>
                                    <Button type="button" onClick={addVariable} size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Thêm biến
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {formData.variables && formData.variables.length > 0 ? (
                                        <div className="space-y-4">
                                            {formData.variables.map((variable, index) => (
                                                <div key={index} className="border rounded-lg p-4 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-medium">Biến #{index + 1}</h4>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeVariable(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <Label>Tên biến *</Label>
                                                            <p className="text-xs text-gray-600 mb-1">
                                                                Bắt đầu bằng chữ cái, chỉ chứa chữ cái, số và dấu gạch dưới
                                                            </p>
                                                            <Input
                                                                value={variable.name}
                                                                onChange={(e) => updateVariable(index, 'name', e.target.value)}
                                                                placeholder="chu_de, lop_hoc, mon_hoc"
                                                                className={errors[`variable_${index}_name`] ? 'border-red-500' : ''}
                                                            />
                                                            {errors[`variable_${index}_name`] && (
                                                                <p className="text-sm text-red-600 mt-1">{errors[`variable_${index}_name`]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <Label>Nhãn hiển thị *</Label>
                                                            <Input
                                                                value={variable.label}
                                                                onChange={(e) => updateVariable(index, 'label', e.target.value)}
                                                                placeholder="Tên biến"
                                                                className={errors[`variable_${index}_label`] ? 'border-red-500' : ''}
                                                            />
                                                            {errors[`variable_${index}_label`] && (
                                                                <p className="text-sm text-red-600 mt-1">{errors[`variable_${index}_label`]}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <Label>Mô tả</Label>
                                                        <Input
                                                            value={variable.description || ''}
                                                            onChange={(e) => updateVariable(index, 'description', e.target.value)}
                                                            placeholder="Mô tả biến"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <Label>Loại biến</Label>
                                                            <Select
                                                                value={variable.type}
                                                                onValueChange={(value) => updateVariable(index, 'type', value)}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {VARIABLE_TYPES.map(type => (
                                                                        <SelectItem key={type.value} value={type.value}>
                                                                            {type.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div>
                                                            <Label>Giá trị mặc định</Label>
                                                            <Input
                                                                value={variable.defaultValue || ''}
                                                                onChange={(e) => updateVariable(index, 'defaultValue', e.target.value)}
                                                                placeholder="Giá trị mặc định"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <Label>Placeholder</Label>
                                                        <Input
                                                            value={variable.placeholder || ''}
                                                            onChange={(e) => updateVariable(index, 'placeholder', e.target.value)}
                                                            placeholder="Nhập placeholder"
                                                        />
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`required-${index}`}
                                                            checked={variable.required}
                                                            onCheckedChange={(checked) => updateVariable(index, 'required', checked)}
                                                        />
                                                        <Label htmlFor={`required-${index}`}>Bắt buộc</Label>
                                                    </div>

                                                    {(variable.type === 'select' || variable.type === 'multiselect') && (
                                                        <div>
                                                            <Label>Tùy chọn (mỗi dòng một tùy chọn)</Label>
                                                            <Textarea
                                                                value={variable.options?.join('\n') || ''}
                                                                onChange={(e) => updateVariable(index, 'options', e.target.value.split('\n').filter(opt => opt.trim()))}
                                                                placeholder="Tùy chọn 1&#10;Tùy chọn 2&#10;Tùy chọn 3"
                                                                rows={3}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            Chưa có biến nào. Nhấn "Thêm biến" để tạo biến mới.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="examples" className="space-y-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Ví dụ Template</CardTitle>
                                    <Button type="button" onClick={addExample} size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Thêm ví dụ
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {formData.examples && formData.examples.length > 0 ? (
                                        <div className="space-y-6">
                                            {formData.examples.map((example, index) => (
                                                <div key={index} className="border rounded-lg p-4 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-medium">Ví dụ #{index + 1}</h4>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeExample(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    <div>
                                                        <Label>Tiêu đề *</Label>
                                                        <Input
                                                            value={example.title}
                                                            onChange={(e) => updateExample(index, 'title', e.target.value)}
                                                            placeholder="Tiêu đề ví dụ"
                                                            className={errors[`example_${index}_title`] ? 'border-red-500' : ''}
                                                        />
                                                        {errors[`example_${index}_title`] && (
                                                            <p className="text-sm text-red-600 mt-1">{errors[`example_${index}_title`]}</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <Label>Mô tả</Label>
                                                        <Input
                                                            value={example.description}
                                                            onChange={(e) => updateExample(index, 'description', e.target.value)}
                                                            placeholder="Mô tả ví dụ"
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label>Dữ liệu mẫu (JSON)</Label>
                                                        <Textarea
                                                            value={JSON.stringify(example.sampleInput, null, 2)}
                                                            onChange={(e) => {
                                                                try {
                                                                    const parsed = JSON.parse(e.target.value);
                                                                    updateExample(index, 'sampleInput', parsed);
                                                                } catch {
                                                                    // Invalid JSON, keep the text for user to fix
                                                                }
                                                            }}
                                                            placeholder='{"bien1": "gia_tri1", "bien2": "gia_tri2"}'
                                                            rows={4}
                                                            className="font-mono"
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label>Kết quả mong đợi *</Label>
                                                        <Textarea
                                                            value={example.expectedOutput}
                                                            onChange={(e) => updateExample(index, 'expectedOutput', e.target.value)}
                                                            placeholder="Kết quả sau khi thay thế biến"
                                                            rows={6}
                                                            className={errors[`example_${index}_output`] ? 'border-red-500' : ''}
                                                        />
                                                        {errors[`example_${index}_output`] && (
                                                            <p className="text-sm text-red-600 mt-1">{errors[`example_${index}_output`]}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            Chưa có ví dụ nào. Nhấn "Thêm ví dụ" để tạo ví dụ mới.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end gap-4 pt-6">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    {template ? 'Cập nhật' : 'Tạo mới'}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}