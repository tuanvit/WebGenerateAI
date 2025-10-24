'use client';

import React from 'react';
import { TemplateData } from '@/lib/admin/repositories/templates-repository';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface TemplateDeleteDialogProps {
    isOpen: boolean;
    template?: TemplateData;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}

export default function TemplateDeleteDialog({
    isOpen,
    template,
    onConfirm,
    onCancel,
    loading = false
}: TemplateDeleteDialogProps) {
    if (!template) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onCancel}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        Xác nhận xóa Template
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 p-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800">
                            Bạn có chắc chắn muốn xóa template <strong>"{template.name}"</strong>?
                        </p>
                        <p className="text-sm text-red-600 mt-2">
                            Hành động này không thể hoàn tác. Template sẽ bị xóa vĩnh viễn khỏi hệ thống.
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Thông tin Template:</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                            <div><strong>Tên:</strong> {template.name}</div>
                            <div><strong>Môn học:</strong> {template.subject}</div>
                            <div><strong>Loại:</strong> {template.outputType}</div>
                            <div><strong>Lớp:</strong> {template.gradeLevel.join(', ')}</div>
                            {template.variables && template.variables.length > 0 && (
                                <div><strong>Biến:</strong> {template.variables.length} biến</div>
                            )}
                            {template.examples && template.examples.length > 0 && (
                                <div><strong>Ví dụ:</strong> {template.examples.length} ví dụ</div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={onConfirm}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Đang xóa...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Xóa Template
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}