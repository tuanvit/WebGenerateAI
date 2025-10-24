'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AIToolData } from '@/lib/admin/repositories/ai-tools-repository';
import { AdminPaginatedResponse } from '@/lib/admin';
import AIToolsTable from './AIToolsTable';
import AIToolsPagination from './AIToolsPagination';
import AIToolFormModal from './AIToolFormModal';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import BulkEditModal from './BulkEditModal';
import ImportExportModal from './ImportExportModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Upload, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface AIToolsManagerProps {
    initialData?: AdminPaginatedResponse<AIToolData>;
}

interface AIToolFilters {
    search?: string;
    category?: string;
    subject?: string;
    gradeLevel?: number;
    difficulty?: string;
    pricingModel?: string;
    vietnameseSupport?: boolean;
}

interface SortConfig {
    field: string;
    direction: 'asc' | 'desc';
}

export default function AIToolsManager({ initialData }: AIToolsManagerProps) {
    const [data, setData] = useState<AdminPaginatedResponse<AIToolData>>(
        initialData || {
            data: [],
            total: 0,
            page: 1,
            limit: 25,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
        }
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<AIToolFilters>({});
    const [sort, setSort] = useState<SortConfig>({ field: 'updatedAt', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [showForm, setShowForm] = useState(false);
    const [editingTool, setEditingTool] = useState<AIToolData | undefined>(undefined);
    const [formLoading, setFormLoading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletingTool, setDeletingTool] = useState<AIToolData | undefined>(undefined);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showBulkEdit, setShowBulkEdit] = useState(false);
    const [bulkEditIds, setBulkEditIds] = useState<string[]>([]);
    const [bulkEditLoading, setBulkEditLoading] = useState(false);
    const [showImportExport, setShowImportExport] = useState(false);
    const [importExportMode, setImportExportMode] = useState<'import' | 'export'>('import');

    // Fetch AI tools data
    const fetchAITools = useCallback(async (
        page: number = currentPage,
        limit: number = pageSize,
        searchFilters: AIToolFilters = filters,
        sortConfig: SortConfig = sort
    ) => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                sortBy: sortConfig.field,
                sortOrder: sortConfig.direction
            });

            // Add filters to params
            if (searchFilters.search) params.append('search', searchFilters.search);
            if (searchFilters.category) params.append('category', searchFilters.category);
            if (searchFilters.subject) params.append('subject', searchFilters.subject);
            if (searchFilters.gradeLevel) params.append('gradeLevel', searchFilters.gradeLevel.toString());
            if (searchFilters.difficulty) params.append('difficulty', searchFilters.difficulty);
            if (searchFilters.pricingModel) params.append('pricingModel', searchFilters.pricingModel);
            if (searchFilters.vietnameseSupport !== undefined) {
                params.append('vietnameseSupport', searchFilters.vietnameseSupport.toString());
            }

            const response = await fetch(`/api/admin/ai-tools?${params.toString()}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Không thể tải dữ liệu');
            }

            const result = await response.json();
            setData(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, filters, sort]);

    // Handle filter changes
    const handleFilter = useCallback((newFilters: AIToolFilters) => {
        setFilters(newFilters);
        setCurrentPage(1); // Reset to first page when filtering
        fetchAITools(1, pageSize, newFilters, sort);
    }, [pageSize, sort, fetchAITools]);

    // Handle sort changes
    const handleSort = useCallback((field: string, direction: 'asc' | 'desc') => {
        const newSort = { field, direction };
        setSort(newSort);
        fetchAITools(currentPage, pageSize, filters, newSort);
    }, [currentPage, pageSize, filters, fetchAITools]);

    // Handle page changes
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        fetchAITools(page, pageSize, filters, sort);
    }, [pageSize, filters, sort, fetchAITools]);

    // Handle page size changes
    const handlePageSizeChange = useCallback((newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(1);
        fetchAITools(1, newPageSize, filters, sort);
    }, [filters, sort, fetchAITools]);

    // Handle refresh
    const handleRefresh = useCallback(() => {
        fetchAITools(currentPage, pageSize, filters, sort);
    }, [fetchAITools, currentPage, pageSize, filters, sort]);

    // Handle edit tool
    const handleEdit = useCallback((tool: AIToolData) => {
        setEditingTool(tool);
        setShowForm(true);
    }, []);

    // Handle delete tool
    const handleDelete = useCallback((toolId: string) => {
        const tool = data.data.find(t => t.id === toolId);
        if (tool) {
            setDeletingTool(tool);
            setShowDeleteDialog(true);
        }
    }, [data.data]);

    // Confirm delete
    const confirmDelete = useCallback(async () => {
        if (!deletingTool) return;

        setDeleteLoading(true);
        try {
            const response = await fetch(`/api/admin/ai-tools/${deletingTool.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Không thể xóa công cụ AI');
            }

            toast.success('Đã xóa công cụ AI thành công');
            setShowDeleteDialog(false);
            setDeletingTool(undefined);
            handleRefresh();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa';
            toast.error(errorMessage);
        } finally {
            setDeleteLoading(false);
        }
    }, [deletingTool, handleRefresh]);

    // Cancel delete
    const cancelDelete = useCallback(() => {
        setShowDeleteDialog(false);
        setDeletingTool(undefined);
    }, []);

    // Handle bulk actions
    const handleBulkAction = useCallback(async (action: string, toolIds: string[]) => {
        switch (action) {
            case 'edit':
                setBulkEditIds(toolIds);
                setShowBulkEdit(true);
                break;

            case 'delete':
                // For bulk delete, we'll use a simple confirm for now
                // In a real app, you might want a more sophisticated bulk delete dialog
                if (!confirm(`Bạn có chắc chắn muốn xóa ${toolIds.length} công cụ AI đã chọn?`)) {
                    return;
                }

                try {
                    const response = await fetch('/api/admin/ai-tools/bulk-delete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ids: toolIds })
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Không thể xóa hàng loạt');
                    }

                    const result = await response.json();
                    toast.success(`Đã xóa ${result.deletedCount} công cụ AI`);
                    handleRefresh();
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa hàng loạt';
                    toast.error(errorMessage);
                }
                break;

            case 'export':
                try {
                    const params = new URLSearchParams();
                    toolIds.forEach(id => params.append('ids', id));

                    const response = await fetch(`/api/admin/ai-tools/export?${params.toString()}`);

                    if (!response.ok) {
                        throw new Error('Không thể xuất dữ liệu');
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

                    toast.success('Đã xuất dữ liệu thành công');
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xuất dữ liệu';
                    toast.error(errorMessage);
                }
                break;

            default:
                toast.error('Thao tác không được hỗ trợ');
        }
    }, [handleRefresh]);

    // Handle add new tool
    const handleAddNew = useCallback(() => {
        setEditingTool(undefined);
        setShowForm(true);
    }, []);

    // Handle form save
    const handleFormSave = useCallback(async (toolData: AIToolData) => {
        setFormLoading(true);

        try {
            const url = editingTool ? `/api/admin/ai-tools/${editingTool.id}` : '/api/admin/ai-tools';
            const method = editingTool ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(toolData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Không thể lưu công cụ AI');
            }

            const savedTool = await response.json();

            toast.success(editingTool ? 'Đã cập nhật công cụ AI' : 'Đã tạo công cụ AI mới');
            setShowForm(false);
            setEditingTool(undefined);
            handleRefresh();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu';
            toast.error(errorMessage);
            throw err; // Re-throw to let form handle it
        } finally {
            setFormLoading(false);
        }
    }, [editingTool, handleRefresh]);

    // Handle form close
    const handleFormClose = useCallback(() => {
        setShowForm(false);
        setEditingTool(undefined);
    }, []);

    // Handle import
    const handleImport = useCallback(() => {
        setImportExportMode('import');
        setShowImportExport(true);
    }, []);

    // Handle export all
    const handleExportAll = useCallback(() => {
        setImportExportMode('export');
        setShowImportExport(true);
    }, []);

    // Handle bulk edit save
    const handleBulkEditSave = useCallback(async (updates: any) => {
        setBulkEditLoading(true);
        try {
            const response = await fetch('/api/admin/ai-tools/bulk-update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: bulkEditIds, updates })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Không thể cập nhật hàng loạt');
            }

            const result = await response.json();
            toast.success(`Đã cập nhật ${result.updatedCount} công cụ AI`);
            setShowBulkEdit(false);
            setBulkEditIds([]);
            handleRefresh();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi cập nhật hàng loạt';
            toast.error(errorMessage);
            throw err; // Re-throw to let modal handle it
        } finally {
            setBulkEditLoading(false);
        }
    }, [bulkEditIds, handleRefresh]);

    // Handle bulk edit close
    const handleBulkEditClose = useCallback(() => {
        setShowBulkEdit(false);
        setBulkEditIds([]);
    }, []);

    // Handle import/export close
    const handleImportExportClose = useCallback(() => {
        setShowImportExport(false);
    }, []);

    // Load initial data if not provided
    useEffect(() => {
        if (!initialData) {
            fetchAITools();
        }
    }, [initialData, fetchAITools]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Quản lý AI Tools</h2>
                    <p className="text-gray-600 mt-1">
                        Quản lý {data.total} công cụ AI cho giáo dục
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </Button>
                    <Button variant="outline" onClick={handleImport}>
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                    </Button>
                    <Button variant="outline" onClick={handleExportAll}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button onClick={handleAddNew}>
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm mới
                    </Button>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Main Content */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Danh sách AI Tools</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <AIToolsTable
                        tools={data.data}
                        loading={loading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onBulkAction={handleBulkAction}
                        onSort={handleSort}
                        onFilter={handleFilter}
                        currentSort={sort}
                    />

                    {data.total > 0 && (
                        <div className="px-6 pb-6">
                            <AIToolsPagination
                                currentPage={data.page}
                                totalPages={data.totalPages}
                                totalItems={data.total}
                                pageSize={data.limit}
                                onPageChange={handlePageChange}
                                onPageSizeChange={handlePageSizeChange}
                                loading={loading}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Form Modal */}
            <AIToolFormModal
                isOpen={showForm}
                tool={editingTool}
                onSave={handleFormSave}
                onClose={handleFormClose}
                loading={formLoading}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                isOpen={showDeleteDialog}
                title="Xóa công cụ AI"
                message={`Bạn có chắc chắn muốn xóa công cụ "${deletingTool?.name}"? Hành động này không thể hoàn tác.`}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                loading={deleteLoading}
            />

            {/* Bulk Edit Modal */}
            <BulkEditModal
                isOpen={showBulkEdit}
                selectedCount={bulkEditIds.length}
                onSave={handleBulkEditSave}
                onClose={handleBulkEditClose}
                loading={bulkEditLoading}
            />

            {/* Import/Export Modal */}
            <ImportExportModal
                isOpen={showImportExport}
                mode={importExportMode}
                onClose={handleImportExportClose}
                onImportComplete={handleRefresh}
            />
        </div>
    );
}