'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ImportExportModalProps {
    isOpen: boolean;
    mode: 'import' | 'export';
    onClose: () => void;
    onImportComplete?: () => void;
}

interface ImportResult {
    success: number;
    failed: number;
    errors: Array<{
        row: number;
        error: string;
        data?: any;
    }>;
}

export default function ImportExportModal({
    isOpen,
    mode,
    onClose,
    onImportComplete
}: ImportExportModalProps) {
    const [loading, setLoading] = useState(false);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['application/json', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
            if (!allowedTypes.includes(file.type)) {
                toast.error('Chỉ hỗ trợ file JSON, CSV, và Excel');
                return;
            }

            // Validate file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File không được lớn hơn 10MB');
                return;
            }

            setSelectedFile(file);
            setImportResult(null);
        }
    };

    // Handle import
    const handleImport = async () => {
        if (!selectedFile) {
            toast.error('Vui lòng chọn file để import');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await fetch('/api/admin/ai-tools/import', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Không thể import dữ liệu');
            }

            const result = await response.json();
            setImportResult(result);

            if (result.success > 0) {
                toast.success(`Đã import thành công ${result.success} công cụ AI`);
                onImportComplete?.();
            }

            if (result.failed > 0) {
                toast.error(`${result.failed} mục import thất bại`);
            }
        } catch (error) {
            console.error('Import error:', error);
            toast.error(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi import');
        } finally {
            setLoading(false);
        }
    };

    // Handle export
    const handleExport = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/ai-tools/export');

            if (!response.ok) {
                throw new Error('Không thể export dữ liệu');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ai-tools-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('Đã export dữ liệu thành công');
            onClose();
        } catch (error) {
            console.error('Export error:', error);
            toast.error(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi export');
        } finally {
            setLoading(false);
        }
    };

    // Reset form
    const resetForm = () => {
        setSelectedFile(null);
        setImportResult(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Handle close
    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm"
                        disabled={loading}
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Content */}
                    <div className="p-6">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {mode === 'import' ? 'Import AI Tools' : 'Export AI Tools'}
                            </h2>
                            <p className="text-gray-600 mt-1">
                                {mode === 'import'
                                    ? 'Tải lên file dữ liệu để thêm công cụ AI vào hệ thống'
                                    : 'Tải xuống dữ liệu công cụ AI hiện có'
                                }
                            </p>
                        </div>

                        {mode === 'import' ? (
                            <div className="space-y-6">
                                {/* File Upload */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Chọn file dữ liệu</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-600">
                                                    Kéo thả file vào đây hoặc click để chọn
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Hỗ trợ JSON, CSV, Excel (tối đa 10MB)
                                                </p>
                                            </div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".json,.csv,.xlsx"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="mt-4"
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                Chọn file
                                            </Button>
                                        </div>

                                        {selectedFile && (
                                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-5 w-5 text-blue-600" />
                                                    <div>
                                                        <p className="text-sm font-medium text-blue-900">
                                                            {selectedFile.name}
                                                        </p>
                                                        <p className="text-xs text-blue-600">
                                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedFile(null)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Import Instructions */}
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>Lưu ý:</strong> File import phải có cấu trúc đúng định dạng.
                                        Các công cụ AI trùng lặp sẽ được bỏ qua.
                                        Hệ thống sẽ kiểm tra và báo lỗi nếu có dữ liệu không hợp lệ.
                                    </AlertDescription>
                                </Alert>

                                {/* Import Results */}
                                {importResult && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                                Kết quả Import
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                                    <div className="text-2xl font-bold text-green-600">
                                                        {importResult.success}
                                                    </div>
                                                    <div className="text-sm text-green-700">Thành công</div>
                                                </div>
                                                <div className="text-center p-3 bg-red-50 rounded-lg">
                                                    <div className="text-2xl font-bold text-red-600">
                                                        {importResult.failed}
                                                    </div>
                                                    <div className="text-sm text-red-700">Thất bại</div>
                                                </div>
                                            </div>

                                            {importResult.errors.length > 0 && (
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-2">Chi tiết lỗi:</h4>
                                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                                        {importResult.errors.slice(0, 10).map((error, index) => (
                                                            <div key={index} className="text-sm p-2 bg-red-50 rounded border-l-4 border-red-400">
                                                                <span className="font-medium">Dòng {error.row}:</span> {error.error}
                                                            </div>
                                                        ))}
                                                        {importResult.errors.length > 10 && (
                                                            <p className="text-sm text-gray-500">
                                                                ... và {importResult.errors.length - 10} lỗi khác
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Actions */}
                                <div className="flex justify-end gap-4">
                                    <Button type="button" variant="outline" onClick={handleClose}>
                                        Đóng
                                    </Button>
                                    <Button
                                        onClick={handleImport}
                                        disabled={!selectedFile || loading}
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        {loading ? 'Đang import...' : 'Import'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Export Options */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Tùy chọn Export</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-gray-600">
                                            Export tất cả dữ liệu công cụ AI hiện có trong hệ thống dưới định dạng JSON.
                                        </p>

                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">JSON Format</Badge>
                                            <Badge variant="outline">Tất cả dữ liệu</Badge>
                                            <Badge variant="outline">Có thể import lại</Badge>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Actions */}
                                <div className="flex justify-end gap-4">
                                    <Button type="button" variant="outline" onClick={handleClose}>
                                        Hủy
                                    </Button>
                                    <Button onClick={handleExport} disabled={loading}>
                                        <Download className="h-4 w-4 mr-2" />
                                        {loading ? 'Đang export...' : 'Export'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}