/**
 * Client-Side Performance Optimization Utilities
 * Provides React.memo, useMemo, virtual scrolling, and lazy loading optimizations
 */

import { memo, useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { debounce } from 'lodash';

/**
 * Performance configuration
 */
export const PERFORMANCE_CONFIG = {
    DEBOUNCE_DELAY: 300,
    VIRTUAL_SCROLL_ITEM_HEIGHT: 60,
    VIRTUAL_SCROLL_BUFFER: 5,
    LAZY_LOAD_THRESHOLD: 0.1,
    MEMO_CACHE_SIZE: 100
} as const;

/**
 * Memoization utilities for expensive computations
 */
export class MemoizationUtils {
    /**
     * Memoize AI tools filtering and sorting
     */
    static useAIToolsFiltering = (tools: any[], filters: any) => {
        return useMemo(() => {
            if (!tools || tools.length === 0) return [];

            let filtered = tools;

            // Apply filters
            if (filters.search && typeof filters.search === 'string') {
                const searchLower = filters.search.toLowerCase();
                filtered = filtered.filter(tool =>
                    tool.name.toLowerCase().includes(searchLower) ||
                    tool.description.toLowerCase().includes(searchLower)
                );
            }

            if (filters.category) {
                filtered = filtered.filter(tool => tool.category === filters.category);
            }

            if (filters.subject) {
                filtered = filtered.filter(tool => tool.subject === filters.subject);
            }

            if (filters.difficulty) {
                filtered = filtered.filter(tool => tool.difficulty === filters.difficulty);
            }

            // Apply sorting
            if (filters.sortBy) {
                filtered.sort((a, b) => {
                    const aVal = a[filters.sortBy];
                    const bVal = b[filters.sortBy];

                    if (filters.sortOrder === 'desc') {
                        return bVal > aVal ? 1 : -1;
                    }
                    return aVal > bVal ? 1 : -1;
                });
            }

            return filtered;
        }, [tools, filters]);
    };

    /**
     * Memoize templates filtering and sorting
     */
    static useTemplatesFiltering = (templates: any[], filters: any) => {
        return useMemo(() => {
            if (!templates || templates.length === 0) return [];

            let filtered = templates;

            // Apply filters
            if (filters.search && typeof filters.search === 'string') {
                const searchLower = filters.search.toLowerCase();
                filtered = filtered.filter(template =>
                    template.name.toLowerCase().includes(searchLower) ||
                    template.description.toLowerCase().includes(searchLower)
                );
            }

            if (filters.subject) {
                filtered = filtered.filter(template => template.subject === filters.subject);
            }

            if (filters.outputType) {
                filtered = filtered.filter(template => template.outputType === filters.outputType);
            }

            if (filters.difficulty) {
                filtered = filtered.filter(template => template.difficulty === filters.difficulty);
            }

            // Apply sorting
            if (filters.sortBy) {
                filtered.sort((a, b) => {
                    const aVal = a[filters.sortBy];
                    const bVal = b[filters.sortBy];

                    if (filters.sortOrder === 'desc') {
                        return bVal > aVal ? 1 : -1;
                    }
                    return aVal > bVal ? 1 : -1;
                });
            }

            return filtered;
        }, [templates, filters]);
    };

    /**
     * Memoize dashboard statistics
     */
    static useDashboardStats = (rawData: any) => {
        return useMemo(() => {
            if (!rawData) return null;

            const stats = {
                totalAITools: rawData.aiTools?.length || 0,
                totalTemplates: rawData.templates?.length || 0,
                totalUsers: rawData.users?.length || 0,
                recentActivity: rawData.recentActivity || []
            };

            return stats;
        }, [rawData]);
    };
}

/**
 * Performance monitoring hook
 */
export const usePerformanceMonitoring = () => {
    const [metrics, setMetrics] = useState({
        renderTime: 0,
        memoryUsage: 0,
        componentCount: 0
    });

    const startTime = useRef<number>(0);

    const startMeasure = useCallback(() => {
        startTime.current = performance.now();
    }, []);

    const endMeasure = useCallback((componentName: string) => {
        const endTime = performance.now();
        const renderTime = endTime - startTime.current;

        setMetrics(prev => ({
            ...prev,
            renderTime,
            componentCount: prev.componentCount + 1
        }));

        if (process.env.NODE_ENV === 'development') {
            console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
        }
    }, []);

    return { metrics, startMeasure, endMeasure };
};

/**
 * Debounced search hook
 */
export const useDebouncedSearch = (initialValue: string = '', delay: number = PERFORMANCE_CONFIG.DEBOUNCE_DELAY) => {
    const [value, setValue] = useState(initialValue);
    const [debouncedValue, setDebouncedValue] = useState(initialValue);

    const debouncedSetValue = useMemo(
        () => debounce((newValue: string) => {
            setDebouncedValue(newValue);
        }, delay),
        [delay]
    );

    useEffect(() => {
        debouncedSetValue(value);
        return () => {
            debouncedSetValue.cancel();
        };
    }, [value, debouncedSetValue]);

    return [debouncedValue, setValue] as const;
};

/**
 * Virtual scrolling hook for large lists
 */
export const useVirtualScroll = (
    items: any[],
    itemHeight: number = PERFORMANCE_CONFIG.VIRTUAL_SCROLL_ITEM_HEIGHT,
    containerHeight: number = 400
) => {
    const [scrollTop, setScrollTop] = useState(0);
    const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

    const visibleCount = Math.ceil(containerHeight / itemHeight) + PERFORMANCE_CONFIG.VIRTUAL_SCROLL_BUFFER;
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + visibleCount, items.length);

    const visibleItems = useMemo(() => {
        return items.slice(startIndex, endIndex).map((item, index) => ({
            ...item,
            index: startIndex + index
        }));
    }, [items, startIndex, endIndex]);

    const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    }, []);

    return {
        visibleItems,
        containerRef: setContainerRef,
        onScroll,
        totalHeight: items.length * itemHeight,
        offsetY: startIndex * itemHeight
    };
};

