'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Download, Search, Filter, AlertTriangle, Eye, Calendar } from 'lucide-react';

interface AuditLogEntry {
    id: string;
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
    user: {
        name: string;
        email: string;
        role: string;
    };
}

interface AuditLogsViewerProps {
    className?: string;
}

export function AuditLogsViewer({ className }: AuditLogsViewerProps) {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAction, setSelectedAction] = useState('');
    const [selectedResource, setSelectedResource] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [securityAlerts, setSecurityAlerts] = useState<AuditLogEntry[]>([]);
    const [showAlerts, setShowAlerts] = useState(false);
    const { toast } = useToast();

    const actions = [
        'CREATE', 'UPDATE', 'DELETE', 'BULK_UPDATE', 'BULK_DELETE',
        'IMPORT', 'EXPORT', 'LOGIN', 'LOGOUT', 'LOGIN_FAILED',
        'PERMISSION_DENIED', 'RATE_LIMIT_EXCEEDED'
    ];

    const resources = [
        'ai_tools', 'templates', 'users', 'audit_logs', 'backups', 'settings', 'system', 'auth'
    ];

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '20'
            });

            if (searchQuery) params.append('query', searchQuery);
            if (selectedAction) params.append('action', selectedAction);
            if (selectedResource) params.append('resource', selectedResource);
            if (selectedUser) params.append('userId', selectedUser);
            if (dateFrom) params.append('startDate', dateFrom);
            if (dateTo) params.append('endDate', dateTo);

            const response = await fetch(`/api/admin/audit-logs?${params}`);
            if (!response.ok) throw new Error('Failed to fetch logs');

            const data = await response.json();
            setLogs(data.logs);
            setTotalPages(data.pagination.totalPages);
            setTotal(data.pagination.total);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            toast({
                title: 'Lỗi',
                description: 'Không thể tải nhật ký audit',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchSecurityAlerts = async () => {
        try {
            const response = await fetch('/api/admin/audit-logs?alerts=true');
            if (!response.ok) throw new Error('Failed to fetch security alerts');

            const data = await response.json();
            setSecurityAlerts(data.alerts);
        } catch (error) {
            console.error('Error fetching security alerts:', error);
        }
    };

    const exportLogs = async () => {
        try {
            const params = new URLSearchParams({ export: 'csv' });
            if (selectedAction) params.append('action', selectedAction);
            if (selectedResource) params.append('resource', selectedResource);
            if (selectedUser) params.append('userId', selectedUser);
            if (dateFrom) params.append('startDate', dateFrom);
            if (dateTo) params.append('endDate', dateTo);

            const response = await fetch(`/api/admin/audit-logs?${params}`);
            if (!response.ok) throw new Error('Failed to export logs');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({
                title: 'Thành công',
                description: 'Đã xuất nhật ký audit'
            });
        } catch (error) {
            console.error('Error exporting logs:', error);
            toast({
                title: 'Lỗi',
                description: 'Không thể xuất nhật ký audit',
                variant: 'destructive'
            });
        }
    };

    useEffect(() => {
        fetchLogs();
        fetchSecurityAlerts();
    }, [currentPage, selectedAction, selectedResource, selectedUser, dateFrom, dateTo]);

    const handleSearch = () => {
        setCurrentPage(1);
        fetchLogs();
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedAction('');
        setSelectedResource('');
        setSelectedUser('');
        setDateFrom('');
        setDateTo('');
        setCurrentPage(1);
    };

    const getActionBadgeColor = (action: string) => {
        if (action.includes('DELETE')) return 'destructive';
        if (action.includes('CREATE')) return 'default';
        if (action.includes('UPDATE')) return 'secondary';
        if (action.includes('FAILED') || action.includes('DENIED')) return 'destructive';
        return 'outline';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    return (
        <div className={className}>
            {/* Security Alerts */}
            {securityAlerts.length > 0 && (
                <Card className="mb-6 border-orange-200 bg-orange-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-800">
                            <AlertTriangle className="h-5 w-5" />
                            Cảnh báo bảo mật ({securityAlerts.length})
                        </CardTitle>
                        <CardDescription>
                            Các hoạt động đáng nghi trong 24 giờ qua
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAlerts(!showAlerts)}
                        >
                            {showAlerts ? 'Ẩn' : 'Xem'} cảnh báo
                        </Button>

                        {showAlerts && (
                            <div className="mt-4 space-y-2">
                                {securityAlerts.slice(0, 5).map((alert) => (
                                    <div key={alert.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                        <div>
                                            <Badge variant="destructive" className="mr-2">
                                                {alert.action}
                                            </Badge>
                                            <span className="text-sm">
                                                {alert.user.email} - {formatDate(alert.createdAt)}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {alert.ipAddress}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Filters */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Bộ lọc và tìm kiếm
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Tìm kiếm</label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Tìm kiếm trong nhật ký..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <Button size="sm" onClick={handleSearch}>
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Hành động</label>
                            <Select value={selectedAction} onValueChange={setSelectedAction}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn hành động" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Tất cả</SelectItem>
                                    {actions.map((action) => (
                                        <SelectItem key={action} value={action}>
                                            {action}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Tài nguyên</label>
                            <Select value={selectedResource} onValueChange={setSelectedResource}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn tài nguyên" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Tất cả</SelectItem>
                                    {resources.map((resource) => (
                                        <SelectItem key={resource} value={resource}>
                                            {resource}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={clearFilters}>
                                Xóa bộ lọc
                            </Button>
                            <Button variant="outline" onClick={exportLogs}>
                                <Download className="h-4 w-4 mr-2" />
                                Xuất CSV
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Từ ngày</label>
                            <Input
                                type="datetime-local"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Đến ngày</label>
                            <Input
                                type="datetime-local"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Audit Logs Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            Nhật ký Audit ({total} bản ghi)
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                            >
                                Trước
                            </Button>
                            <span className="text-sm">
                                Trang {currentPage} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Sau
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Đang tải...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Thời gian</TableHead>
                                        <TableHead>Người dùng</TableHead>
                                        <TableHead>Hành động</TableHead>
                                        <TableHead>Tài nguyên</TableHead>
                                        <TableHead>IP</TableHead>
                                        <TableHead>Chi tiết</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="text-sm">
                                                {formatDate(log.createdAt)}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{log.user.name}</div>
                                                    <div className="text-xs text-gray-500">{log.user.email}</div>
                                                    <Badge variant="outline" className="text-xs">
                                                        {log.user.role}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getActionBadgeColor(log.action)}>
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{log.resource}</div>
                                                    {log.resourceId && (
                                                        <div className="text-xs text-gray-500">
                                                            ID: {log.resourceId}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {log.ipAddress || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {log.details && (
                                                    <details className="cursor-pointer">
                                                        <summary className="text-xs text-blue-600">
                                                            Xem chi tiết
                                                        </summary>
                                                        <pre className="text-xs mt-2 p-2 bg-gray-50 rounded overflow-auto max-w-xs">
                                                            {JSON.stringify(log.details, null, 2)}
                                                        </pre>
                                                    </details>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}