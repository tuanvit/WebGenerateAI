import React from 'react';
import AIToolsBrowserWithFilters from '@/components/ai-tools/AIToolsBrowserWithFilters';
import Header from '@/components/layout/Header';

export default function AIToolsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Thư viện Công cụ AI
                    </h1>
                    <p className="text-lg text-gray-600">
                        Khám phá 35+ công cụ AI chuyên biệt cho giáo dục THCS, được phân loại theo môn học và mục đích sử dụng
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center">
                            <span className="text-2xl mr-3">📝</span>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">15+</p>
                                <p className="text-sm text-gray-600">Công cụ tạo nội dung</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center">
                            <span className="text-2xl mr-3">📊</span>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">10+</p>
                                <p className="text-sm text-gray-600">Công cụ thuyết trình</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center">
                            <span className="text-2xl mr-3">🔬</span>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">12+</p>
                                <p className="text-sm text-gray-600">Công cụ mô phỏng</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center">
                            <span className="text-2xl mr-3">🎯</span>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">8+</p>
                                <p className="text-sm text-gray-600">Công cụ chuyên môn</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <AIToolsBrowserWithFilters showHeader={false} initialLimit={24} />
                </div>

                {/* Footer Info */}
                <div className="mt-8 bg-blue-50 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-blue-900 mb-2">
                        💡 Mẹo sử dụng hiệu quả
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                        <div>
                            <h3 className="font-medium mb-1">🎯 Chọn công cụ phù hợp</h3>
                            <p>Sử dụng bộ lọc theo môn học và loại công cụ để tìm được AI tool phù hợp nhất với nhu cầu của bạn.</p>
                        </div>
                        <div>
                            <h3 className="font-medium mb-1">📝 Tối ưu prompt</h3>
                            <p>Mỗi công cụ có hướng dẫn sử dụng và prompt mẫu để bạn có thể tạo ra kết quả tốt nhất.</p>
                        </div>
                        <div>
                            <h3 className="font-medium mb-1">🇻🇳 Hỗ trợ tiếng Việt</h3>
                            <p>Ưu tiên các công cụ có nhãn "VN" để đảm bảo hỗ trợ tốt nhất cho nội dung tiếng Việt.</p>
                        </div>
                        <div>
                            <h3 className="font-medium mb-1">🔄 Kết hợp công cụ</h3>
                            <p>Sử dụng nhiều công cụ khác nhau trong cùng một bài học để tạo ra trải nghiệm học tập đa dạng.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}