/**
 * Lazy loading component
 */
export const LazyComponent: React.FC<{
    children: React.ReactNode;
    fallback?: React.ReactNode;
    threshold?: number;
}> = ({ children, fallback = <div>Loading...</div>, threshold = PERFORMANCE_CONFIG.LAZY_LOAD_THRESHOLD }) => {
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => observer.disconnect();
    }, [threshold]);

    return (
        <div ref={elementRef}>
            {isVisible ? children : fallback}
        </div>
    );
};

/**
 * Memoized table row component
 */
interface OptimizedTableRowProps {
    item: any;
    columns: Array<{
        key: string;
        label: string;
        render?: (value: any, item: any) => React.ReactNode;
    }>;
    onEdit: (item: any) => void;
    onDelete: (item: any) => void;
    isSelected: boolean;
    onSelect: (item: any) => void;
}

export const OptimizedTableRow = memo<OptimizedTableRowProps>(({
    item,
    columns,
    onEdit,
    onDelete,
    isSelected,
    onSelect
}) => {
    const handleEdit = useCallback(() => onEdit(item), [item, onEdit]);
    const handleDelete = useCallback(() => onDelete(item), [item, onDelete]);
    const handleSelect = useCallback(() => onSelect(item), [item, onSelect]);

    return (
        <tr className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
            <td className="px-6 py-4 whitespace-nowrap">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={handleSelect}
                    className="rounded border-gray-300"
                />
            </td>
            {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(item[column.key], item) : item[column.key]}
                </td>
            ))}
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                    onClick={handleEdit}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                    Sửa
                </button>
                <button
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-900"
                >
                    Xóa
                </button>
            </td>
        </tr>
    );
});

