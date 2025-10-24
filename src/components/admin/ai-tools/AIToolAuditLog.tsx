'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, User, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface AuditLogEntry {
    id: string;
    action: string;
    resource: string;
    resourceId?: string;
    userId: string;
    userName: string;
    timestamp: Date;
    details?: any;
    ipAddress?: string;
}

interface AIToolAuditLogProps {
    toolId?: string;
    className?: string;
}

export default function AIToolAuditLog({ toolId, className }: AIToolAuditLogProps) {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        action: '',
        dateFrom: '',
        dateTo: ''
    });

    // Fetch audit logs
    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (toolId) params.append('resourceId', toolId);
            if (filters.search) params.append('search', filters.search);
            if (filters.action) params.append('action', filters.action);
            if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
            if (filters.dateTo) params.append('dateTo', filters.dateTo);

            const response = await fetch(`/api/admin/audit-logs?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Không thể tải nhật ký audit');
            }

            const data = await response.json();
            setLogs(data.logs || []);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            toast.error('Không thể tải nhật ký audit');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [toolId]);

    // Handle filter changes
    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // Apply filters
    const applyFilters = () => {
        fetchLogs();
    };

    // Clear filters
    const clearFilters = () => {
        setFilters({
            search: '',
            action: '',
            dateFrom: '',
            dateTo: ''
        });
    };

    // Get action badge color
    const getActionBadgeColor = (action: string) => {
        switch (action.toLowerCase()) {
            case 'create_ai_tool':
                return 'bg-green-100 text-green-800';
            case 'update_ai_tool':
                return 'bg-blue-100 text-blue-800';
            case 'delete_ai_tool':
                return 'bg-red-100 text-red-800';
            case 'bulk_update_ai_tools':
                return 'bg-yellow-100 text-yellow-800';
            case 'bulk_delete_ai_tools':
                return 'bg-red-100 text-red-800';
            case 'import_ai_tools':
                return 'bg-purple-100 text-purple-800';
            case 'export_ai_tools':
                return 'bg-indigo-100 text-indigo-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Format action name
    const formatActionName = (action: string) => {
        const actionMap: Record<string, string> = {
            'create_ai_tool': 'Tạo công cụ AI',
            'update_ai_tool': 'Cập nhật công cụ AI',
            'delete_ai_tool': 'Xóa công cụ AI',
            'bulk_update_ai_tools': 'Cập nhật hàng loạt',
            'bulk_delete_ai_tools': 'Xóa hàng loạt',
            'import_ai_tools': 'Import công cụ AI',
            'export_ai_tools': 'Export công cụ AI'
        };
        return actionMap[action] || action;
    };

    // Format timestamp
    const formatTimestamp = (timestamp: Date) => {
        return new Date(timestamp).toLocaleString('vi-VN');
    };

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Nhật ký hoạt động
                    {toolId && <span className="text-sm font-normal text-gray-500">(Công cụ cụ thể)</span>}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Tìm kiếm..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <Select
                        value={filters.action}
                        onValueChange={(value) => handleFilterChange('action', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Tất cả hành động" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Tất cả hành động</SelectItem>
                            <SelectItem value="create_ai_tool">Tạo công cụ AI</SelectItem>
                            <SelectItem value="update_ai_tool">Cập nhật công cụ AI</SelectItem>
                            <SelectItem value="delete_ai_tool">Xóa công cụ AI</SelectItem>
                            <SelectItem value="bulk_update_ai_tools">Cập nhật hàng loạt</SelectItem>
                            <SelectItem value="bulk_delete_ai_tools">Xóa hàng loạt</SelectItem>
                            <SelectItem value="import_ai_tools">Import</SelectItem>
                            <SelectItem value="export_ai_tools">Export</SelectItem>
                        </SelectContent>
                    </Select>

                    <Input
                        type="date"
                        placeholder="Từ ngày"
                        value={filters.dateFrom}
                        onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    />

                    <Input
                        type="date"
                        placeholder="Đến ngày"
                        value={filters.dateTo}
                        onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    <Button onClick={applyFilters} disabled={loading}>
                        Áp dụng bộ lọc
                    </Button>
                    <Button variant="outline" onClick={clearFilters}>
                        Xóa bộ lọc
                    </Button>
                </div>

                {/* Logs List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-gray-500">Đang tải...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Không có nhật ký hoạt động nào
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge className={getActionBadgeColor(log.action)}>
                                                {formatActionName(log.action)}
                                            </Badge>
                                            <span className="text-sm text-gray-500">
                                                bởi {log.userName}
                                            </span>
                                        </div>

                                        <div className="text-sm text-gray-600 mb-2">
                                            {log.details?.toolName && (
                                                <span>Công cụ: <strong>{log.details.toolName}</strong></span>
                                            )}
                                            {log.details?.affectedIds && (
                                                <span>Số lượng: <strong>{log.details.affectedIds.length}</strong></span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatTimestamp(log.timestamp)}
                                            </span>
                                            {log.ipAddress && (
                                                <span>IP: {log.ipAddress}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Additional details */}
                                {log.details && Object.keys(log.details).length > 0 && (
                                    <details className="mt-3">
                                        <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                                            Chi tiết
                                        </summary>
                                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                            {JSON.stringify(log.details, null, 2)}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}