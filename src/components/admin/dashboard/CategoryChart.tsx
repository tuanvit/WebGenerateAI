"use client";

import { useMemo } from 'react';

interface CategoryChartProps {
    title: string;
    data: Record<string, number>;
    colorScheme?: 'blue' | 'green' | 'purple' | 'orange';
}

export default function CategoryChart({ title, data, colorScheme = 'blue' }: CategoryChartProps) {
    const chartData = useMemo(() => {
        const entries = Object.entries(data);
        const total = entries.reduce((sum, [, count]) => sum + count, 0);

        return entries
            .map(([category, count]) => ({
                category,
                count,
                percentage: total > 0 ? (count / total) * 100 : 0
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Top 5 categories
    }, [data]);

    const getColorClasses = (index: number) => {
        const colors = {
            blue: [
                'bg-blue-500',
                'bg-blue-400',
                'bg-blue-300',
                'bg-blue-200',
                'bg-blue-100'
            ],
            green: [
                'bg-green-500',
                'bg-green-400',
                'bg-green-300',
                'bg-green-200',
                'bg-green-100'
            ],
            purple: [
                'bg-purple-500',
                'bg-purple-400',
                'bg-purple-300',
                'bg-purple-200',
                'bg-purple-100'
            ],
            orange: [
                'bg-orange-500',
                'bg-orange-400',
                'bg-orange-300',
                'bg-orange-200',
                'bg-orange-100'
            ]
        };

        return colors[colorScheme][index] || colors[colorScheme][0];
    };

    const getCategoryDisplayName = (category: string) => {
        const categoryNames: Record<string, string> = {
            'TEXT_GENERATION': 'Tạo văn bản',
            'PRESENTATION': 'Thuyết trình',
            'IMAGE': 'Hình ảnh',
            'VIDEO': 'Video',
            'SIMULATION': 'Mô phỏng',
            'ASSESSMENT': 'Đánh giá',
            'DATA_ANALYSIS': 'Phân tích dữ liệu',
            'Toán': 'Toán học',
            'Văn': 'Ngữ văn',
            'Khoa học tự nhiên': 'Khoa học tự nhiên',
            'Lịch sử & Địa lí': 'Lịch sử & Địa lí',
            'Giáo dục công dân': 'Giáo dục công dân',
            'Công nghệ': 'Công nghệ'
        };

        return categoryNames[category] || category;
    };

    const total = chartData.reduce((sum, item) => sum + item.count, 0);

    return (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <span className="text-sm text-gray-500">
                    Tổng: {total.toLocaleString()}
                </span>
            </div>

            {chartData.length === 0 ? (
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <p className="text-gray-500">Chưa có dữ liệu</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {chartData.map((item, index) => (
                        <div key={item.category} className="flex items-center">
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700">
                                        {getCategoryDisplayName(item.category)}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600">
                                            {item.count.toLocaleString()}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            ({item.percentage.toFixed(1)}%)
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-500 ${getColorClasses(index)}`}
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {chartData.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                            Hiển thị top {Math.min(5, chartData.length)} danh mục
                        </span>
                        <button className="text-blue-600 hover:text-blue-700 font-medium">
                            Xem chi tiết
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}