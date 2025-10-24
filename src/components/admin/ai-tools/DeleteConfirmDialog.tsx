'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}

export default function DeleteConfirmDialog({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    loading = false
}: DeleteConfirmDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onCancel}
            />

            {/* Dialog */}
            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
                    {/* Close button */}
                    <button
                        onClick={onCancel}
                        className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600"
                        disabled={loading}
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Content */}
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                    {title}
                                </h3>
                            </div>
                        </div>

                        <p className="text-gray-600 mb-6">
                            {message}
                        </p>

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={onCancel}
                                disabled={loading}
                            >
                                Hủy
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={onConfirm}
                                disabled={loading}
                            >
                                {loading ? 'Đang xóa...' : 'Xóa'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}