'use client';

import React from 'react';
import { TemplateData } from '@/lib/admin/repositories/templates-repository';
import TemplateForm from './TemplateForm';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface TemplateFormModalProps {
    isOpen: boolean;
    template?: TemplateData;
    onSave: (template: TemplateData) => Promise<void>;
    onClose: () => void;
    loading?: boolean;
}

export default function TemplateFormModal({
    isOpen,
    template,
    onSave,
    onClose,
    loading = false
}: TemplateFormModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {template ? 'Chỉnh sửa Template' : 'Tạo Template mới'}
                    </DialogTitle>
                </DialogHeader>
                <TemplateForm
                    template={template}
                    onSave={onSave}
                    onCancel={onClose}
                    loading={loading}
                />
            </DialogContent>
        </Dialog>
    );
}