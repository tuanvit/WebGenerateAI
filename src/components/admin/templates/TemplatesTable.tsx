'use client';

import React, { useState, memo, useCallback, useMemo } from 'react';
import { TemplateData } from '@/lib/admin/repositories/templates-repository';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    MemoizationUtils,
    useDebouncedSearch,
    usePerformanceMonitoring,
    OptimizedFilter
} from '@/lib/admin/client-performance';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Search,
    Filter,
    Edit,
    Trash2,
    MoreHorizontal,
    Eye,
    ChevronUp,
    ChevronDown,
    FileText,
    Play
} from 'lucide-react';

interface TemplatesTableProps {
    templates: TemplateData[];
    loading?: boolean;
    onEdit: (template: TemplateData) => void;
    onDelete: (templateId: string) => void;
    onPreview: (template: TemplateData) => void;
    onBulkAction: (action: string, templateIds: string[]) => void;
    onSort: (field: string, direction: 'asc' | 'desc') => void;
    onFilter: (filters: TemplateFilters) => void;
    currentSort?: { field: string; direction: 'asc' | 'desc' };
}

interface TemplateFilters {
    search?: string;
    subject?: string;
    gradeLevel?: number;
    outputType?: string;
    difficulty?: string;
}

const SUBJECTS = [
    'Toán',
    'Văn',
    'Khoa học tự nhiên',
    'Lịch sử & Địa lí',
    'Giáo dục công dân',
    'Công nghệ'
];

const OUTPUT_TYPES = [
    { value: 'lesson-plan', label: 'Giáo án' },
    { value: 'presentation', label: 'Bài thuyết trình' },
    { value: 'assessment', label: 'Đánh giá' },
    { value: 'interactive', label: 'Tương tác' },
    { value: 'research', label: 'Nghiên cứu' }
];

const DIFFICULTIES = [
    { value: 'beginner', label: 'Cơ bản' },
    { value: 'intermediate', label: 'Trung bình' },
    { value: 'advanced', label: 'Nâng cao' }
];

