'use client';

import React, { useState, useEffect } from 'react';
import { AIToolDetails, AIToolCategory } from '@/services/ai-tool-recommendation';
import Link from 'next/link';

interface AIToolsBrowserWithFiltersProps {
    showHeader?: boolean;
    initialLimit?: number;
}

export default function AIToolsBrowserWithFilters({
    showHeader = true,
    initialLimit = 12
}: AIToolsBrowserWithFiltersProps) {
    const [tools, setTools] = useState<AIToolDetails[]>([]);
    const [filteredTools, setFilteredTools] = useState<AIToolDetails[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<AIToolCategory | 'all'>('all');
    const [selectedSubject, setSelectedSubject] = useState<string>('all');
    const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showOnlyVietnamese, setShowOnlyVietnamese] = useState(false);
    const [displayLimit, setDisplayLimit] = useState(initialLimit);
    const [loading, setLoading] = useState(true);

    // Lấy danh sách unique subjects và grades từ tools đã load
    const allSubjects = Array.from(new Set(tools.flatMap(tool => tool.subjects)));
    const allGrades = Array.from(new Set(tools.flatMap(tool => tool.gradeLevel))).sort();

    useEffect(() => {
        const loadAITools = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/ai-tools');
                if (response.ok) {
                    const aiTools = await response.json();

                    // Transform database format to AIToolDetails format
                    const transformedTools: AIToolDetails[] = aiTools.map((tool: any) => ({
                        id: tool.id,
                        name: tool.name,
                        description: tool.description,
                        url: tool.url,
                        category: tool.category as AIToolCategory,
                        subjects: tool.subjects,
                        gradeLevel: tool.gradeLevel,
                        useCase: tool.useCase,
                        vietnameseSupport: tool.vietnameseSupport,
                        difficulty: tool.difficulty,
                        features: tool.features,
                        pricingModel: tool.pricingModel,
                        integrationInstructions: tool.integrationInstructions || '',
                        samplePrompts: tool.samplePrompts || [],
                        relatedTools: tool.relatedTools || []
                    }));

                    setTools(transformedTools);
                    setFilteredTools(transformedTools.slice(0, initialLimit));
                } else {
                    console.error('Failed to load AI tools');
                    setTools([]);
                    setFilteredTools([]);
                }
            } catch (error) {
                console.error('Error loading AI tools:', error);
                setTools([]);
                setFilteredTools([]);
            } finally {
                setLoading(false);
            }
        };

        loadAITools();
    }, [initialLimit]);

    useEffect(() => {
        filterTools();
    }, [selectedCategory, selectedSubject, selectedGrade, searchQuery, showOnlyVietnamese, tools, displayLimit]);

    const filterTools = () => {
        let filtered = [...tools];

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(tool => tool.category === selectedCategory);
        }

        // Filter by subject
        if (selectedSubject !== 'all') {
            filtered = filtered.filter(tool => tool.subjects.includes(selectedSubject));
        }

        // Filter by grade
        if (selectedGrade !== 'all') {
            filtered = filtered.filter(tool => tool.gradeLevel.includes(selectedGrade as number));
        }

        // Filter by Vietnamese support
        if (showOnlyVietnamese) {
            filtered = filtered.filter(tool => tool.vietnameseSupport);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(tool =>
                tool.name.toLowerCase().includes(query) ||
                tool.description.toLowerCase().includes(query) ||
                tool.useCase.toLowerCase().includes(query) ||
                tool.subjects.some(subject => subject.toLowerCase().includes(query))
            );
        }

        setFilteredTools(filtered.slice(0, displayLimit));
    };

    const getCategoryIcon = (category: AIToolCategory) => {
        const icons = {
            [AIToolCategory.TEXT_GENERATION]: '📝',
            [AIToolCategory.PRESENTATION]: '📊',
            [AIToolCategory.VIDEO]: '🎥',
            [AIToolCategory.SIMULATION]: '🔬',
            [AIToolCategory.IMAGE]: '🎨',
            [AIToolCategory.DATA_ANALYSIS]: '📈',
            [AIToolCategory.ASSESSMENT]: '📋',
            [AIToolCategory.SUBJECT_SPECIFIC]: '🎯',
        };
        return icons[category] || '🔧';
    };

    const getCategoryName = (category: AIToolCategory) => {
        const names = {
            [AIToolCategory.TEXT_GENERATION]: 'Tạo văn bản',
            [AIToolCategory.PRESENTATION]: 'Thuyết trình',
            [AIToolCategory.VIDEO]: 'Video',
            [AIToolCategory.SIMULATION]: 'Mô phỏng',
            [AIToolCategory.IMAGE]: 'Hình ảnh',
            [AIToolCategory.DATA_ANALYSIS]: 'Phân tích dữ liệu',
            [AIToolCategory.ASSESSMENT]: 'Đánh giá',
            [AIToolCategory.SUBJECT_SPECIFIC]: 'Chuyên môn',
        };
        return names[category] || 'Khác';
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner': return 'bg-green-100 text-green-800';
            case 'intermediate': return 'bg-yellow-100 text-yellow-800';
            case 'advanced': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getDifficultyText = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner': return 'Dễ';
            case 'intermediate': return 'Trung bình';
            case 'advanced': return 'Khó';
            default: return 'Không xác định';
        }
    };

    const clearAllFilters = () => {
        setSelectedCategory('all');
        setSelectedSubject('all');
        setSelectedGrade('all');
        setSearchQuery('');
        setShowOnlyVietnamese(false);
    };

    const loadMore = () => {
        setDisplayLimit(prev => prev + 12);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                {showHeader && (
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-96"></div>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 rounded-lg h-48"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {showHeader && (
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                            🔥 Công cụ AI thịnh hành
                        </h3>
                        <p className="text-gray-600 mt-1">
                            Khám phá {tools.length} công cụ AI hỗ trợ giảng dạy THCS
                        </p>
                    </div>
                    <Link
                        href="/ai-tools"
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Xem trang chuyên biệt →
                    </Link>
                </div>
            )}

            {/* Search and Filters */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Tìm kiếm công cụ AI..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Filter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Category Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Danh mục
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value as AIToolCategory | 'all')}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">Tất cả danh mục</option>
                            {Object.values(AIToolCategory).map(category => (
                                <option key={category} value={category}>
                                    {getCategoryIcon(category)} {getCategoryName(category)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Subject Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Môn học
                        </label>
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">Tất cả môn học</option>
                            {allSubjects.map(subject => (
                                <option key={subject} value={subject}>
                                    {subject}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Grade Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Lớp
                        </label>
                        <select
                            value={selectedGrade}
                            onChange={(e) => setSelectedGrade(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">Tất cả lớp</option>
                            {allGrades.map(grade => (
                                <option key={grade} value={grade}>
                                    Lớp {grade}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Vietnamese Support Toggle */}
                    <div className="flex items-center">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showOnlyVietnamese}
                                onChange={(e) => setShowOnlyVietnamese(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                Chỉ hỗ trợ tiếng Việt
                            </span>
                        </label>
                    </div>
                </div>

                {/* Active Filters & Clear */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                        {selectedCategory !== 'all' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {getCategoryName(selectedCategory)}
                                <button
                                    onClick={() => setSelectedCategory('all')}
                                    className="ml-1 text-blue-600 hover:text-blue-800"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                        {selectedSubject !== 'all' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {selectedSubject}
                                <button
                                    onClick={() => setSelectedSubject('all')}
                                    className="ml-1 text-green-600 hover:text-green-800"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                        {selectedGrade !== 'all' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Lớp {selectedGrade}
                                <button
                                    onClick={() => setSelectedGrade('all')}
                                    className="ml-1 text-purple-600 hover:text-purple-800"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                        {showOnlyVietnamese && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                Hỗ trợ tiếng Việt
                                <button
                                    onClick={() => setShowOnlyVietnamese(false)}
                                    className="ml-1 text-orange-600 hover:text-orange-800"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                    </div>
                    {(selectedCategory !== 'all' || selectedSubject !== 'all' || selectedGrade !== 'all' || showOnlyVietnamese || searchQuery) && (
                        <button
                            onClick={clearAllFilters}
                            className="text-sm text-gray-600 hover:text-gray-800 underline"
                        >
                            Xóa tất cả bộ lọc
                        </button>
                    )}
                </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                    Hiển thị {filteredTools.length} công cụ
                    {searchQuery && ` cho "${searchQuery}"`}
                </p>
            </div>

            {/* Tools Grid */}
            {filteredTools.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Không tìm thấy công cụ nào
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
                    </p>
                    <button
                        onClick={clearAllFilters}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Xóa tất cả bộ lọc
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTools.map((tool) => (
                        <div
                            key={tool.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200 group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                    <span className="text-2xl">{getCategoryIcon(tool.category)}</span>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {tool.name}
                                        </h4>
                                        <span className="text-xs text-gray-500">
                                            {getCategoryName(tool.category)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end space-y-1">
                                    {tool.vietnameseSupport && (
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                            VN
                                        </span>
                                    )}
                                    <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(tool.difficulty)}`}>
                                        {getDifficultyText(tool.difficulty)}
                                    </span>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {tool.description}
                            </p>

                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-1">
                                    {tool.subjects.slice(0, 2).map((subject, index) => (
                                        <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                            {subject}
                                        </span>
                                    ))}
                                    {tool.subjects.length > 2 && (
                                        <span className="text-xs text-gray-500">
                                            +{tool.subjects.length - 2}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                        Lớp {tool.gradeLevel.join(', ')}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded ${tool.pricingModel === 'free' ? 'bg-green-100 text-green-800' :
                                        tool.pricingModel === 'freemium' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {tool.pricingModel === 'free' ? 'Miễn phí' :
                                            tool.pricingModel === 'freemium' ? 'Freemium' : 'Trả phí'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                    <Link
                                        href={`/ai-tools/${tool.id}`}
                                        className="text-sm text-gray-600 hover:text-blue-600 font-medium"
                                    >
                                        Chi tiết
                                    </Link>
                                    <a
                                        href={tool.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Dùng ngay
                                        <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Load More Button */}
            {filteredTools.length >= displayLimit && filteredTools.length < tools.filter(tool => {
                let filtered = true;
                if (selectedCategory !== 'all') filtered = filtered && tool.category === selectedCategory;
                if (selectedSubject !== 'all') filtered = filtered && tool.subjects.includes(selectedSubject);
                if (selectedGrade !== 'all') filtered = filtered && tool.gradeLevel.includes(selectedGrade as number);
                if (showOnlyVietnamese) filtered = filtered && tool.vietnameseSupport;
                if (searchQuery.trim()) {
                    const query = searchQuery.toLowerCase();
                    filtered = filtered && (
                        tool.name.toLowerCase().includes(query) ||
                        tool.description.toLowerCase().includes(query) ||
                        tool.useCase.toLowerCase().includes(query) ||
                        tool.subjects.some(subject => subject.toLowerCase().includes(query))
                    );
                }
                return filtered;
            }).length && (
                    <div className="text-center pt-6">
                        <button
                            onClick={loadMore}
                            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            Xem thêm công cụ
                            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                )}
        </div>
    );
}