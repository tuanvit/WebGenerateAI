'use client';

import React from 'react';
import { AIToolData } from '@/lib/admin/repositories/ai-tools-repository';
import AIToolForm from './AIToolForm';
import { X } from 'lucide-react';

interface AIToolFormModalProps {
    isOpen: boolean;
    tool?: AIToolData;
    onSave: (tool: AIToolData) => Promise<void>;
    onClose: () => void;
    loading?: boolean;
}

export default function AIToolFormModal({
    isOpen,
    tool,
    onSave,
    onClose,
    loading = false
}: AIToolFormModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm"
                        disabled={loading}
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Form content */}
                    <div className="p-6">
                        <AIToolForm
                            tool={tool}
                            onSave={onSave}
                            onCancel={onClose}
                            loading={loading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}