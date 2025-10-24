"use client";

import { Clock, User, Settings, Plus, Edit, Trash2 } from 'lucide-react';

interface Activity {
    id: string;
    action: string;
    resource?: string;
    description: string;
    userName: string;
    timestamp: Date | string;
}

interface RecentActivityProps {
    activities: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
    const getActionIcon = (action: string) => {
        if (!action) return <Settings className="w-4 h-4" />;

        if (action.includes('CREATE')) return <Plus className="w-4 h-4" />;
        if (action.includes('UPDATE')) return <Edit className="w-4 h-4" />;
        if (action.includes('DELETE')) return <Trash2 className="w-4 h-4" />;
        return <Settings className="w-4 h-4" />;
    };

    const getActionColor = (action: string) => {
        if (!action || typeof action !== 'string') return 'text-gray-600 bg-gray-50';

        if (action.includes('CREATE')) return 'text-green-600 bg-green-50';
        if (action.includes('UPDATE')) return 'text-blue-600 bg-blue-50';
        if (action.includes('DELETE')) return 'text-red-600 bg-red-50';
        return 'text-gray-600 bg-gray-50';
    };

    const formatTimestamp = (timestamp: Date | string) => {
        try {
            const now = new Date();
            const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
            const diffMs = now.getTime() - date.getTime();
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

            if (diffMinutes < 1) {
                return 'Vừa xong';
            } else if (diffMinutes < 60) {
                return `${diffMinutes} phút trước`;
            } else if (diffHours < 24) {
                return `${diffHours} giờ trước`;
            } else {
                return date.toLocaleDateString('vi-VN');
            }
        } catch (error) {
            return 'Không xác định';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h3>
                <Clock className="w-5 h-5 text-gray-400" />
            </div>

            {!activities || activities.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">Chưa có hoạt động nào</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {activities.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActionColor(activity.action)}`}>
                                {getActionIcon(activity.action)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {activity.description}
                                    </p>
                                    <p className="text-xs text-gray-500 ml-2 shrink-0">
                                        {formatTimestamp(activity.timestamp)}
                                    </p>
                                </div>
                                <div className="flex items-center mt-1">
                                    <User className="w-3 h-3 text-gray-400 mr-1" />
                                    <p className="text-xs text-gray-500">
                                        {activity.userName}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Xem tất cả hoạt động →
                </button>
            </div>
        </div>
    );
}