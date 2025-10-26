'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Save, X, Edit } from 'lucide-react';

interface TemplateBulkEditModalProps {
    isOpen: boolean;
    selectedCount: number;
    onSave: (updates: any) => Promise<void>;
    onClose: () => void;
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
    { value: 'lesson-plan', label: 'Kế hoạch bài dạy' },
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

export default function TemplateBulkEditModal({
    isOpen,
    selectedCount,
    onSave,
    onClose,
    loading = false
}: TemplateBulkEditModalProps) {
    const [updates, setUpdates] = useState<any>({});
    const [enabledFields, setEnabledFields] = useState<Record<string, boolean>>({});

    // Handle field enable/disable
    const handleFieldToggle = (field: string, enabled: boolean) => {
        setEnabledFields(prev => ({ ...prev, [field]: enabled }));

        if (!enabled) {
            // Remove field from updates when disabled
            setUpdates((prev: any) => {
                const newUpdates = { ...prev };
                delete newUpdates[field];
                return newUpdates;
            });
        }
    };

    // Handle field value changes
    const handleFieldChange = (field: string, value: any) => {
        setUpdates((prev: any) => ({ ...prev, [field]: value }));
    };

    // Handle grade level changes
    const handleGradeLevelChange = (grade: number, checked: boolean) => {
        const currentGrades = updates.gradeLevel || [];
        const newGrades = checked
            ? [...currentGrades, grade].sort()
            : currentGrades.filter((g: number) => g !== grade);

        handleFieldChange('gradeLevel', newGrades);
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Only include enabled fields in updates
        const finalUpdates: any = {};
        Object.keys(enabledFields).forEach(field => {
            if (enabledFields[field] && updates[field] !== undefined) {
                finalUpdates[field] = updates[field];
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

    // Reset form when modal closes
    const handleClose = () => {
        setUpdates({});
        setEnabledFields({});
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Edit className="h-5 w-5" />
                        Chỉnh sửa hàng loạt ({selectedCount} template)
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 p-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            Chọn các trường bạn muốn cập nhật cho {selectedCount} template đã chọn.
                            Chỉ các trường được bật sẽ được cập nhật.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Subject */}
                        <div className="flex items-start space-x-3">
                            <Checkbox
                                id="enable-subject"
                                checked={enabledFields.subject || false}
                                onCheckedChange={(checked) => handleFieldToggle('subject', checked as boolean)}
                            />
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="enable-subject" className="text-sm font-medium">
                                    Môn học
                                </Label>
                                <Select
                                    value={updates.subject || ''}
                                    onValueChange={(value) => handleFieldChange('subject', value)}
                                    disabled={!enabledFields.subject}
                                >
                                    <SelectTrigger>
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
                            </div>
                        </div>

                        {/* Output Type */}
                        <div className="flex items-start space-x-3">
                            <Checkbox
                                id="enable-outputType"
                                checked={enabledFields.outputType || false}
                                onCheckedChange={(checked) => handleFieldToggle('outputType', checked as boolean)}
                            />
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="enable-outputType" className="text-sm font-medium">
                                    Loại đầu ra
                                </Label>
                                <Select
                                    value={updates.outputType || ''}
                                    onValueChange={(value) => handleFieldChange('outputType', value)}
                                    disabled={!enabledFields.outputType}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn loại đầu ra" />
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
                        </div>

                        {/* Difficulty */}
                        <div className="flex items-start space-x-3">
                            <Checkbox
                                id="enable-difficulty"
                                checked={enabledFields.difficulty || false}
                                onCheckedChange={(checked) => handleFieldToggle('difficulty', checked as boolean)}
                            />
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="enable-difficulty" className="text-sm font-medium">
                                    Độ khó
                                </Label>
                                <Select
                                    value={updates.difficulty || ''}
                                    onValueChange={(value) => handleFieldChange('difficulty', value)}
                                    disabled={!enabledFields.difficulty}
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
                            </div>
                        </div>

                        {/* Grade Levels */}
                        <div className="flex items-start space-x-3">
                            <Checkbox
                                id="enable-gradeLevel"
                                checked={enabledFields.gradeLevel || false}
                                onCheckedChange={(checked) => handleFieldToggle('gradeLevel', checked as boolean)}
                            />
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="enable-gradeLevel" className="text-sm font-medium">
                                    Lớp học
                                </Label>
                                <div className="flex flex-wrap gap-4">
                                    {[6, 7, 8, 9].map(grade => (
                                        <div key={grade} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`bulk-grade-${grade}`}
                                                checked={(updates.gradeLevel || []).includes(grade)}
                                                onCheckedChange={(checked) => handleGradeLevelChange(grade, checked as boolean)}
                                                disabled={!enabledFields.gradeLevel}
                                            />
                                            <Label htmlFor={`bulk-grade-${grade}`}>Lớp {grade}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            <X className="h-4 w-4 mr-2" />
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || Object.keys(enabledFields).filter(key => enabledFields[key]).length === 0}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Đang cập nhật...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Cập nhật ({selectedCount} template)
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}