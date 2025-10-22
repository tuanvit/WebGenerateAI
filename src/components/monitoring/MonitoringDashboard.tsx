'use client';

import { useState, useEffect } from 'react';

interface SystemHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    services: {
        database: ServiceStatus;
        cache: ServiceStatus;
        application: ServiceStatus;
    };
    metrics: SystemMetrics;
}

interface ServiceStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime?: number;
    error?: string;
    lastCheck: string;
}

interface SystemMetrics {
    uptime: number;
    memoryUsage: {
        used: number;
        total: number;
        percentage: number;
    };
    requestsPerMinute: number;
    errorRate: number;
    cacheHitRate: number;
    activeUsers: number;
}

export function MonitoringDashboard() {
    const [health, setHealth] = useState<SystemHealth | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const fetchHealth = async () => {
        try {
            const response = await fetch('/api/health');
            if (!response.ok) {
                throw new Error('Failed to fetch health data');
            }
            const data = await response.json();
            setHealth(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();

        if (autoRefresh) {
            const interval = setInterval(fetchHealth, 30000); // Refresh every 30 seconds
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
                return 'text-green-600 bg-green-100';
            case 'degraded':
                return 'text-yellow-600 bg-yellow-100';
            case 'unhealthy':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const formatUptime = (uptime: number) => {
        const seconds = Math.floor(uptime / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    };

    const formatBytes = (bytes: number) => {
        return `${bytes} MB`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Đang tải dữ liệu giám sát...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Lỗi tải dữ liệu</h3>
                        <p className="mt-1 text-sm text-red-700">{error}</p>
                        <button
                            onClick={fetchHealth}
                            className="mt-2 text-sm text-red-800 underline hover:text-red-900"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!health) {
        return (
            <div className="text-center p-8 text-gray-500">
                Không có dữ liệu giám sát
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Bảng điều khiển giám sát</h2>
                <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="mr-2"
                        />
                        <span className="text-sm text-gray-600">Tự động làm mới</span>
                    </label>
                    <button
                        onClick={fetchHealth}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Làm mới
                    </button>
                </div>
            </div>

            {/* Overall Status */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Trạng thái tổng quan</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(health.status)}`}>
                        {health.status === 'healthy' ? 'Khỏe mạnh' :
                            health.status === 'degraded' ? 'Suy giảm' : 'Không khỏe mạnh'}
                    </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                    Cập nhật lần cuối: {new Date(health.timestamp).toLocaleString('vi-VN')}
                </p>
            </div>

            {/* Services Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(health.services).map(([service, status]) => (
                    <div key={service} className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-medium text-gray-900 capitalize">
                                {service === 'database' ? 'Cơ sở dữ liệu' :
                                    service === 'cache' ? 'Bộ nhớ đệm' : 'Ứng dụng'}
                            </h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status.status)}`}>
                                {status.status === 'healthy' ? 'Khỏe mạnh' :
                                    status.status === 'degraded' ? 'Suy giảm' : 'Không khỏe mạnh'}
                            </span>
                        </div>

                        {status.responseTime && (
                            <p className="text-sm text-gray-600 mb-2">
                                Thời gian phản hồi: {status.responseTime}ms
                            </p>
                        )}

                        {status.error && (
                            <p className="text-sm text-red-600 mb-2">
                                Lỗi: {status.error}
                            </p>
                        )}

                        <p className="text-xs text-gray-500">
                            Kiểm tra lần cuối: {new Date(status.lastCheck).toLocaleString('vi-VN')}
                        </p>
                    </div>
                ))}
            </div>

            {/* System Metrics */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Chỉ số hệ thống</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {formatUptime(health.metrics.uptime)}
                        </div>
                        <div className="text-sm text-gray-500">Thời gian hoạt động</div>
                    </div>

                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {health.metrics.memoryUsage.percentage}%
                        </div>
                        <div className="text-sm text-gray-500">
                            Bộ nhớ ({formatBytes(health.metrics.memoryUsage.used)}/{formatBytes(health.metrics.memoryUsage.total)})
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                            {health.metrics.requestsPerMinute}
                        </div>
                        <div className="text-sm text-gray-500">Yêu cầu/phút</div>
                    </div>

                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                            {health.metrics.errorRate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500">Tỷ lệ lỗi</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mt-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600">
                            {health.metrics.cacheHitRate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500">Tỷ lệ cache hit</div>
                    </div>

                    <div className="text-center">
                        <div className="text-2xl font-bold text-teal-600">
                            {health.metrics.activeUsers}
                        </div>
                        <div className="text-sm text-gray-500">Người dùng hoạt động</div>
                    </div>
                </div>
            </div>

            {/* Memory Usage Chart */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sử dụng bộ nhớ</h3>
                <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                        className={`h-4 rounded-full transition-all duration-300 ${health.metrics.memoryUsage.percentage > 80 ? 'bg-red-500' :
                                health.metrics.memoryUsage.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                        style={{ width: `${health.metrics.memoryUsage.percentage}%` }}
                    ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                    {formatBytes(health.metrics.memoryUsage.used)} / {formatBytes(health.metrics.memoryUsage.total)}
                    ({health.metrics.memoryUsage.percentage}%)
                </p>
            </div>
        </div>
    );
}