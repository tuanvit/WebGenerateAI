/**
 * Client-Side Performance Optimization Utilities
 * Provides React.memo, useMemo, virtual scrolling, and lazy loading optimizations
 */

import { memo, useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import { input } from '@testing-library/user-event/dist/cjs/event/input.js';
import { number } from 'zod';
import React from 'react';
import React from 'react';
import { type } from 'os';
import { input } from 'zod';
import style from 'styled-jsx/style';
import style from 'styled-jsx/style';
import { type } from 'os';
import { input } from '@testing-library/user-event/dist/cjs/event/input.js';
import { type } from 'os';
import { input } from 'zod';
import { input } from 'zod';
import { number } from 'zod';
import { type } from 'os';
import { type } from 'os';
import style from 'styled-jsx/style';
import style from 'styled-jsx/style';
import { type } from 'os';
import { type } from 'os';

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

            let filtered = [...tools];

            // Apply search filter
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                filtered = filtered.filter(tool =>
                    tool.name.toLowerCase().includes(searchTerm) ||
                    tool.description.toLowerCase().includes(searchTerm) ||
                    tool.useCase.toLowerCase().includes(searchTerm)
                );
            }

            // Apply category filter
            if (filters.category) {
                filtered = filtered.filter(tool => tool.category === filters.category);
            }

            // Apply subject filter
            if (filters.subject) {
                filtered = filtered.filter(tool =>
                    tool.subjects.includes(filters.subject)
                );
            }

            // Apply grade level filter
            if (filters.gradeLevel) {
                filtered = filtered.filter(tool =>
                    tool.gradeLevel.includes(filters.gradeLevel)
                );
            }

            // Apply difficulty filter
            if (filters.difficulty) {
                filtered = filtered.filter(tool => tool.difficulty === filters.difficulty);
            }

            // Apply pricing model filter
            if (filters.pricingModel) {
                filtered = filtered.filter(tool => tool.pricingModel === filters.pricingModel);
            }

            // Apply Vietnamese support filter
            if (filters.vietnameseSupport !== undefined) {
                filtered = filtered.filter(tool => tool.vietnameseSupport === filters.vietnameseSupport);
            }

            // Apply sorting
            if (filters.sortBy) {
                filtered.sort((a, b) => {
                    const aValue = a[filters.sortBy];
                    const bValue = b[filters.sortBy];

                    if (filters.sortOrder === 'asc') {
                        return aValue > bValue ? 1 : -1;
                    } else {
                        return aValue < bValue ? 1 : -1;
                    }
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

            let filtered = [...templates];

            // Apply search filter
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                filtered = filtered.filter(template =>
                    template.name.toLowerCase().includes(searchTerm) ||
                    template.description.toLowerCase().includes(searchTerm) ||
                    template.templateContent.toLowerCase().includes(searchTerm)
                );
            }

            // Apply subject filter
            if (filters.subject) {
                filtered = filtered.filter(template => template.subject === filters.subject);
            }

            // Apply grade level filter
            if (filters.gradeLevel) {
                filtered = filtered.filter(template =>
                    template.gradeLevel.includes(filters.gradeLevel)
                );
            }

            // Apply output type filter
            if (filters.outputType) {
                filtered = filtered.filter(template => template.outputType === filters.outputType);
            }

            // Apply difficulty filter
            if (filters.difficulty) {
                filtered = filtered.filter(template => template.difficulty === filters.difficulty);
            }

            // Apply sorting
            if (filters.sortBy) {
                filtered.sort((a, b) => {
                    const aValue = a[filters.sortBy];
                    const bValue = b[filters.sortBy];

                    if (filters.sortOrder === 'asc') {
                        return aValue > bValue ? 1 : -1;
                    } else {
                        return aValue < bValue ? 1 : -1;
                    }
                });
            }

            return filtered;
        }, [templates, filters]);
    };

    /**
     * Memoize dashboard statistics calculations
     */
    static useDashboardStats = (rawData: any) => {
        return useMemo(() => {
            if (!rawData) return null;

            const stats = {
                totalAITools: rawData.aiTools?.length || 0,
                totalTemplates: rawData.templates?.length || 0,
                categoryDistribution: {},
                subjectDistribution: {},
                difficultyDistribution: {},
                recentActivity: []
            };

            // Calculate category distribution
            if (rawData.aiTools) {
                stats.categoryDistribution = rawData.aiTools.reduce((acc: any, tool: any) => {
                    acc[tool.category] = (acc[tool.category] || 0) + 1;
                    return acc;
                }, {});
            }

            // Calculate subject distribution
            if (rawData.templates) {
                stats.subjectDistribution = rawData.templates.reduce((acc: any, template: any) => {
                    acc[template.subject] = (acc[template.subject] || 0) + 1;
                    return acc;
                }, {});
            }

            // Calculate difficulty distribution
            if (rawData.aiTools && rawData.templates) {
                const allItems = [...rawData.aiTools, ...rawData.templates];
                stats.difficultyDistribution = allItems.reduce((acc: any, item: any) => {
                    acc[item.difficulty] = (acc[item.difficulty] || 0) + 1;
                    return acc;
                }, {});
            }

            return stats;
        }, [rawData]);
    };
}

