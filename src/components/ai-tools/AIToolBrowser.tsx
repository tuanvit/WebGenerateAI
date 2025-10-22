'use client';

import React, { useState, useEffect } from 'react';
import { AITool, AIToolCategory } from '@/services/ai-tool-recommendation';
import AIToolDetails from './AIToolDetails';

interface AIToolBrowserProps {
    onToolSelect?: (tool: AITool) => void;
}

export default function AIToolBrowser({ onToolSelect }: AIToolBrowserProps) {
    const [selectedCategory, setSelectedCategory] = useState<AIToolCategory | 'all'>('all');
    const [selectedSubject, setSelectedSubject] = useState<string>('all');
    const [tools, setTools] = useState<AITool[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedToolForDetails, setSelectedToolForDetails] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const categories = [
        { id: 'all', name: 'Tất cả', icon: '🔧' },
        { id: AIToolCategory.TEXT_GENERATION, name: 'Tạo văn bản', icon: '📝' },
        { id: AIToolCategory.PRESENTATION, name: 'Thuyết trình', icon: '📊' },
        { id: AIToolCategory.VIDEO, name: 'Video', icon: '🎥' },
        { id: AIToolCategory.SIMULATION, name: 'Mô phỏng', icon: '🔬' },
        { id: AIToolCategory.IMAGE, name: 'Hình ảnh', icon: '🎨' },
        { id: AIToolCategory.DATA_ANALYSIS, name: 'Phân tích dữ liệu', icon: '📈' },
        { id: AIToolCategory.ASSESSMENT, name: 'Đánh giá', icon: '📋' },
        { id: AIToolCategory.SUBJECT_SPECIFIC, name: 'Chuyên môn', icon: '🎯' },
    ];

    const subjects = [
        'all',
        'Toán',
        'Văn',
        'Khoa học tự nhiên',
        'Lịch sử & Địa lí',
        'Giáo dục công dân',
        'Công nghệ'
    ];

    useEffect(() => {
        fetchTools();
    }, [selectedCategory, selectedSubject, searchQuery]);

    const fetchTools = async () => {
        setLoading(true);
        try {
            let url = '/api/ai-tools/recommendations?';
            const params = new URLSearchParams();

            if (searchQuery.trim()) {
                params.append('q', searchQuery.trim());
            } else if (selectedCategory !== 'all') {
                params.append('category', selectedCategory);
            } else if (selectedSubject !== 'all') {
                params.append('subject', selectedSubject);
            } else {
                // Get all tools by searching with empty query
                params.append('q', '');
            }

            const response = await fetch(url + params.toString());
            const result = await response.json();

            if (result.success) {
                let filteredTools = result.data;

                // Apply additional client-side filtering if needed
                if (selectedSubject !== 'all' && selectedCategory !== 'all') {
                    filteredTools = filteredTools.filter((tool: AITool) =>
                        tool.subjects.includes(selectedSubject) && tool.category === selectedCategory
                    );
                }

                setTools(filteredTools);
            }
        } catch (error) {
            console.error('Error fetching tools:', error);
            setTools([]);
        } finally {
            setLoading(false);
        }
    };

    const handleToolClick = (tool: AITool) => {
        if (onToolSelect) {
            onToolSelect(tool);
        } else {
            setSelectedToolForDetails(tool.id);
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        const colors = {
            beginner: 'bg-green-100 text-green-800',
            intermediate: 'bg-yellow-100 text-yellow-800',
            advanced: 'bg-red-100 text-red-800',
        };
        return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getDifficultyText = (difficulty: string) => {
        const texts = {
            beginner: 'Dễ',
            intermediate: 'TB',
            advanced: 'Khó',
        };
        return texts[difficulty as keyof typeof texts] || difficulty;
    };

    return (
        <div className="space-y-6">
            {/* Search and Filters */}
            <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm công cụ AI..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                </div>

                {/* Category Filter */}
                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Loại công cụ</h3>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id as AIToolCategory | 'all')}
                                className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${selectedCategory === category.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <span>{category.icon}</span>
                                <span>{category.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Subject Filter */}
                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Môn học</h3>
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">Tất cả môn học</option>
                        {subjects.slice(1).map((subject) => (
                            <option key={subject} value={subject}>
                                {subject}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Results */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Kết quả tìm kiếm
                    </h3>
                    <span className="text-sm text-gray-500">
                        {loading ? 'Đang tải...' : `${tools.length} công cụ`}
                    </span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-200 rounded-lg h-32"></div>
                            </div>
                        ))}
                    </div>
                ) : tools.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tools.map((tool) => (
                            <div
                                key={tool.id}
                                onClick={() => handleToolClick(tool)}
                                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-2xl">
                                            {categories.find(c => c.id === tool.category)?.icon || '🔧'}
                                        </span>
                                        <div>
                                            <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                                                {tool.name}
                                            </h4>
                                            <span className="text-xs text-gray-500">
                                                {categories.find(c => c.id === tool.category)?.name}
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

                                <div className="space-y-2">
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
                                        <span className="text-blue-600 group-hover:text-blue-800 text-sm font-medium">
                                            Xem chi tiết →
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <span className="text-4xl mb-4 block">🔍</span>
                        <h3 className="text-lg font-medium mb-2">Không tìm thấy công cụ nào</h3>
                        <p className="text-sm">Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
                    </div>
                )}
            </div>

            {/* Tool Details Modal */}
            {selectedToolForDetails && (
                <AIToolDetails
                    toolId={selectedToolForDetails}
                    onClose={() => setSelectedToolForDetails(null)}
                />
            )}
        </div>
    );
}