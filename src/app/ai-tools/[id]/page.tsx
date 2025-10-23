'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AIToolDetails, AIToolCategory } from '@/services/ai-tool-recommendation';
import { AI_TOOLS_DATABASE } from '@/services/ai-tool-recommendation/ai-tools-data';
import Header from '@/components/layout/Header';
import Link from 'next/link';

export default function AIToolDetailPage() {
    const params = useParams();
    const [tool, setTool] = useState<AIToolDetails | null>(null);
    const [relatedTools, setRelatedTools] = useState<AIToolDetails[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            const foundTool = AI_TOOLS_DATABASE.find(t => t.id === params.id);
            setTool(foundTool || null);

            if (foundTool) {
                // Find related tools
                const related = AI_TOOLS_DATABASE
                    .filter(t =>
                        t.id !== foundTool.id &&
                        (t.category === foundTool.category ||
                            t.subjects.some(subject => foundTool.subjects.includes(subject)))
                    )
                    .slice(0, 4);
                setRelatedTools(related);
            }

            setLoading(false);
        }
    }, [params.id]);

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
            case 'beginner': return 'Dễ sử dụng';
            case 'intermediate': return 'Trung bình';
            case 'advanced': return 'Nâng cao';
            default: return 'Không xác định';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="bg-white rounded-lg p-6 space-y-4">
                            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!tool) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Không tìm thấy công cụ AI
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Công cụ AI bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
                        </p>
                        <Link
                            href="/ai-tools"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Quay lại danh sách công cụ AI
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <nav className="flex mb-6" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                                </svg>
                                <Link href="/ai-tools" className="ml-1 text-gray-700 hover:text-blue-600 md:ml-2">
                                    Công cụ AI
                                </Link>
                            </div>
                        </li>
                        <li aria-current="page">
                            <div className="flex items-center">
                                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                                </svg>
                                <span className="ml-1 text-gray-500 md:ml-2">{tool.name}</span>
                            </div>
                        </li>
                    </ol>
                </nav>

                {/* Tool Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="text-4xl">{getCategoryIcon(tool.category)}</div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{tool.name}</h1>
                                <p className="text-lg text-gray-600 mt-1">{tool.description}</p>
                                <div className="flex items-center space-x-3 mt-3">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {getCategoryName(tool.category)}
                                    </span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(tool.difficulty)}`}>
                                        {getDifficultyText(tool.difficulty)}
                                    </span>
                                    {tool.vietnameseSupport && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Hỗ trợ tiếng Việt
                                        </span>
                                    )}
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tool.pricingModel === 'free' ? 'bg-green-100 text-green-800' :
                                            tool.pricingModel === 'freemium' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {tool.pricingModel === 'free' ? 'Miễn phí' :
                                            tool.pricingModel === 'freemium' ? 'Freemium' : 'Trả phí'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                            Sử dụng ngay
                            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Use Case */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ứng dụng trong giảng dạy</h2>
                            <p className="text-gray-700">{tool.useCase}</p>
                        </div>

                        {/* Features */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tính năng nổi bật</h2>
                            <ul className="space-y-2">
                                {tool.features.map((feature, index) => (
                                    <li key={index} className="flex items-start">
                                        <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Integration Instructions */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Hướng dẫn sử dụng</h2>
                            <p className="text-gray-700">{tool.integrationInstructions}</p>
                        </div>

                        {/* Sample Prompts */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ví dụ prompt</h2>
                            <div className="space-y-3">
                                {tool.samplePrompts.map((prompt, index) => (
                                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-gray-800 font-medium">Ví dụ {index + 1}:</p>
                                        <p className="text-gray-700 mt-1 italic">"{prompt}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Tool Info */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin công cụ</h3>
                            <dl className="space-y-3">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Môn học</dt>
                                    <dd className="mt-1">
                                        <div className="flex flex-wrap gap-1">
                                            {tool.subjects.map((subject, index) => (
                                                <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                    {subject}
                                                </span>
                                            ))}
                                        </div>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Lớp học</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        Lớp {tool.gradeLevel.join(', ')}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Độ khó</dt>
                                    <dd className="mt-1">
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(tool.difficulty)}`}>
                                            {getDifficultyText(tool.difficulty)}
                                        </span>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Giá cả</dt>
                                    <dd className="mt-1">
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${tool.pricingModel === 'free' ? 'bg-green-100 text-green-800' :
                                                tool.pricingModel === 'freemium' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {tool.pricingModel === 'free' ? 'Miễn phí' :
                                                tool.pricingModel === 'freemium' ? 'Freemium' : 'Trả phí'}
                                        </span>
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Related Tools */}
                        {relatedTools.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Công cụ liên quan</h3>
                                <div className="space-y-3">
                                    {relatedTools.map((relatedTool) => (
                                        <Link
                                            key={relatedTool.id}
                                            href={`/ai-tools/${relatedTool.id}`}
                                            className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <span className="text-xl">{getCategoryIcon(relatedTool.category)}</span>
                                                <div>
                                                    <p className="font-medium text-gray-900">{relatedTool.name}</p>
                                                    <p className="text-sm text-gray-500">{getCategoryName(relatedTool.category)}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}