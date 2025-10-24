'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TemplateData } from '@/lib/admin/repositories/templates-repository';
import { AdminPaginatedResponse } from '@/lib/admin';
import TemplatesTable from './TemplatesTable';
import TemplatesPagination from './TemplatesPagination';
import TemplateFormModal from './TemplateFormModal';
import TemplateDeleteDialog from './TemplateDeleteDialog';
import TemplateBulkEditModal from './TemplateBulkEditModal';
import TemplatePreviewModal from './TemplatePreviewModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Upload, Download, RefreshCw, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface TemplatesManagerProps {
    initialData?: AdminPaginatedResponse<TemplateData>;
}

interface TemplateFilters {
    search?: string;
    subject?: string;
    gradeLevel?: number;
    outputType?: string;
    difficulty?: string;
}

interface SortConfig {
    field: string;
    direction: 'asc' | 'desc';
}

export default function TemplatesManager({ initialData }: TemplatesManagerProps) {
    const [data, setData] = useState<AdminPaginatedResponse<TemplateData>>(
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
    const [filters, setFilters] = useState<TemplateFilters>({});
    const [sort, setSort] = useState<SortConfig>({ field: 'updatedAt', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [showForm, setShowForm] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<TemplateData | undefined>(undefined);
    const [formLoading, setFormLoading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletingTemplate, setDeletingTemplate] = useState<TemplateData | undefined>(undefined);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showBulkEdit, setShowBulkEdit] = useState(false);
    const [bulkEditIds, setBulkEditIds] = useState<string[]>([]);
    const [bulkEditLoading, setBulkEditLoading] = useState(false);
    const [showImportExport, setShowImportExport] = useState(false);
    const [importExportMode, setImportExportMode] = useState<'import' | 'export'>('import');
    const [showPreview, setShowPreview] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState<TemplateData | undefined>(undefined);

    // Fetch templates data
    const fetchTemplates = useCallback(async (
        page: number = currentPage,
        limit: number = pageSize,
        searchFilters: TemplateFilters = filters,
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
            if (searchFilters.subject) params.append('subject', searchFilters.subject);
            if (searchFilters.gradeLevel) params.append('gradeLevel', searchFilters.gradeLevel.toString());
            if (searchFilters.outputType) params.append('outputType', searchFilters.outputType);
            if (searchFilters.difficulty) params.append('difficulty', searchFilters.difficulty);

            const response = await fetch(`/api/admin/templates?${params.toString()}`);

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
    const handleFilter = useCallback((newFilters: TemplateFilters) => {
        setFilters(newFilters);
        setCurrentPage(1); // Reset to first page when filtering
        fetchTemplates(1, pageSize, newFilters, sort);
    }, [pageSize, sort, fetchTemplates]);

    // Handle sort changes
    const handleSort = useCallback((field: string, direction: 'asc' | 'desc') => {
        const newSort = { field, direction };
        setSort(newSort);
        fetchTemplates(currentPage, pageSize, filters, newSort);
    }, [currentPage, pageSize, filters, fetchTemplates]);

    // Handle page changes
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        fetchTemplates(page, pageSize, filters, sort);
    }, [pageSize, filters, sort, fetchTemplates]);

    // Handle page size changes
    const handlePageSizeChange = useCallback((newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(1);
        fetchTemplates(1, newPageSize, filters, sort);
    }, [filters, sort, fetchTemplates]);

    // Handle refresh
    const handleRefresh = useCallback(() => {
        fetchTemplates(currentPage, pageSize, filters, sort);
    }, [fetchTemplates, currentPage, pageSize, filters, sort]);

    // Handle edit template
    const handleEdit = useCallback((template: TemplateData) => {
        setEditingTemplate(template);
        setShowForm(true);
    }, []);

    // Handle delete template
    const handleDelete = useCallback((templateId: string) => {
        const template = data.data.find(t => t.id === templateId);
        if (template) {
            setDeletingTemplate(template);
            setShowDeleteDialog(true);
        }
    }, [data.data]);

    // Handle preview template
    const handlePreview = useCallback((template: TemplateData) => {
        setPreviewTemplate(template);
        setShowPreview(true);
    }, []);

    // Confirm delete
    const confirmDelete = useCallback(async () => {
        if (!deletingTemplate) return;

        setDeleteLoading(true);
        try {
            const response = await fetch(`/api/admin/templates/${deletingTemplate.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Không thể xóa template');
            }

            toast.success('Đã xóa template thành công');
            setShowDeleteDialog(false);
            setDeletingTemplate(undefined);
            handleRefresh();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa';
            toast.error(errorMessage);
        } finally {
            setDeleteLoading(false);
        }
    }, [deletingTemplate, handleRefresh]);

    // Cancel delete
    const cancelDelete = useCallback(() => {
        setShowDeleteDialog(false);
        setDeletingTemplate(undefined);
    }, []);

    // Handle bulk actions
    const handleBulkAction = useCallback(async (action: string, templateIds: string[]) => {
        switch (action) {
            case 'edit':
                setBulkEditIds(templateIds);
                setShowBulkEdit(true);
                break;

            case 'delete':
                // For bulk delete, we'll use a simple confirm for now
                if (!confirm(`Bạn có chắc chắn muốn xóa ${templateIds.length} template đã chọn?`)) {
                    return;
                }

                try {
                    const response = await fetch('/api/admin/templates/bulk-delete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ids: templateIds })
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Không thể xóa hàng loạt');
                    }

                    const result = await response.json();
                    toast.success(`Đã xóa ${result.deletedCount} template`);
                    handleRefresh();
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa hàng loạt';
                    toast.error(errorMessage);
                }
                break;

            case 'export':
                try {
                    const params = new URLSearchParams();
                    templateIds.forEach(id => params.append('ids', id));

                    const response = await fetch(`/api/admin/templates/export?${params.toString()}`);

                    if (!response.ok) {
                        throw new Error('Không thể xuất dữ liệu');
                    }

                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `templates-export-${new Date().toISOString().split('T')[0]}.json`;
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

    // Handle add new template
    const handleAddNew = useCallback(() => {
        setEditingTemplate(undefined);
        setShowForm(true);
    }, []);

    // Handle form save
    const handleFormSave = useCallback(async (templateData: TemplateData) => {
        setFormLoading(true);

        try {
            const url = editingTemplate ? `/api/admin/templates/${editingTemplate.id}` : '/api/admin/templates';
            const method = editingTemplate ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(templateData)
            });

            if (!response.ok) {
                const errorData = await response.json();

                // Handle validation errors with detailed messages
                if (response.status === 400 && errorData.error) {
                    // Extract validation details from error message
                    const errorMessage = errorData.error;
                    if (errorMessage.includes('Dữ liệu không hợp lệ:')) {
                        // Show detailed validation errors
                        const validationDetails = errorMessage.replace('Dữ liệu không hợp lệ: ', '');
                        toast.error(`Lỗi validation: ${validationDetails}`, {
                            duration: 8000, // Show longer for detailed errors
                        });
                    } else {
                        toast.error(errorMessage);
                    }
                } else {
                    toast.error(errorData.error || 'Không thể lưu template');
                }

                throw new Error(errorData.error || 'Không thể lưu template');
            }

            const savedTemplate = await response.json();

            toast.success(editingTemplate ? 'Đã cập nhật template' : 'Đã tạo template mới');
            setShowForm(false);
            setEditingTemplate(undefined);
            handleRefresh();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu';
            toast.error(errorMessage);
            throw err; // Re-throw to let form handle it
        } finally {
            setFormLoading(false);
        }
    }, [editingTemplate, handleRefresh]);

    // Handle form close
    const handleFormClose = useCallback(() => {
        setShowForm(false);
        setEditingTemplate(undefined);
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
            const response = await fetch('/api/admin/templates/bulk-update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: bulkEditIds, updates })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Không thể cập nhật hàng loạt');
            }

            const result = await response.json();
            toast.success(`Đã cập nhật ${result.updatedCount} template`);
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

    // Handle preview close
    const handlePreviewClose = useCallback(() => {
        setShowPreview(false);
        setPreviewTemplate(undefined);
    }, []);

    // Load initial data if not provided
    useEffect(() => {
        if (!initialData) {
            fetchTemplates();
        }
    }, [initialData, fetchTemplates]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Quản lý Templates</h2>
                    <p className="text-gray-600 mt-1">
                        Quản lý {data.total} template cho giáo dục
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
                    <CardTitle className="text-lg">Danh sách Templates</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <TemplatesTable
                        templates={data.data}
                        loading={loading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onPreview={handlePreview}
                        onBulkAction={handleBulkAction}
                        onSort={handleSort}
                        onFilter={handleFilter}
                        currentSort={sort}
                    />

                    {data.total > 0 && (
                        <div className="px-6 pb-6">
                            <TemplatesPagination
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

            {/* Template Form Modal */}
            <TemplateFormModal
                isOpen={showForm}
                template={editingTemplate}
                onSave={handleFormSave}
                onClose={handleFormClose}
                loading={formLoading}
            />

            {/* Delete Confirmation Dialog */}
            <TemplateDeleteDialog
                isOpen={showDeleteDialog}
                template={deletingTemplate}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                loading={deleteLoading}
            />

            {/* Bulk Edit Modal */}
            <TemplateBulkEditModal
                isOpen={showBulkEdit}
                selectedCount={bulkEditIds.length}
                onSave={handleBulkEditSave}
                onClose={handleBulkEditClose}
                loading={bulkEditLoading}
            />

            {/* Template Preview Modal */}
            <TemplatePreviewModal
                isOpen={showPreview}
                template={previewTemplate}
                onClose={handlePreviewClose}
            />

            {/* TODO: Add modals for import/export */}
            {/* These will be implemented in future tasks */}
        </div>
    );
}