const TemplatesTable = memo(function TemplatesTable({
    templates,
    loading = false,
    onEdit,
    onDelete,
    onPreview,
    onBulkAction,
    onSort,
    onFilter,
    currentSort
}: TemplatesTableProps) {
    const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
    const [filters, setFilters] = useState<TemplateFilters>({});
    const [showFilters, setShowFilters] = useState(false);

    // Handle select all checkbox
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedTemplates(templates.map(template => template.id!));
        } else {
            setSelectedTemplates([]);
        }
    };

    // Handle individual template selection
    const handleSelectTemplate = (templateId: string, checked: boolean) => {
        if (checked) {
            setSelectedTemplates(prev => [...prev, templateId]);
        } else {
            setSelectedTemplates(prev => prev.filter(id => id !== templateId));
        }
    };

    // Handle filter changes
    const handleFilterChange = (key: keyof TemplateFilters, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilter(newFilters);
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({});
        onFilter({});
    };

    // Handle sort
    const handleSort = (field: string) => {
        const direction = currentSort?.field === field && currentSort?.direction === 'asc' ? 'desc' : 'asc';
        onSort(field, direction);
    };

    // Get output type label
    const getOutputTypeLabel = (outputType: string) => {
        return OUTPUT_TYPES.find(t => t.value === outputType)?.label || outputType;
    };

    // Get difficulty label
    const getDifficultyLabel = (difficulty: string) => {
        return DIFFICULTIES.find(d => d.value === difficulty)?.label || difficulty;
    };

    // Get output type badge color
    const getOutputTypeColor = (outputType: string) => {
        switch (outputType) {
            case 'lesson-plan': return 'bg-blue-100 text-blue-800';
            case 'presentation': return 'bg-purple-100 text-purple-800';
            case 'assessment': return 'bg-orange-100 text-orange-800';
            case 'interactive': return 'bg-green-100 text-green-800';
            case 'research': return 'bg-indigo-100 text-indigo-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Get difficulty badge color
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner': return 'bg-green-100 text-green-800';
            case 'intermediate': return 'bg-yellow-100 text-yellow-800';
            case 'advanced': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const isAllSelected = templates.length > 0 && selectedTemplates.length === templates.length;
    const isIndeterminate = selectedTemplates.length > 0 && selectedTemplates.length < templates.length;

    return (
        <div className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Tìm kiếm template..."
                            value={filters.search || ''}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        Bộ lọc
                        {Object.keys(filters).filter(key => filters[key as keyof TemplateFilters]).length > 0 && (
                            <Badge variant="secondary" className="ml-1">
                                {Object.keys(filters).filter(key => filters[key as keyof TemplateFilters]).length}
                            </Badge>
                        )}
                    </Button>
                    {selectedTemplates.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    Thao tác hàng loạt ({selectedTemplates.length})
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => onBulkAction('edit', selectedTemplates)}>
                                    Chỉnh sửa hàng loạt
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onBulkAction('export', selectedTemplates)}>
                                    Xuất dữ liệu
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => onBulkAction('delete', selectedTemplates)}
                                    className="text-red-600"
                                >
                                    Xóa đã chọn
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Môn học
                            </label>
                            <Select
                                value={filters.subject || ''}
                                onValueChange={(value) => handleFilterChange('subject', value || undefined)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Tất cả môn học" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Tất cả môn học</SelectItem>
                                    {SUBJECTS.map(subject => (
                                        <SelectItem key={subject} value={subject}>
                                            {subject}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Lớp
                            </label>
                            <Select
                                value={filters.gradeLevel?.toString() || ''}
                                onValueChange={(value) => handleFilterChange('gradeLevel', value ? parseInt(value) : undefined)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Tất cả lớp" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Tất cả lớp</SelectItem>
                                    <SelectItem value="6">Lớp 6</SelectItem>
                                    <SelectItem value="7">Lớp 7</SelectItem>
                                    <SelectItem value="8">Lớp 8</SelectItem>
                                    <SelectItem value="9">Lớp 9</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Loại đầu ra
                            </label>
                            <Select
                                value={filters.outputType || ''}
                                onValueChange={(value) => handleFilterChange('outputType', value || undefined)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Tất cả loại" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Tất cả loại</SelectItem>
                                    {OUTPUT_TYPES.map(type => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Độ khó
                            </label>
                            <Select
                                value={filters.difficulty || ''}
                                onValueChange={(value) => handleFilterChange('difficulty', value || undefined)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Tất cả độ khó" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Tất cả độ khó</SelectItem>
                                    {DIFFICULTIES.map(difficulty => (
                                        <SelectItem key={difficulty.value} value={difficulty.value}>
                                            {difficulty.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button variant="outline" onClick={clearFilters}>
                            Xóa bộ lọc
                        </Button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={isAllSelected}
                                    onCheckedChange={handleSelectAll}
                                    ref={(el) => {
                                        if (el) el.indeterminate = isIndeterminate;
                                    }}
                                />
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-gray-50"
                                onClick={() => handleSort('name')}
                            >
                                <div className="flex items-center gap-1">
                                    Tên template
                                    {currentSort?.field === 'name' && (
                                        currentSort.direction === 'asc' ?
                                            <ChevronUp className="h-4 w-4" /> :
                                            <ChevronDown className="h-4 w-4" />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-gray-50"
                                onClick={() => handleSort('subject')}
                            >
                                <div className="flex items-center gap-1">
                                    Môn học
                                    {currentSort?.field === 'subject' && (
                                        currentSort.direction === 'asc' ?
                                            <ChevronUp className="h-4 w-4" /> :
                                            <ChevronDown className="h-4 w-4" />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead>Lớp</TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-gray-50"
                                onClick={() => handleSort('outputType')}
                            >
                                <div className="flex items-center gap-1">
                                    Loại đầu ra
                                    {currentSort?.field === 'outputType' && (
                                        currentSort.direction === 'asc' ?
                                            <ChevronUp className="h-4 w-4" /> :
                                            <ChevronDown className="h-4 w-4" />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead>Độ khó</TableHead>
                            <TableHead>Biến</TableHead>
                            <TableHead>Ví dụ</TableHead>
                            <TableHead className="w-20">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8">
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                        <span className="ml-2">Đang tải...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : templates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                    Không tìm thấy template nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            templates.map((template) => (
                                <TableRow key={template.id} className="hover:bg-gray-50">
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedTemplates.includes(template.id!)}
                                            onCheckedChange={(checked) => handleSelectTemplate(template.id!, checked as boolean)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <div className="font-medium">{template.name}</div>
                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                    {template.description}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {template.subject}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {template.gradeLevel.map((grade) => (
                                                <Badge key={grade} variant="secondary" className="text-xs">
                                                    {grade}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getOutputTypeColor(template.outputType)}>
                                            {getOutputTypeLabel(template.outputType)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getDifficultyColor(template.difficulty)}>
                                            {getDifficultyLabel(template.difficulty)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-gray-600">
                                            {template.variables?.length || 0} biến
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-gray-600">
                                            {template.examples?.length || 0} ví dụ
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onPreview(template)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Xem trước
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onEdit(template)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Chỉnh sửa
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => onDelete(template.id!)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Xóa
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Results Summary */}
            {!loading && templates.length > 0 && (
                <div className="text-sm text-gray-500">
                    Hiển thị {templates.length} template
                    {selectedTemplates.length > 0 && ` • Đã chọn ${selectedTemplates.length} mục`}
                </div>
            )}
        </div>
    );
});

export default TemplatesTable;