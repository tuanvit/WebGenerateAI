'use client';

import { useState, useEffect } from 'react';
import TemplateManager from '@/components/templates/TemplateManager';
import { PromptTemplate } from '@/services/templates/SubjectTemplateService';

interface TemplateStats {
    totalTemplates: number;
    bySubject: Record<string, number>;
    byOutputType: Record<string, number>;
    byGradeLevel: Record<string, number>;
}

export default function TemplatesPage() {
    const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
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
                console.error('Error loading stats:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    const handleSelectTemplate = (template: PromptTemplate) => {
        setSelectedTemplate(template);
        // Redirect to create-prompt page with the template
        window.location.href = `/create-prompt?template=${template.id}`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header với thống kê tổng quan */}
                <div className="mb-8">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            📚 Thư viện Templates AI
                        </h1>
                        <p className="text-lg text-gray-600">
                            Khám phá và sử dụng các template chuyên nghiệp cho việc tạo prompt AI
                        </p>
                    </div>

                    {/* Thống kê nhanh */}
                    {!loading && stats && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                                <div className="text-2xl font-bold text-blue-600 mb-1">
                                    {stats.totalTemplates}
                                </div>
                                <div className="text-sm text-gray-600">Tổng Templates</div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                                <div className="text-2xl font-bold text-green-600 mb-1">
                                    {Object.keys(stats.bySubject).length}
                                </div>
                                <div className="text-sm text-gray-600">Môn học</div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                                <div className="text-2xl font-bold text-purple-600 mb-1">
                                    {Object.keys(stats.byOutputType).length}
                                </div>
                                <div className="text-sm text-gray-600">Loại đầu ra</div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                                <div className="text-2xl font-bold text-orange-600 mb-1">
                                    4
                                </div>
                                <div className="text-sm text-gray-600">Lớp (6-9)</div>
                            </div>
                        </div>
                    )}

                    {/* Thống kê chi tiết */}
                    {!loading && stats && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {/* Theo môn học */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    📖 Theo môn học
                                </h3>
                                <div className="space-y-2">
                                    {Object.entries(stats.bySubject).map(([subject, count]) => (
                                        <div key={subject} className="flex justify-between items-center">
                                            <span className="text-sm text-gray-700">{subject}</span>
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                                {count}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Theo loại đầu ra */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    🎯 Theo loại đầu ra
                                </h3>
                                <div className="space-y-2">
                                    {Object.entries(stats.byOutputType).map(([type, count]) => {
                                        const typeNames: Record<string, string> = {
                                            'lesson-plan': 'Kế hoạch bài dạy',
                                            'presentation': 'Bài thuyết trình',
                                            'assessment': 'Đánh giá',
                                            'interactive': 'Tương tác',
                                            'research': 'Nghiên cứu'
                                        };
                                        return (
                                            <div key={type} className="flex justify-between items-center">
                                                <span className="text-sm text-gray-700">
                                                    {typeNames[type] || type}
                                                </span>
                                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                                    {count}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Theo lớp */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    🎓 Theo lớp học
                                </h3>
                                <div className="space-y-2">
                                    {Object.entries(stats.byGradeLevel).map(([grade, count]) => (
                                        <div key={grade} className="flex justify-between items-center">
                                            <span className="text-sm text-gray-700">
                                                {grade.replace('grade-', 'Lớp ')}
                                            </span>
                                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                                                {count}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Template Manager */}
                <TemplateManager
                    onSelectTemplate={handleSelectTemplate}
                    selectedTemplateId={selectedTemplate?.id}
                    showCreateButton={false}
                />
            </div>
        </div>
    );
}