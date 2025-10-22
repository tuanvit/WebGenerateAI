'use client';

import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Star,
    Users,
    BookOpen,
    Calendar,
    Award
} from 'lucide-react';
import { StarRating } from '../ui/StarRating';

interface CommunityStatsProps {
    className?: string;
}

interface StatsData {
    totalContent: number;
    totalRatings: number;
    averageRating: number;
    activeUsers: number;
    topRatedContent: Array<{
        id: string;
        title: string;
        rating: number;
        ratingCount: number;
    }>;
    recentActivity: Array<{
        type: 'share' | 'rate' | 'save';
        content: string;
        time: string;
    }>;
}

export function CommunityStats({ className = '' }: CommunityStatsProps) {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setIsLoading(true);

            // Mock data for now - in production, this would come from API
            const mockStats: StatsData = {
                totalContent: 1247,
                totalRatings: 5832,
                averageRating: 4.3,
                activeUsers: 342,
                topRatedContent: [
                    {
                        id: '1',
                        title: 'Bài giảng Lịch sử Việt Nam - Thời kỳ đấu tranh chống thực dân Pháp',
                        rating: 4.9,
                        ratingCount: 156
                    },
                    {
                        id: '2',
                        title: 'Giáo án Toán 8 - Phương trình bậc nhất một ẩn',
                        rating: 4.8,
                        ratingCount: 134
                    },
                    {
                        id: '3',
                        title: 'Slide thuyết trình Địa lý - Khí hậu nhiệt đới',
                        rating: 4.7,
                        ratingCount: 98
                    }
                ],
                recentActivity: [
                    {
                        type: 'share',
                        content: 'Cô Lan đã chia sẻ "Bài tập Vật lý 9"',
                        time: '5 phút trước'
                    },
                    {
                        type: 'rate',
                        content: 'Thầy Minh đã đánh giá 5 sao cho "Giáo án Hóa học"',
                        time: '12 phút trước'
                    },
                    {
                        type: 'save',
                        content: 'Cô Hương đã lưu "Slide Sinh học 8"',
                        time: '18 phút trước'
                    }
                ]
            };

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            setStats(mockStats);
        } catch (error) {
            console.error('Error loading community stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-2">
                                <div className="h-8 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
                <p className="text-gray-500 text-center">Không thể tải thống kê cộng đồng</p>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg shadow ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
                    Thống kê cộng đồng
                </h2>
                <p className="text-gray-600 mt-1">
                    Tổng quan hoạt động chia sẻ tài liệu giáo dục
                </p>
            </div>

            {/* Main Stats */}
            <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {stats.totalContent.toLocaleString('vi-VN')}
                        </div>
                        <div className="text-sm text-gray-600">Tài liệu</div>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-3">
                            <Star className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {stats.totalRatings.toLocaleString('vi-VN')}
                        </div>
                        <div className="text-sm text-gray-600">Đánh giá</div>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
                            <Award className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {stats.averageRating.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">Điểm TB</div>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {stats.activeUsers.toLocaleString('vi-VN')}
                        </div>
                        <div className="text-sm text-gray-600">Thành viên</div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Top Rated Content */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Award className="w-5 h-5 mr-2 text-yellow-600" />
                            Nội dung được đánh giá cao
                        </h3>
                        <div className="space-y-3">
                            {stats.topRatedContent.map((item, index) => (
                                <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-center w-6 h-6 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium shrink-0">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                            {item.title}
                                        </p>
                                        <div className="mt-1">
                                            <StarRating
                                                rating={item.rating}
                                                totalRatings={item.ratingCount}
                                                size="sm"
                                                showCount={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                            Hoạt động gần đây
                        </h3>
                        <div className="space-y-3">
                            {stats.recentActivity.map((activity, index) => (
                                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="shrink-0">
                                        {activity.type === 'share' && (
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                <BookOpen className="w-4 h-4 text-green-600" />
                                            </div>
                                        )}
                                        {activity.type === 'rate' && (
                                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                                <Star className="w-4 h-4 text-yellow-600" />
                                            </div>
                                        )}
                                        {activity.type === 'save' && (
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <Users className="w-4 h-4 text-blue-600" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-900">
                                            {activity.content}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {activity.time}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}