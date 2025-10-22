'use client';

import { useState } from 'react';

interface PromptDisplayProps {
    prompt: string;
}

export function PromptDisplay({ prompt }: PromptDisplayProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(prompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = prompt;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const wordCount = prompt.split(/\s+/).length;
    const charCount = prompt.length;

    return (
        <div className="space-y-4">
            {/* Thống kê */}
            <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{wordCount} từ • {charCount} ký tự</span>
                <button
                    onClick={copyToClipboard}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${copied
                            ? 'bg-green-600 text-white'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                >
                    {copied ? (
                        <>
                            <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Đã sao chép!
                        </>
                    ) : (
                        <>
                            <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Sao chép
                        </>
                    )}
                </button>
            </div>

            {/* Nội dung prompt */}
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                    {prompt}
                </pre>
            </div>

            {/* Hướng dẫn nhanh */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex">
                    <svg className="flex-shrink-0 h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-800">
                            <strong>Mẹo:</strong> Sau khi dán prompt vào AI tool, bạn có thể yêu cầu điều chỉnh thêm như "Làm ngắn gọn hơn" hoặc "Thêm ví dụ cụ thể".
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}