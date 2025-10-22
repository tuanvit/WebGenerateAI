'use client';

import { useState, useRef } from 'react';

interface FileUploadProps {
    onFileUpload: (file: File) => void;
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        const validFile = files.find(file =>
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.type === 'application/pdf' ||
            file.name.endsWith('.docx') ||
            file.name.endsWith('.pdf')
        );

        if (validFile) {
            handleFileUpload(validFile);
        } else {
            alert('Chỉ hỗ trợ file .docx và .pdf');
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleFileUpload = async (file: File) => {
        setIsUploading(true);

        try {
            // Giả lập thời gian xử lý file
            await new Promise(resolve => setTimeout(resolve, 1000));
            onFileUpload(file);
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Có lỗi khi upload file');
        } finally {
            setIsUploading(false);
        }
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="w-full">
            <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.pdf"
                onChange={handleFileSelect}
                className="hidden"
            />

            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={openFileDialog}
                className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
            >
                {isUploading ? (
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Đang xử lý file...</span>
                    </div>
                ) : (
                    <>
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="mt-4">
                            <p className="text-sm text-gray-600">
                                <span className="font-medium text-blue-600">Click để chọn file</span> hoặc kéo thả vào đây
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Hỗ trợ file .docx và .pdf (tối đa 10MB)
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}