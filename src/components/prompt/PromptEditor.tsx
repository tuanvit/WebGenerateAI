'use client';

import React, { useState } from 'react';

interface PromptEditorProps {
    initialPrompt: string;
    onSave: (editedPrompt: string) => void;
}

export default function PromptEditor({ initialPrompt, onSave }: PromptEditorProps) {
    const [prompt, setPrompt] = useState(initialPrompt);

    const handleSave = () => {
        onSave(prompt);
    };

    return (
        <div className="space-y-4">
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                placeholder="Chỉnh sửa prompt của bạn..."
            />
            <div className="flex justify-end space-x-2">
                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                    💾 Lưu thay đổi
                </button>
            </div>
        </div>
    );
}