OptimizedTableRow.displayName = 'OptimizedTableRow';

/**
 * Optimized filter component
 */
interface OptimizedFilterProps {
    filters: any;
    onFilterChange: (key: string, value: any) => void;
    options: {
        categories?: string[];
        subjects?: string[];
        difficulties?: string[];
        outputTypes?: string[];
    };
}

export const OptimizedFilter = memo<OptimizedFilterProps>(({
    filters,
    onFilterChange,
    options
}) => {
    const [search, setSearch] = useDebouncedSearch(filters.search || '');

    useEffect(() => {
        onFilterChange('search', search);
    }, [search, onFilterChange]);

    const handleFilterChange = useCallback((key: string, value: string) => {
        onFilterChange(key, value || undefined);
    }, [onFilterChange]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tìm kiếm
                </label>
                <input
                    type="text"
                    value={filters.search || ''}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Nhập từ khóa..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {options.categories && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Danh mục
                    </label>
                    <select
                        value={filters.category || ''}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tất cả danh mục</option>
                        {options.categories.map((category: string) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {options.subjects && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Môn học
                    </label>
                    <select
                        value={filters.subject || ''}
                        onChange={(e) => handleFilterChange('subject', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tất cả môn học</option>
                        {options.subjects.map((subject: string) => (
                            <option key={subject} value={subject}>
                                {subject}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {options.difficulties && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Độ khó
                    </label>
                    <select
                        value={filters.difficulty || ''}
                        onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tất cả độ khó</option>
                        {options.difficulties.map((difficulty: string) => (
                            <option key={difficulty} value={difficulty}>
                                {difficulty}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
});

OptimizedFilter.displayName = 'OptimizedFilter';

/**
 * Virtual scroll table component
 */
interface VirtualScrollTableProps {
    items: any[];
    columns: Array<{
        key: string;
        label: string;
        render?: (value: any, item: any) => React.ReactNode;
    }>;
    onEdit: (item: any) => void;
    onDelete: (item: any) => void;
    selectedItems: Set<string>;
    onSelectItem: (item: any) => void;
    containerHeight?: number;
}

export const VirtualScrollTable = memo<VirtualScrollTableProps>(({
    items,
    columns,
    onEdit,
    onDelete,
    selectedItems,
    onSelectItem,
    containerHeight = 400
}) => {
    const { visibleItems, containerRef, onScroll, totalHeight, offsetY } = useVirtualScroll(
        items,
        PERFORMANCE_CONFIG.VIRTUAL_SCROLL_ITEM_HEIGHT,
        containerHeight
    );

    return (
        <div className="overflow-hidden border border-gray-200 rounded-lg">
            <div className="overflow-x-auto">
                <div
                    ref={containerRef}
                    onScroll={onScroll}
                    style={{ height: containerHeight, overflow: 'auto' }}
                    className="relative"
                >
                    <div style={{ height: totalHeight, position: 'relative' }}>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <input type="checkbox" className="rounded border-gray-300" />
                                    </th>
                                    {columns.map((column) => (
                                        <th
                                            key={column.key}
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            {column.label}
                                        </th>
                                    ))}
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody
                                className="bg-white divide-y divide-gray-200"
                                style={{ transform: `translateY(${offsetY}px)` }}
                            >
                                {visibleItems.map((item) => (
                                    <OptimizedTableRow
                                        key={item.id}
                                        item={item}
                                        columns={columns}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        isSelected={selectedItems.has(item.id)}
                                        onSelect={onSelectItem}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
});

VirtualScrollTable.displayName = 'VirtualScrollTable';

/**
 * Preload admin components for better performance
 */
export const preloadAdminComponents = () => {
    // Preload critical admin components
    if (typeof window !== 'undefined') {
        import('@/components/admin/dashboard/DashboardStats');
        import('@/components/admin/templates/TemplatesTable');
        import('@/components/admin/ai-tools/AIToolsTable');
    }
};