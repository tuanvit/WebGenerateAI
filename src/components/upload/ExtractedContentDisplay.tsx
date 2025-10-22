'use client';

import React, { useState } from 'react';
import {
    FileText,
    Edit3,
    Eye,
    Copy,
    Check,
    RotateCcw,
    AlertCircle,
    Info
} from 'lucide-react';

interface ExtractedContentDisplayProps {
    content: string;
    filename?: string;
    extractionMethod?: string;
    wordCount?: number;
    characterCount?: number;
    onContentChange: (content: string) => void;
}

export function ExtractedContentDisplay({
    content,
    filename,
    extractionMethod,
    wordCount,
    characterCount,
    onContentChange
}: ExtractedContentDisplayProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(content);
    const [isCopied, setIsCopied] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const handleSaveEdit = () => {
        onContentChange(editedContent);
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditedContent(content);
        setIsEditing(false);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy content:', error);
        }
    };

    const getContentStats = () => {
        const lines = content.split('\n').length;
        const words = wordCount || content.trim().split(/\s+/).length;
        const characters = characterCount || content.length;

        return { lines, words, characters };
    };

    const stats = getContentStats();

    return (
        <div className="mt-4 space-y-4">
            {/* Header with file info and actions */}
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                        <h3 className="text-sm font-medium text-blue-900">
                            Nội dung đã trích xuất
                            {filename && (
                                <span className="text-blue-700 ml-2">từ {filename}</span>
                            )}
                        </h3>
                        <div className="flex items-center space-x-4 text-xs text-blue-600 mt-1">
                            <span>{stats.words.toLocaleString()} từ</span>
                            <span>{stats.characters.toLocaleString()} ký tự</span>
                            <span>{stats.lines} dòng</span>
                            {extractionMethod && (
                                <span className="flex items-center">
                                    <Info className="w-3 h-3 mr-1" />
                                    {extractionMethod}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`p-2 rounded-lg transition-colors ${showPreview
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-blue-600 hover:bg-blue-100'
                            }`}
                        title={showPreview ? 'Ẩn xem trước' : 'Xem trước'}
                    >
                        <Eye className="w-4 h-4" />
                    </button>

                    <button
                        onClick={handleCopy}
                        className="p-2 bg-white text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Sao chép nội dung"
                    >
                        {isCopied ? (
                            <Check className="w-4 h-4 text-green-600" />
                        ) : (
                            <Copy className="w-4 h-4" />
                        )}
                    </button>

                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`p-2 rounded-lg transition-colors ${isEditing
                            ? 'bg-orange-600 text-white'
                            : 'bg-white text-blue-600 hover:bg-blue-100'
                            }`}
                        title={isEditing ? 'Hủy chỉnh sửa' : 'Chỉnh sửa nội dung'}
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content display/edit area */}
            {isEditing ? (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700">
                            Chỉnh sửa nội dung:
                        </label>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleCancelEdit}
                                className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Hủy
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="flex items-center px-3 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                            >
                                <Check className="w-3 h-3 mr-1" />
                                Lưu
                            </button>
                        </div>
                    </div>

                    <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        rows={12}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        placeholder="Chỉnh sửa nội dung đã trích xuất..."
                    />

                    <div className="text-xs text-gray-500">
                        {editedContent.length.toLocaleString()} ký tự • {editedContent.split(/\s+/).length.toLocaleString()} từ
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                        Nội dung đã trích xuất:
                    </label>

                    {showPreview ? (
                        /* Formatted preview */
                        <div className="bg-white border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto">
                            <div className="prose prose-sm max-w-none">
                                {content.split('\n').map((line, index) => {
                                    if (line.trim() === '') {
                                        return <br key={index} />;
                                    }

                                    // Detect headings (lines that are all caps or start with numbers/bullets)
                                    const isHeading = /^[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ\s\d\.\-]+$/.test(line.trim()) && line.length < 100;
                                    const isBullet = /^\s*[-•*]\s/.test(line);
                                    const isNumbered = /^\s*\d+[\.\)]\s/.test(line);

                                    if (isHeading) {
                                        return (
                                            <h3 key={index} className="font-semibold text-gray-900 mt-4 mb-2">
                                                {line.trim()}
                                            </h3>
                                        );
                                    } else if (isBullet || isNumbered) {
                                        return (
                                            <p key={index} className="ml-4 text-gray-700 mb-1">
                                                {line.trim()}
                                            </p>
                                        );
                                    } else {
                                        return (
                                            <p key={index} className="text-gray-700 mb-2">
                                                {line.trim()}
                                            </p>
                                        );
                                    }
                                })}
                            </div>
                        </div>
                    ) : (
                        /* Raw text view */
                        <textarea
                            value={content}
                            onChange={(e) => onContentChange(e.target.value)}
                            rows={8}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-mono text-sm"
                            placeholder="Nội dung sẽ hiển thị ở đây sau khi trích xuất từ file..."
                        />
                    )}
                </div>
            )}

            {/* Tips for better extraction */}
            {content && content.includes('Lưu ý: File .doc') && (
                <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <div className="text-sm">
                        <p className="font-medium text-amber-800 mb-1">
                            Gợi ý cải thiện chất lượng trích xuất:
                        </p>
                        <ul className="text-amber-700 space-y-1 list-disc list-inside">
                            <li>Chuyển đổi file .doc thành .docx để có kết quả tốt hơn</li>
                            <li>Đảm bảo file không bị bảo vệ bằng mật khẩu</li>
                            <li>Kiểm tra định dạng văn bản trong file Word</li>
                            <li>Có thể sao chép trực tiếp nội dung từ Word và dán vào ô văn bản</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* Content quality indicators */}
            {content && !content.includes('Lưu ý: File .doc') && (
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-lg font-semibold text-green-800">
                            {stats.words.toLocaleString()}
                        </div>
                        <div className="text-xs text-green-600">Từ</div>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-lg font-semibold text-blue-800">
                            {stats.characters.toLocaleString()}
                        </div>
                        <div className="text-xs text-blue-600">Ký tự</div>
                    </div>
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="text-lg font-semibold text-purple-800">
                            {stats.lines}
                        </div>
                        <div className="text-xs text-purple-600">Dòng</div>
                    </div>
                </div>
            )}
        </div>
    );
}