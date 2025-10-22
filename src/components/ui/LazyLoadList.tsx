'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface LazyLoadListProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    loadMore?: () => Promise<void>;
    hasMore?: boolean;
    loading?: boolean;
    itemHeight?: number;
    containerHeight?: number;
    threshold?: number;
    className?: string;
}

export function LazyLoadList<T>({
    items,
    renderItem,
    loadMore,
    hasMore = false,
    loading = false,
    itemHeight = 100,
    containerHeight = 600,
    threshold = 200,
    className = '',
}: LazyLoadListProps<T>) {
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
    const containerRef = useRef<HTMLDivElement>(null);
    const loadingRef = useRef(false);

    // Calculate visible items based on scroll position
    const calculateVisibleRange = useCallback(() => {
        if (!containerRef.current) return;

        const scrollTop = containerRef.current.scrollTop;
        const viewportHeight = containerRef.current.clientHeight;

        const start = Math.floor(scrollTop / itemHeight);
        const end = Math.min(
            items.length,
            Math.ceil((scrollTop + viewportHeight) / itemHeight) + 5 // Buffer
        );

        setVisibleRange({ start: Math.max(0, start - 2), end });
    }, [items.length, itemHeight]);

    // Handle scroll events
    const handleScroll = useCallback(() => {
        calculateVisibleRange();

        // Check if we need to load more items
        if (!containerRef.current || !loadMore || !hasMore || loadingRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

        if (scrollPercentage > 0.8) {
            loadingRef.current = true;
            loadMore().finally(() => {
                loadingRef.current = false;
            });
        }
    }, [calculateVisibleRange, loadMore, hasMore]);

    // Set up scroll listener
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('scroll', handleScroll, { passive: true });
        calculateVisibleRange(); // Initial calculation

        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll, calculateVisibleRange]);

    // Recalculate when items change
    useEffect(() => {
        calculateVisibleRange();
    }, [items, calculateVisibleRange]);

    const totalHeight = items.length * itemHeight;
    const offsetY = visibleRange.start * itemHeight;

    return (
        <div
            ref={containerRef}
            className={`overflow-auto ${className}`}
            style={{ height: containerHeight }}
        >
            <div style={{ height: totalHeight, position: 'relative' }}>
                <div
                    style={{
                        transform: `translateY(${offsetY}px)`,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                    }}
                >
                    {items.slice(visibleRange.start, visibleRange.end).map((item, index) => (
                        <div
                            key={visibleRange.start + index}
                            style={{ height: itemHeight }}
                            className="flex-shrink-0"
                        >
                            {renderItem(item, visibleRange.start + index)}
                        </div>
                    ))}
                </div>
            </div>

            {loading && (
                <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Đang tải thêm...</span>
                </div>
            )}

            {!hasMore && items.length > 0 && (
                <div className="text-center py-4 text-gray-500">
                    Đã hiển thị tất cả nội dung
                </div>
            )}
        </div>
    );
}

// Intersection Observer based lazy loading for images
interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
    placeholder?: string;
}

export function LazyImage({ src, alt, className = '', placeholder }: LazyImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={imgRef} className={`relative ${className}`}>
            {isInView && (
                <img
                    src={src}
                    alt={alt}
                    className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'
                        } ${className}`}
                    onLoad={() => setIsLoaded(true)}
                />
            )}

            {(!isInView || !isLoaded) && (
                <div className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`}>
                    {placeholder && (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            {placeholder}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Virtualized grid for large datasets
interface VirtualizedGridProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    itemWidth: number;
    itemHeight: number;
    gap?: number;
    containerWidth?: number;
    containerHeight?: number;
    loadMore?: () => Promise<void>;
    hasMore?: boolean;
    loading?: boolean;
}

export function VirtualizedGrid<T>({
    items,
    renderItem,
    itemWidth,
    itemHeight,
    gap = 16,
    containerWidth = 800,
    containerHeight = 600,
    loadMore,
    hasMore = false,
    loading = false,
}: VirtualizedGridProps<T>) {
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const itemsPerRow = Math.floor((containerWidth + gap) / (itemWidth + gap));
    const totalRows = Math.ceil(items.length / itemsPerRow);
    const rowHeight = itemHeight + gap;

    const startRow = Math.floor(scrollTop / rowHeight);
    const endRow = Math.min(
        totalRows,
        startRow + Math.ceil(containerHeight / rowHeight) + 1
    );

    const visibleItems = [];
    for (let row = startRow; row < endRow; row++) {
        for (let col = 0; col < itemsPerRow; col++) {
            const index = row * itemsPerRow + col;
            if (index < items.length) {
                visibleItems.push({
                    item: items[index],
                    index,
                    x: col * (itemWidth + gap),
                    y: row * rowHeight,
                });
            }
        }
    }

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const newScrollTop = e.currentTarget.scrollTop;
        setScrollTop(newScrollTop);

        // Load more check
        if (loadMore && hasMore && !loading) {
            const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
            if (scrollTop + clientHeight >= scrollHeight - 100) {
                loadMore();
            }
        }
    }, [loadMore, hasMore, loading]);

    return (
        <div
            ref={containerRef}
            className="overflow-auto"
            style={{ width: containerWidth, height: containerHeight }}
            onScroll={handleScroll}
        >
            <div
                style={{
                    height: totalRows * rowHeight,
                    position: 'relative',
                }}
            >
                {visibleItems.map(({ item, index, x, y }) => (
                    <div
                        key={index}
                        style={{
                            position: 'absolute',
                            left: x,
                            top: y,
                            width: itemWidth,
                            height: itemHeight,
                        }}
                    >
                        {renderItem(item, index)}
                    </div>
                ))}
            </div>

            {loading && (
                <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Đang tải thêm...</span>
                </div>
            )}
        </div>
    );
}