/**
 * Debounced search hook for performance optimization
 */
export const useDebouncedSearch = (initialValue: string = '', delay: number = PERFORMANCE_CONFIG.DEBOUNCE_DELAY) => {
    const [value, setValue] = useState(initialValue);
    const [debouncedValue, setDebouncedValue] = useState(initialValue);

    const debouncedSetValue = useCallback(
        debounce((newValue: string) => {
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
 * Virtual scrolling hook for large datasets
 */
export const useVirtualScrolling = (
    items: any[],
    containerHeight: number,
    itemHeight: number = PERFORMANCE_CONFIG.VIRTUAL_SCROLL_ITEM_HEIGHT
) => {
    const [scrollTop, setScrollTop] = useState(0);
    const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

    const visibleItemsCount = Math.ceil(containerHeight / itemHeight);
    const bufferSize = PERFORMANCE_CONFIG.VIRTUAL_SCROLL_BUFFER;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
    const endIndex = Math.min(items.length, startIndex + visibleItemsCount + bufferSize * 2);

    const visibleItems = useMemo(() => {
        return items.slice(startIndex, endIndex).map((item, index) => ({
            ...item,
            index: startIndex + index,
            top: (startIndex + index) * itemHeight
        }));
    }, [items, startIndex, endIndex, itemHeight]);

    const totalHeight = items.length * itemHeight;

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    }, []);

    return {
        visibleItems,
        totalHeight,
        containerRef: setContainerRef,
        onScroll: handleScroll,
        startIndex,
        endIndex
    };
};

/**
 * Lazy loading hook for components
 */
export const useLazyLoading = (threshold: number = PERFORMANCE_CONFIG.LAZY_LOAD_THRESHOLD) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isLoaded) {
                    setIsVisible(true);
                    setIsLoaded(true);
                }
            },
            { threshold }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            if (elementRef.current) {
                observer.unobserve(elementRef.current);
            }
        };
    }, [threshold, isLoaded]);

    return { isVisible, isLoaded, elementRef };
};

/**
 * Performance monitoring hook
 */
export const usePerformanceMonitoring = (componentName: string) => {
    const renderStartTime = useRef<number>(Date.now());
    const [renderTime, setRenderTime] = useState<number>(0);

    useEffect(() => {
        const endTime = Date.now();
        const duration = endTime - renderStartTime.current;
        setRenderTime(duration);

        // Log slow renders
        if (duration > 100) {
            console.warn(`Slow render detected in ${componentName}: ${duration}ms`);
        }
    });

    useEffect(() => {
        renderStartTime.current = Date.now();
    });

    return { renderTime };
};

/**
 * Optimized table row component with React.memo
 */
export const OptimizedTableRow = memo(({
    item,
    columns,
    onEdit,
    onDelete,
    isSelected,
    onSelect
}: {
    item: any;
    columns: any[];
    onEdit: (item: any) => void;
    onDelete: (item: any) => void;
    isSelected: boolean;
    onSelect: (item: any) => void;
}) => {
    const handleEdit = useCallback(() => onEdit(item), [item, onEdit]);
    const handleDelete = useCallback(() => onDelete(item), [item, onDelete]);
    const handleSelect = useCallback(() => onSelect(item), [item, onSelect]);

    return (
        <tr className= {`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`
}>
<td className="px-6 py-4 whitespace-nowrap" >
<input
                    type="checkbox"
                    checked = { isSelected }
                    onChange = { handleSelect }
                    className = "rounded border-gray-300"
    />
    </td>
            {
        columns.map((column) => (
            <td key= { column.key } className = "px-6 py-4 whitespace-nowrap text-sm text-gray-900" >
            { column.render ? column.render(item[column.key], item) : item[column.key] }
            </td>
        ))}
<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" >
    <button
                    onClick={ handleEdit }
className = "text-indigo-600 hover:text-indigo-900 mr-4"
    >
    Sửa
    </button>
    < button
onClick = { handleDelete }
className = "text-red-600 hover:text-red-900"
    >
    Xóa
    </button>
    </td>
    </tr>
    );
});

OptimizedTableRow.displayName = 'OptimizedTableRow';

/**
 * Optimized filter component with React.memo
 */
