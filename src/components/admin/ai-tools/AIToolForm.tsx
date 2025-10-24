'use client';

import React, { useState, useEffect } from 'react';
import { AIToolData } from '@/lib/admin/repositories/ai-tools-repository';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { X, Plus, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import HelpTooltip, { AdminHelpTooltips } from '../help/HelpTooltip';

interface AIToolFormProps {
    tool?: AIToolData;
    onSave: (tool: AIToolData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

const CATEGORIES = [
    { value: 'TEXT_GENERATION', label: 'Tạo văn bản' },
    { value: 'PRESENTATION', label: 'Thuyết trình' },
    { value: 'IMAGE', label: 'Hình ảnh' },
    { value: 'VIDEO', label: 'Video' },
    { value: 'SIMULATION', label: 'Mô phỏng' },
    { value: 'ASSESSMENT', label: 'Đánh giá' },
    { value: 'DATA_ANALYSIS', label: 'Phân tích dữ liệu' }
];

const SUBJECTS = [
    'Toán',
    'Văn',
    'Khoa học tự nhiên',
    'Lịch sử & Địa lí',
    'Giáo dục công dân',
    'Công nghệ'
];

const DIFFICULTIES = [
    { value: 'beginner', label: 'Cơ bản' },
    { value: 'intermediate', label: 'Trung bình' },
    { value: 'advanced', label: 'Nâng cao' }
];

const PRICING_MODELS = [
    { value: 'free', label: 'Miễn phí' },
    { value: 'freemium', label: 'Freemium' },
    { value: 'paid', label: 'Trả phí' }
];

const GRADE_LEVELS = [6, 7, 8, 9];

export default function AIToolForm({ tool, onSave, onCancel, loading = false }: AIToolFormProps) {
    const [formData, setFormData] = useState<AIToolData>({
        name: '',
        description: '',
        url: '',
        category: 'TEXT_GENERATION',
        subjects: [],
        gradeLevel: [],
        useCase: '',
        vietnameseSupport: false,
        difficulty: 'beginner',
        features: [],
        pricingModel: 'free',
        integrationInstructions: '',
        samplePrompts: [],
        relatedTools: []
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [newFeature, setNewFeature] = useState('');
    const [newSamplePrompt, setNewSamplePrompt] = useState('');
    const [newRelatedTool, setNewRelatedTool] = useState('');

    // Initialize form with tool data if editing
    useEffect(() => {
        if (tool) {
            setFormData({
                ...tool,
                subjects: tool.subjects || [],
                gradeLevel: tool.gradeLevel || [],
                features: tool.features || [],
                samplePrompts: tool.samplePrompts || [],
                relatedTools: tool.relatedTools || []
            });
        }
    }, [tool]);

    // Handle input changes
    const handleInputChange = (field: keyof AIToolData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // Handle subject selection
    const handleSubjectToggle = (subject: string) => {
        const newSubjects = formData.subjects.includes(subject)
            ? formData.subjects.filter(s => s !== subject)
            : [...formData.subjects, subject];
        handleInputChange('subjects', newSubjects);
    };

    // Handle grade level selection
    const handleGradeLevelToggle = (grade: number) => {
        const newGradeLevels = formData.gradeLevel.includes(grade)
            ? formData.gradeLevel.filter(g => g !== grade)
            : [...formData.gradeLevel, grade];
        handleInputChange('gradeLevel', newGradeLevels);
    };

    // Add feature
    const addFeature = () => {
        if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
            handleInputChange('features', [...formData.features, newFeature.trim()]);
            setNewFeature('');
        }
    };

    // Remove feature
    const removeFeature = (feature: string) => {
        handleInputChange('features', formData.features.filter(f => f !== feature));
    };

    // Add sample prompt
    const addSamplePrompt = () => {
        const samplePrompts = formData.samplePrompts || [];
        if (newSamplePrompt.trim() && !samplePrompts.includes(newSamplePrompt.trim())) {
            handleInputChange('samplePrompts', [...samplePrompts, newSamplePrompt.trim()]);
            setNewSamplePrompt('');
        }
    };

    // Remove sample prompt
    const removeSamplePrompt = (prompt: string) => {
        const samplePrompts = formData.samplePrompts || [];
        handleInputChange('samplePrompts', samplePrompts.filter(p => p !== prompt));
    };

    // Add related tool
    const addRelatedTool = () => {
        const relatedTools = formData.relatedTools || [];
        if (newRelatedTool.trim() && !relatedTools.includes(newRelatedTool.trim())) {
            handleInputChange('relatedTools', [...relatedTools, newRelatedTool.trim()]);
            setNewRelatedTool('');
        }
    };

    // Remove related tool
    const removeRelatedTool = (toolId: string) => {
        const relatedTools = formData.relatedTools || [];
        handleInputChange('relatedTools', relatedTools.filter(t => t !== toolId));
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Tên công cụ không được để trống';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Mô tả không được để trống';
        } else if (formData.description.length < 10) {
            newErrors.description = 'Mô tả phải có ít nhất 10 ký tự';
        }

        if (!formData.url.trim()) {
            newErrors.url = 'URL không được để trống';
        } else if (!formData.url.startsWith('https://')) {
            newErrors.url = 'URL phải bắt đầu bằng https://';
        }

        if (formData.subjects.length === 0) {
            newErrors.subjects = 'Phải chọn ít nhất một môn học';
        }

        if (formData.gradeLevel.length === 0) {
            newErrors.gradeLevel = 'Phải chọn ít nhất một lớp';
        }

        if (!formData.useCase.trim()) {
            newErrors.useCase = 'Trường hợp sử dụng không được để trống';
        } else if (formData.useCase.length < 10) {
            newErrors.useCase = 'Trường hợp sử dụng phải có ít nhất 10 ký tự';
        }

        if (formData.features.length === 0) {
            newErrors.features = 'Phải có ít nhất một tính năng';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin đã nhập');
            return;
        }

        try {
            await onSave(formData);
        } catch (error) {
            console.error('Error saving AI tool:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={onCancel} disabled={loading}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {tool ? 'Chỉnh sửa AI Tool' : 'Thêm AI Tool mới'}
                        </h1>
                        <p className="text-gray-600">
                            {tool ? `Chỉnh sửa thông tin công cụ ${tool.name}` : 'Thêm công cụ AI mới vào hệ thống'}
                        </p>
                    </div>
                </div>
                <Button onClick={handleSubmit} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Đang lưu...' : 'Lưu'}
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin cơ bản</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">Tên công cụ *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="Ví dụ: ChatGPT"
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="url">URL *</Label>
                                <Input
                                    id="url"
                                    value={formData.url}
                                    onChange={(e) => handleInputChange('url', e.target.value)}
                                    placeholder="https://example.com"
                                    className={errors.url ? 'border-red-500' : ''}
                                />
                                {errors.url && (
                                    <p className="text-sm text-red-600 mt-1">{errors.url}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description">Mô tả *</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                                placeholder="Mô tả chi tiết về công cụ AI..."
                                rows={3}
                                className={errors.description ? 'border-red-500' : ''}
                            />
                            {errors.description && (
                                <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="useCase">Trường hợp sử dụng *</Label>
                            <Textarea
                                id="useCase"
                                value={formData.useCase}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('useCase', e.target.value)}
                                placeholder="Mô tả cách sử dụng công cụ trong giáo dục..."
                                rows={2}
                                className={errors.useCase ? 'border-red-500' : ''}
                            />
                            {errors.useCase && (
                                <p className="text-sm text-red-600 mt-1">{errors.useCase}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Categorization */}
                <Card>
                    <CardHeader>
                        <CardTitle>Phân loại</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <div className="flex items-center space-x-2 mb-2">
                                    <Label>Danh mục *</Label>
                                    <HelpTooltip
                                        title={AdminHelpTooltips.aiToolCategory.title}
                                        content={AdminHelpTooltips.aiToolCategory.content}
                                        size="lg"
                                    />
                                </div>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => handleInputChange('category', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map(category => (
                                            <SelectItem key={category.value} value={category.value}>
                                                {category.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <div className="flex items-center space-x-2 mb-2">
                                    <Label>Độ khó</Label>
                                    <HelpTooltip
                                        title={AdminHelpTooltips.aiToolDifficulty.title}
                                        content={AdminHelpTooltips.aiToolDifficulty.content}
                                    />
                                </div>
                                <Select
                                    value={formData.difficulty}
                                    onValueChange={(value) => handleInputChange('difficulty', value)}
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

                            <div>
                                <Label>Mô hình giá</Label>
                                <Select
                                    value={formData.pricingModel}
                                    onValueChange={(value) => handleInputChange('pricingModel', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PRICING_MODELS.map(pricing => (
                                            <SelectItem key={pricing.value} value={pricing.value}>
                                                {pricing.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label>Môn học * {errors.subjects && <span className="text-red-600 text-sm">({errors.subjects})</span>}</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                {SUBJECTS.map(subject => (
                                    <div key={subject} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`subject-${subject}`}
                                            checked={formData.subjects.includes(subject)}
                                            onCheckedChange={() => handleSubjectToggle(subject)}
                                        />
                                        <Label htmlFor={`subject-${subject}`} className="text-sm">
                                            {subject}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label>Lớp học * {errors.gradeLevel && <span className="text-red-600 text-sm">({errors.gradeLevel})</span>}</Label>
                            <div className="flex gap-2 mt-2">
                                {GRADE_LEVELS.map(grade => (
                                    <div key={grade} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`grade-${grade}`}
                                            checked={formData.gradeLevel.includes(grade)}
                                            onCheckedChange={() => handleGradeLevelToggle(grade)}
                                        />
                                        <Label htmlFor={`grade-${grade}`} className="text-sm">
                                            Lớp {grade}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="vietnameseSupport"
                                checked={formData.vietnameseSupport}
                                onCheckedChange={(checked) => handleInputChange('vietnameseSupport', checked)}
                            />
                            <Label htmlFor="vietnameseSupport">
                                Hỗ trợ tiếng Việt
                            </Label>
                        </div>
                    </CardContent>
                </Card>

                {/* Features */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tính năng * {errors.features && <span className="text-red-600 text-sm">({errors.features})</span>}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                placeholder="Thêm tính năng mới..."
                                onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                            />
                            <Button type="button" onClick={addFeature} disabled={!newFeature.trim()}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.features.map((feature, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                    {feature}
                                    <button
                                        type="button"
                                        onClick={() => removeFeature(feature)}
                                        className="ml-1 hover:text-red-600"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Integration Instructions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hướng dẫn tích hợp</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={formData.integrationInstructions || ''}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('integrationInstructions', e.target.value)}
                            placeholder="Hướng dẫn cách sử dụng công cụ..."
                            rows={3}
                        />
                    </CardContent>
                </Card>

                {/* Sample Prompts */}
                <Card>
                    <CardHeader>
                        <CardTitle>Prompt mẫu</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                value={newSamplePrompt}
                                onChange={(e) => setNewSamplePrompt(e.target.value)}
                                placeholder="Thêm prompt mẫu..."
                                onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && (e.preventDefault(), addSamplePrompt())}
                            />
                            <Button type="button" onClick={addSamplePrompt} disabled={!newSamplePrompt.trim()}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {(formData.samplePrompts || []).map((prompt, index) => (
                                <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                                    <span className="flex-1 text-sm">{prompt}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeSamplePrompt(prompt)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Related Tools */}
                <Card>
                    <CardHeader>
                        <CardTitle>Công cụ liên quan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                value={newRelatedTool}
                                onChange={(e) => setNewRelatedTool(e.target.value)}
                                placeholder="ID công cụ liên quan..."
                                onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && (e.preventDefault(), addRelatedTool())}
                            />
                            <Button type="button" onClick={addRelatedTool} disabled={!newRelatedTool.trim()}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(formData.relatedTools || []).map((toolId, index) => (
                                <Badge key={index} variant="outline" className="flex items-center gap-1">
                                    {toolId}
                                    <button
                                        type="button"
                                        onClick={() => removeRelatedTool(toolId)}
                                        className="ml-1 hover:text-red-600"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                        Hủy
                    </Button>
                    <Button type="submit" disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Đang lưu...' : (tool ? 'Cập nhật' : 'Tạo mới')}
                    </Button>
                </div>
            </form>
        </div>
    );
}