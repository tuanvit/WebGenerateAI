'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TemplateStats {
    totalTemplates: number;
    bySubject: Record<string, number>;
    byOutputType: Record<string, number>;
    byGradeLevel: Record<string, number>;
}

export default function TemplatesOverview() {
    const [stats, setStats] = useState<TemplateStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const response = await fetch('/api/templates/stats');
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Error loading template stats:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    const outputTypeNames: Record<string, string> = {
        'lesson-plan': 'Giáo án',
        'presentation': 'Bài thuyết trình',
        'assessment': 'Đánh giá',
        'interactive': 'Tương tác',
        'research': 'Nghiên cứu'
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    📚 Thư viện Templates
                </h3>
                <Link
                    href="/templates"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                    Xem tất cả →
                </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                        {stats.totalTemplates}
                    </div>
                    <div className="text-sm text-gray-600">Templates</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                        {Object.keys(stats.bySubject).length}
                    </div>
                    <div className="text-sm text-gray-600">Môn học</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                        {Object.keys(stats.byOutputType).length}
                    </div>
                    <div className="text-sm text-gray-600">Loại đầu ra</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                        4
                    </div>
                    <div className="text-sm text-gray-600">Lớp (6-9)</div>
                </div>
            </div>

            {/* Subject Breakdown */}
            <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Templates theo môn học:</h4>
                <div className="space-y-2">
                    {Object.entries(stats.bySubject)
                        .sort(([, a], [, b]) => b - a)
                        .map(([subject, count]) => (
                            <div key={subject} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                                    <span className="text-sm text-gray-700">{subject}</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">{count}</span>
                            </div>
                        ))}
                </div>
            </div>

            {/* Output Type Breakdown */}
            <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Templates theo loại đầu ra:</h4>
                <div className="space-y-2">
                    {Object.entries(stats.byOutputType)
                        .sort(([, a], [, b]) => b - a)
                        .map(([type, count]) => (
                            <div key={type} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                                    <span className="text-sm text-gray-700">
                                        {outputTypeNames[type] || type}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">{count}</span>
                            </div>
                        ))}
                </div>
            </div>

            {/* Call to Action */}
            <div className="border-t border-gray-200 pt-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/templates"
                        className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        🔍 Duyệt Templates
                    </Link>
                    <Link
                        href="/create-prompt"
                        className="flex-1 px-4 py-2 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                        ✨ Tạo Prompt
                    </Link>
                </div>
            </div>
        </div>
    );
}