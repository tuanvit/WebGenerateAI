'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { X, Save } from 'lucide-react';

interface BulkEditModalProps {
    isOpen: boolean;
    selectedCount: number;
    onSave: (updates: BulkUpdateData) => Promise<void>;
    onClose: () => void;
    loading?: boolean;
}

interface BulkUpdateData {
    category?: string;
    subjects?: string[];
    gradeLevel?: number[];
    vietnameseSupport?: boolean;
    difficulty?: string;
    pricingModel?: string;
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

export default function BulkEditModal({
    isOpen,
    selectedCount,
    onSave,
    onClose,
    loading = false
}: BulkEditModalProps) {
    const [updates, setUpdates] = useState<BulkUpdateData>({});
    const [enabledFields, setEnabledFields] = useState<Record<string, boolean>>({});

    if (!isOpen) return null;

    // Handle field enable/disable
    const handleFieldToggle = (field: string, enabled: boolean) => {
        setEnabledFields(prev => ({ ...prev, [field]: enabled }));
        if (!enabled) {
            // Remove the field from updates when disabled
            const newUpdates = { ...updates };
            delete newUpdates[field as keyof BulkUpdateData];
            setUpdates(newUpdates);
        }
    };

    // Handle value changes
    const handleValueChange = (field: keyof BulkUpdateData, value: any) => {
        setUpdates(prev => ({ ...prev, [field]: value }));
    };

    // Handle subject selection
    const handleSubjectToggle = (subject: string) => {
        const currentSubjects = updates.subjects || [];
        const newSubjects = currentSubjects.includes(subject)
            ? currentSubjects.filter(s => s !== subject)
            : [...currentSubjects, subject];
        handleValueChange('subjects', newSubjects);
    };

    // Handle grade level selection
    const handleGradeLevelToggle = (grade: number) => {
        const currentGradeLevels = updates.gradeLevel || [];
        const newGradeLevels = currentGradeLevels.includes(grade)
            ? currentGradeLevels.filter(g => g !== grade)
            : [...currentGradeLevels, grade];
        handleValueChange('gradeLevel', newGradeLevels);
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Only include enabled fields in the update
        const finalUpdates: BulkUpdateData = {};
        Object.keys(enabledFields).forEach(field => {
            if (enabledFields[field] && updates[field as keyof BulkUpdateData] !== undefined) {
                finalUpdates[field as keyof BulkUpdateData] = updates[field as keyof BulkUpdateData];
            }
        });

        if (Object.keys(finalUpdates).length === 0) {
            return;
        }

        try {
            await onSave(finalUpdates);
            // Reset form
            setUpdates({});
            setEnabledFields({});
        } catch (error) {
            // Error handling is done in parent component
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm"
                        disabled={loading}
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Content */}
                    <div className="p-6">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa hàng loạt</h2>
                            <p className="text-gray-600 mt-1">
                                Cập nhật {selectedCount} công cụ AI đã chọn
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Category */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="enable-category"
                                            checked={enabledFields.category || false}
                                            onCheckedChange={(checked) => handleFieldToggle('category', checked as boolean)}
                                        />
                                        <Label htmlFor="enable-category" className="font-medium">
                                            Cập nhật danh mục
                                        </Label>
                                    </div>
                                </CardHeader>
                                {enabledFields.category && (
                                    <CardContent className="pt-0">
                                        <Select
                                            value={updates.category || ''}
                                            onValueChange={(value) => handleValueChange('category', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn danh mục" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CATEGORIES.map(category => (
                                                    <SelectItem key={category.value} value={category.value}>
                                                        {category.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </CardContent>
                                )}
                            </Card>

                            {/* Subjects */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="enable-subjects"
                                            checked={enabledFields.subjects || false}
                                            onCheckedChange={(checked) => handleFieldToggle('subjects', checked as boolean)}
                                        />
                                        <Label htmlFor="enable-subjects" className="font-medium">
                                            Cập nhật môn học
                                        </Label>
                                    </div>
                                </CardHeader>
                                {enabledFields.subjects && (
                                    <CardContent className="pt-0">
                                        <div className="grid grid-cols-2 gap-2">
                                            {SUBJECTS.map(subject => (
                                                <div key={subject} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`subject-${subject}`}
                                                        checked={(updates.subjects || []).includes(subject)}
                                                        onCheckedChange={() => handleSubjectToggle(subject)}
                                                    />
                                                    <Label htmlFor={`subject-${subject}`} className="text-sm">
                                                        {subject}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                )}
                            </Card>

                            {/* Grade Levels */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="enable-gradeLevel"
                                            checked={enabledFields.gradeLevel || false}
                                            onCheckedChange={(checked) => handleFieldToggle('gradeLevel', checked as boolean)}
                                        />
                                        <Label htmlFor="enable-gradeLevel" className="font-medium">
                                            Cập nhật lớp học
                                        </Label>
                                    </div>
                                </CardHeader>
                                {enabledFields.gradeLevel && (
                                    <CardContent className="pt-0">
                                        <div className="flex gap-4">
                                            {GRADE_LEVELS.map(grade => (
                                                <div key={grade} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`grade-${grade}`}
                                                        checked={(updates.gradeLevel || []).includes(grade)}
                                                        onCheckedChange={() => handleGradeLevelToggle(grade)}
                                                    />
                                                    <Label htmlFor={`grade-${grade}`} className="text-sm">
                                                        Lớp {grade}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                )}
                            </Card>

                            {/* Vietnamese Support */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="enable-vietnameseSupport"
                                            checked={enabledFields.vietnameseSupport || false}
                                            onCheckedChange={(checked) => handleFieldToggle('vietnameseSupport', checked as boolean)}
                                        />
                                        <Label htmlFor="enable-vietnameseSupport" className="font-medium">
                                            Cập nhật hỗ trợ tiếng Việt
                                        </Label>
                                    </div>
                                </CardHeader>
                                {enabledFields.vietnameseSupport && (
                                    <CardContent className="pt-0">
                                        <Select
                                            value={updates.vietnameseSupport?.toString() || ''}
                                            onValueChange={(value) => handleValueChange('vietnameseSupport', value === 'true')}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn trạng thái" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="true">Có hỗ trợ</SelectItem>
                                                <SelectItem value="false">Không hỗ trợ</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </CardContent>
                                )}
                            </Card>

                            {/* Difficulty */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="enable-difficulty"
                                            checked={enabledFields.difficulty || false}
                                            onCheckedChange={(checked) => handleFieldToggle('difficulty', checked as boolean)}
                                        />
                                        <Label htmlFor="enable-difficulty" className="font-medium">
                                            Cập nhật độ khó
                                        </Label>
                                    </div>
                                </CardHeader>
                                {enabledFields.difficulty && (
                                    <CardContent className="pt-0">
                                        <Select
                                            value={updates.difficulty || ''}
                                            onValueChange={(value) => handleValueChange('difficulty', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn độ khó" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {DIFFICULTIES.map(difficulty => (
                                                    <SelectItem key={difficulty.value} value={difficulty.value}>
                                                        {difficulty.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </CardContent>
                                )}
                            </Card>

                            {/* Pricing Model */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="enable-pricingModel"
                                            checked={enabledFields.pricingModel || false}
                                            onCheckedChange={(checked) => handleFieldToggle('pricingModel', checked as boolean)}
                                        />
                                        <Label htmlFor="enable-pricingModel" className="font-medium">
                                            Cập nhật mô hình giá
                                        </Label>
                                    </div>
                                </CardHeader>
                                {enabledFields.pricingModel && (
                                    <CardContent className="pt-0">
                                        <Select
                                            value={updates.pricingModel || ''}
                                            onValueChange={(value) => handleValueChange('pricingModel', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn mô hình giá" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PRICING_MODELS.map(pricing => (
                                                    <SelectItem key={pricing.value} value={pricing.value}>
                                                        {pricing.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </CardContent>
                                )}
                            </Card>

                            {/* Form Actions */}
                            <div className="flex justify-end gap-4 pt-6 border-t">
                                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading || Object.keys(enabledFields).filter(k => enabledFields[k]).length === 0}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}