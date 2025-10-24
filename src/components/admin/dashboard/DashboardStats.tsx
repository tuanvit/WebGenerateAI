"use client";

import {
    Users,
    Bot,
    FileText,
    Shield,
    TrendingUp,
    Activity
} from 'lucide-react';

interface DashboardStatsProps {
    stats: {
        totalAITools: number;
        totalTemplates: number;
        totalUsers: number;
        totalAdmins: number;
    };
    contentStats: {
        totalGeneratedPrompts: number;
        totalSharedContent: number;
        averageRating: number;
    };
}

export default function DashboardStats({ stats, contentStats }: DashboardStatsProps) {
    const statCards = [
        {
            title: 'AI Tools',
            value: stats.totalAITools,
            icon: Bot,
            color: 'blue',
            description: 'Tổng số công cụ AI'
        },
        {
            title: 'Templates',
            value: stats.totalTemplates,
            icon: FileText,
            color: 'green',
            description: 'Mẫu prompt có sẵn'
        },
        {
            title: 'Người dùng',
            value: stats.totalUsers,
            icon: Users,
            color: 'purple',
            description: 'Tổng số người dùng'
        },
        {
            title: 'Quản trị viên',
            value: stats.totalAdmins,
            icon: Shield,
            color: 'orange',
            description: 'Tài khoản admin'
        },
        {
            title: 'Prompt đã tạo',
            value: contentStats.totalGeneratedPrompts,
            icon: TrendingUp,
            color: 'indigo',
            description: 'Tổng prompt được tạo'
        },
        {
            title: 'Nội dung chia sẻ',
            value: contentStats.totalSharedContent,
            icon: Activity,
            color: 'pink',
            description: 'Nội dung cộng đồng'
        }
    ];

    const getColorClasses = (color: string) => {
        const colors = {
            blue: 'bg-blue-50 text-blue-600 border-blue-200',
            green: 'bg-green-50 text-green-600 border-green-200',
            purple: 'bg-purple-50 text-purple-600 border-purple-200',
            orange: 'bg-orange-50 text-orange-600 border-orange-200',
            indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
            pink: 'bg-pink-50 text-pink-600 border-pink-200'
        };
        return colors[color as keyof typeof colors] || colors.blue;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {statCards.map((card, index) => {
                const Icon = card.icon;
                const colorClasses = getColorClasses(card.color);

                return (
                    <div key={index} className="bg-white rounded-lg shadow border border-gray-200 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600 mb-1">
                                    {card.title}
                                </p>
                                <p className="text-2xl font-bold text-gray-900 mb-1">
                                    {(card.value || 0).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {card.description}
                                </p>
                            </div>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}