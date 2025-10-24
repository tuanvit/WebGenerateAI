'use client';

import React, { useState, useMemo, memo, useCallback } from 'react';
import { AIToolData } from '@/lib/admin/repositories/ai-tools-repository';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    MemoizationUtils,
    useDebouncedSearch,
    usePerformanceMonitoring,
    OptimizedFilter,
    VirtualScrollTable
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
    ExternalLink,
    ChevronUp,
    ChevronDown,
    Check,
    X
} from 'lucide-react';

interface AIToolsTableProps {
    tools: AIToolData[];
    loading?: boolean;
    onEdit: (tool: AIToolData) => void;
    onDelete: (toolId: string) => void;
    onBulkAction: (action: string, toolIds: string[]) => void;
    onSort: (field: string, direction: 'asc' | 'desc') => void;
    onFilter: (filters: AIToolFilters) => void;
    currentSort?: { field: string; direction: 'asc' | 'desc' };
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

const CATEGORIES = [
    { value: 'TEXT_GENERATION', label: 'Tạo văn bản' },
    { value: 'PRESENTATION', label: 'Thuyết trình' },
    { value: 'IMAGE', label: 'Hình ảnh' },
    { value: 'VIDEO', label: 'Video' },
    { value: 'SIMULATION', label: 'Mô phỏng' },
    { value: 'ASSESSMENT', label: 'Đánh giá' },
    { value: 'DATA_ANALYSIS', label: 'Phân tích dữ liệu' }
];

const SUBJECTS = [
    'Toán',
    'Văn',
    'Khoa học tự nhiên',
    'Lịch sử & Địa lí',
    'Giáo dục công dân',
    'Công nghệ'
];

const DIFFICULTIES = [
    { value: 'beginner', label: 'Cơ bản' },
    { value: 'intermediate', label: 'Trung bình' },
    { value: 'advanced', label: 'Nâng cao' }
];

const PRICING_MODELS = [
    { value: 'free', label: 'Miễn phí' },
    { value: 'freemium', label: 'Freemium' },
    { value: 'paid', label: 'Trả phí' }
];

const AIToolsTable = memo(function AIToolsTable({
    tools,
    loading = false,
    onEdit,
    onDelete,
    onBulkAction,
    onSort,
    onFilter,
    currentSort
}: AIToolsTableProps) {
    // Performance monitoring
    const { renderTime } = usePerformanceMonitoring('AIToolsTable');

    const [selectedTools, setSelectedTools] = useState<string[]>([]);
    const [filters, setFilters] = useState<AIToolFilters>({});
    const [showFilters, setShowFilters] = useState(false);

    // Memoized filtered and sorted tools
    const filteredTools = MemoizationUtils.useAIToolsFiltering(tools, filters);

    // Memoized selected tools set for performance
    const selectedToolsSet = useMemo(() => new Set(selectedTools), [selectedTools]);

    // Optimized callbacks
    const handleSelectAll = useCallback((checked: boolean) => {
        if (checked) {
            setSelectedTools(filteredTools.map(tool => tool.id!));
        } else {
            setSelectedTools([]);
        }
    }, [filteredTools]);

    const handleSelectTool = useCallback((toolId: string, checked: boolean) => {
        if (checked) {
            setSelectedTools(prev => [...prev, toolId]);
        } else {
            setSelectedTools(prev => prev.filter(id => id !== toolId));
        }
    }, []);

    const handleFilterChange = useCallback((key: keyof AIToolFilters, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilter(newFilters);
    }, [filters, onFilter]);

    const clearFilters = useCallback(() => {
        setFilters({});
        onFilter({});
    }, [onFilter]);

    const handleSort = useCallback((field: string) => {
        const direction = currentSort?.field === field && currentSort?.direction === 'asc' ? 'desc' : 'asc';
        onSort(field, direction);
    }, [currentSort, onSort]);

    // Get category label
    const getCategoryLabel = (category: string) => {
        return CATEGORIES.find(c => c.value === category)?.label || category;
    };

    // Get difficulty label
    const getDifficultyLabel = (difficulty: string) => {
        return DIFFICULTIES.find(d => d.value === difficulty)?.label || difficulty;
    };

    // Get pricing model label
    const getPricingModelLabel = (pricingModel: string) => {
        return PRICING_MODELS.find(p => p.value === pricingModel)?.label || pricingModel;
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

    // Get pricing model badge color
    const getPricingModelColor = (pricingModel: string) => {
        switch (pricingModel) {
            case 'free': return 'bg-green-100 text-green-800';
            case 'freemium': return 'bg-blue-100 text-blue-800';
            case 'paid': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const isAllSelected = tools.length > 0 && selectedTools.length === tools.length;
    const isIndeterminate = selectedTools.length > 0 && selectedTools.length < tools.length;

    return (
        <div className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Tìm kiếm công cụ AI..."
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
                        {Object.keys(filters).filter(key => filters[key as keyof AIToolFilters]).length > 0 && (
                            <Badge variant="secondary" className="ml-1">
                                {Object.keys(filters).filter(key => filters[key as keyof AIToolFilters]).length}
                            </Badge>
                        )}
                    </Button>
                    {selectedTools.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    Thao tác hàng loạt ({selectedTools.length})
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => onBulkAction('edit', selectedTools)}>
                                    Chỉnh sửa hàng loạt
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onBulkAction('export', selectedTools)}>
                                    Xuất dữ liệu
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => onBulkAction('delete', selectedTools)}
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
                                Danh mục
                            </label>
                            <Select
                                value={filters.category || ''}
                                onValueChange={(value) => handleFilterChange('category', value || undefined)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Tất cả danh mục" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Tất cả danh mục</SelectItem>
                                    {CATEGORIES.map(category => (
                                        <SelectItem key={category.value} value={category.value}>
                                            {category.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

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

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mô hình giá
                            </label>
                            <Select
                                value={filters.pricingModel || ''}
                                onValueChange={(value) => handleFilterChange('pricingModel', value || undefined)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Tất cả mô hình giá" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Tất cả mô hình giá</SelectItem>
                                    {PRICING_MODELS.map(pricing => (
                                        <SelectItem key={pricing.value} value={pricing.value}>
                                            {pricing.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Hỗ trợ tiếng Việt
                            </label>
                            <Select
                                value={filters.vietnameseSupport?.toString() || ''}
                                onValueChange={(value) => handleFilterChange('vietnameseSupport', value === '' ? undefined : value === 'true')}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Tất cả" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Tất cả</SelectItem>
                                    <SelectItem value="true">Có hỗ trợ</SelectItem>
                                    <SelectItem value="false">Không hỗ trợ</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-end">
                            <Button variant="outline" onClick={clearFilters}>
                                Xóa bộ lọc
                            </Button>
                        </div>
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
                                    Tên công cụ
                                    {currentSort?.field === 'name' && (
                                        currentSort.direction === 'asc' ?
                                            <ChevronUp className="h-4 w-4" /> :
                                            <ChevronDown className="h-4 w-4" />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-gray-50"
                                onClick={() => handleSort('category')}
                            >
                                <div className="flex items-center gap-1">
                                    Danh mục
                                    {currentSort?.field === 'category' && (
                                        currentSort.direction === 'asc' ?
                                            <ChevronUp className="h-4 w-4" /> :
                                            <ChevronDown className="h-4 w-4" />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead>Môn học</TableHead>
                            <TableHead>Lớp</TableHead>
                            <TableHead>Độ khó</TableHead>
                            <TableHead>Giá</TableHead>
                            <TableHead>Tiếng Việt</TableHead>
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
                        ) : tools.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                    Không tìm thấy công cụ AI nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            tools.map((tool) => (
                                <TableRow key={tool.id} className="hover:bg-gray-50">
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedTools.includes(tool.id!)}
                                            onCheckedChange={(checked) => handleSelectTool(tool.id!, checked as boolean)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div>
                                                <div className="font-medium">{tool.name}</div>
                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                    {tool.description}
                                                </div>
                                            </div>
                                            <a
                                                href={tool.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {getCategoryLabel(tool.category)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {tool.subjects.slice(0, 2).map((subject) => (
                                                <Badge key={subject} variant="secondary" className="text-xs">
                                                    {subject}
                                                </Badge>
                                            ))}
                                            {tool.subjects.length > 2 && (
                                                <Badge variant="secondary" className="text-xs">
                                                    +{tool.subjects.length - 2}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {tool.gradeLevel.map((grade) => (
                                                <Badge key={grade} variant="outline" className="text-xs">
                                                    {grade}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getDifficultyColor(tool.difficulty)}>
                                            {getDifficultyLabel(tool.difficulty)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getPricingModelColor(tool.pricingModel)}>
                                            {getPricingModelLabel(tool.pricingModel)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {tool.vietnameseSupport ? (
                                            <Check className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <X className="h-4 w-4 text-red-600" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEdit(tool)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Chỉnh sửa
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => onDelete(tool.id!)}
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
            {!loading && tools.length > 0 && (
                <div className="text-sm text-gray-500">
                    Hiển thị {tools.length} công cụ AI
                    {selectedTools.length > 0 && ` • Đã chọn ${selectedTools.length} mục`}
                </div>
            )}
        </div>
    );
});

export default AIToolsTable;