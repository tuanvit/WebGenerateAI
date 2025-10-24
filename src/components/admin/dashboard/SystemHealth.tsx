"use client";

import {
    Database,
    HardDrive,
    Zap,
    Clock,
    CheckCircle,
    AlertTriangle,
    XCircle
} from 'lucide-react';

interface SystemHealthProps {
    health: {
        database: 'healthy' | 'warning' | 'error';
        storage: 'healthy' | 'warning' | 'error';
        performance: 'healthy' | 'warning' | 'error';
        lastBackup?: Date;
        uptime: number;
    };
}

export default function SystemHealth({ health }: SystemHealthProps) {
    const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
        switch (status) {
            case 'healthy':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-red-500" />;
        }
    };

    const getStatusText = (status: 'healthy' | 'warning' | 'error') => {
        switch (status) {
            case 'healthy':
                return 'Tốt';
            case 'warning':
                return 'Cảnh báo';
            case 'error':
                return 'Lỗi';
        }
    };

    const getStatusColor = (status: 'healthy' | 'warning' | 'error') => {
        switch (status) {
            case 'healthy':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'warning':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'error':
                return 'text-red-600 bg-red-50 border-red-200';
        }
    };

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (days > 0) {
            return `${days} ngày ${hours} giờ`;
        } else if (hours > 0) {
            return `${hours} giờ ${minutes} phút`;
        } else {
            return `${minutes} phút`;
        }
    };

    const formatLastBackup = (date?: Date) => {
        if (!date) return 'Chưa có backup';

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffDays > 0) {
            return `${diffDays} ngày trước`;
        } else if (diffHours > 0) {
            return `${diffHours} giờ trước`;
        } else {
            return 'Vừa xong';
        }
    };

    const healthItems = [
        {
            name: 'Cơ sở dữ liệu',
            status: health.database,
            icon: Database,
            description: 'Kết nối và hiệu suất database'
        },
        {
            name: 'Lưu trữ',
            status: health.storage,
            icon: HardDrive,
            description: 'Dung lượng và trạng thái ổ cứng'
        },
        {
            name: 'Hiệu suất',
            status: health.performance,
            icon: Zap,
            description: 'Tốc độ phản hồi hệ thống'
        }
    ];

    return (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Tình trạng hệ thống</h3>
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">Đang hoạt động</span>
                </div>
            </div>

            {/* Health Status Items */}
            <div className="space-y-4 mb-6">
                {healthItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                                    <Icon className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{item.name}</p>
                                    <p className="text-sm text-gray-500">{item.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {getStatusIcon(item.status)}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                                    {getStatusText(item.status)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* System Info */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                        <Clock className="w-5 h-5 text-blue-500 mr-2" />
                        <span className="text-sm font-medium text-gray-600">Thời gian hoạt động</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                        {formatUptime(health.uptime)}
                    </p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                        <Database className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-sm font-medium text-gray-600">Backup cuối</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                        {formatLastBackup(health.lastBackup)}
                    </p>
                </div>
            </div>
        </div>
    );
}