export const OptimizedFilter = memo(({
    filters,
    onFiltersChange,
    options
}: {
    filters: any;
    onFiltersChange: (filters: any) => void;
    options: any;
}) => {
    const [debouncedSearch, setSearch] = useDebouncedSearch(filters.search || '');

    useEffect(() => {
        if (debouncedSearch !== filters.search) {
            onFiltersChange({ ...filters, search: debouncedSearch });
        }
    }, [debouncedSearch, filters, onFiltersChange]);

    const handleFilterChange = useCallback((key: string, value: any) => {
        onFiltersChange({ ...filters, [key]: value });
    }, [filters, onFiltersChange]);

    return (
        <div className= "bg-white p-4 rounded-lg shadow mb-6" >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" >
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" >
                Tìm kiếm
                    </label>
                    < input
    type = "text"
    value = { filters.search || '' }
    onChange = {(e) => setSearch(e.target.value)}
placeholder = "Nhập từ khóa..."
className = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    </div>

{
    options.categories && (
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-2" >
            Danh mục
                </label>
                < select
    value = { filters.category || '' }
    onChange = {(e) => handleFilterChange('category', e.target.value)
}
className = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
    <option value="" > Tất cả danh mục </option>
{
    options.categories.map((category: string) => (
        <option key= { category } value = { category } >
        { category }
        </option>
    ))
}
</select>
    </div>
                )}

{
    options.subjects && (
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-2" >
            Môn học
                </label>
                < select
    value = { filters.subject || '' }
    onChange = {(e) => handleFilterChange('subject', e.target.value)
}
className = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
    <option value="" > Tất cả môn học </option>
{
    options.subjects.map((subject: string) => (
        <option key= { subject } value = { subject } >
        { subject }
        </option>
    ))
}
</select>
    </div>
                )}

{
    options.difficulties && (
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-2" >
            Độ khó
                </label>
                < select
    value = { filters.difficulty || '' }
    onChange = {(e) => handleFilterChange('difficulty', e.target.value)
}
className = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
    <option value="" > Tất cả độ khó </option>
{
    options.difficulties.map((difficulty: string) => (
        <option key= { difficulty } value = { difficulty } >
        { difficulty }
        </option>
    ))
}
</select>
    </div>
                )}
</div>
    </div>
    );
});

OptimizedFilter.displayName = 'OptimizedFilter';

/**
 * Virtual scrolling table component
 */
export const VirtualScrollTable = memo(({
    items,
    columns,
    onEdit,
    onDelete,
    selectedItems,
    onSelectItem,
    containerHeight = 400
}: {
    items: any[];
    columns: any[];
    onEdit: (item: any) => void;
    onDelete: (item: any) => void;
    selectedItems: Set<string>;
    onSelectItem: (item: any) => void;
    containerHeight?: number;
}) => {
    const {
        visibleItems,
        totalHeight,
        containerRef,
        onScroll
    } = useVirtualScrolling(items, containerHeight);

    return (
        <div className= "bg-white shadow overflow-hidden sm:rounded-md" >
        <div
                ref={ containerRef }
    onScroll = { onScroll }
    style = {{ height: containerHeight, overflow: 'auto' }
}
                className = "relative"
    >
    <div style={{ height: totalHeight, position: 'relative' }}>
        <table className="min-w-full divide-y divide-gray-200" >
            <thead className="bg-gray-50 sticky top-0 z-10" >
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" >
                    <input type="checkbox" className = "rounded border-gray-300" />
                        </th>
{
    columns.map((column) => (
        <th
                                        key= { column.key }
                                        className = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
        >
        { column.title }
        </th>
    ))
}
<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" >
    Thao tác
        </th>
        </tr>
        </thead>
        < tbody className = "bg-white divide-y divide-gray-200" >
        {
            visibleItems.map((item) => (
                <OptimizedTableRow
                                    key= { item.id }
                                    item = { item }
                                    columns = { columns }
                                    onEdit = { onEdit }
                                    onDelete = { onDelete }
                                    isSelected = { selectedItems.has(item.id) }
                                    onSelect = { onSelectItem }
                />
                            ))
        }
            </tbody>
            </table>
            </div>
            </div>
            </div>
    );
});

VirtualScrollTable.displayName = 'VirtualScrollTable';

/**
 * Lazy loaded component wrapper
 */
export const LazyComponent = memo(({
    children,
    fallback = <div>Đang tải...</div>,
    threshold = PERFORMANCE_CONFIG.LAZY_LOAD_THRESHOLD
}: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    threshold?: number;
}) => {
    const { isVisible, elementRef } = useLazyLoading(threshold);

    return (
        <div ref= { elementRef } >
        { isVisible? children: fallback }
        </div>
    );
});

LazyComponent.displayName = 'LazyComponent';