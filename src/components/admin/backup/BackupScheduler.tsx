'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
    Clock,
    Play,
    Settings,
    Calendar,
    Database,
    HardDrive,
    RefreshCw,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BackupScheduleConfig {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    retentionDays: number;
    maxBackups: number;
    includeAITools: boolean;
    includeTemplates: boolean;
}

interface BackupStats {
    totalBackups: number;
    automaticBackups: number;
    manualBackups: number;
    totalSize: number;
    lastBackupDate?: string;
    nextScheduledBackup?: string;
}

interface BackupSchedulerProps {
    className?: string;
}

export function BackupScheduler({ className }: BackupSchedulerProps) {
    const [config, setConfig] = useState<BackupScheduleConfig>({
        enabled: false,
        frequency: 'daily',
        time: '02:00',
        retentionDays: 30,
        maxBackups: 10,
        includeAITools: true,
        includeTemplates: true
    });
    const [stats, setStats] = useState<BackupStats>({
        totalBackups: 0,
        automaticBackups: 0,
        manualBackups: 0,
        totalSize: 0
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [runningBackup, setRunningBackup] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadScheduleData();
    }, []);

    const loadScheduleData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/backup/schedule');
            if (!response.ok) {
                throw new Error('Failed to load schedule data');
            }
            const data = await response.json();
            setConfig(data.config);
            setStats(data.stats);
        } catch (error) {
            console.error('Error loading schedule data:', error);
            toast({
                title: 'Lỗi',
                description: 'Không thể tải cấu hình lịch backup',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const saveConfig = async () => {
        try {
            setSaving(true);
            const response = await fetch('/api/admin/backup/schedule', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(config)
            });

            if (!response.ok) {
                throw new Error('Failed to save config');
            }

            toast({
                title: 'Thành công',
                description: 'Cấu hình lịch backup đã được lưu'
            });

            // Reload data to get updated stats
            await loadScheduleData();
        } catch (error) {
            console.error('Error saving config:', error);
            toast({
                title: 'Lỗi',
                description: 'Không thể lưu cấu hình',
                variant: 'destructive'
            });
        } finally {
            setSaving(false);
        }
    };

    const runBackupNow = async () => {
        try {
            setRunningBackup(true);
            const response = await fetch('/api/admin/backup/schedule/run-now', {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Failed to run backup');
            }

            const result = await response.json();

            toast({
                title: 'Backup thành công',
                description: `Backup đã được tạo. ${result.cleanedUpCount > 0 ? `Đã dọn dẹp ${result.cleanedUpCount} backup cũ.` : ''}`
            });

            // Reload data to show updated stats
            await loadScheduleData();
        } catch (error) {
            console.error('Error running backup:', error);
            toast({
                title: 'Lỗi',
                description: 'Không thể chạy backup',
                variant: 'destructive'
            });
        } finally {
            setRunningBackup(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Chưa có';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const getFrequencyLabel = (frequency: string) => {
        switch (frequency) {
            case 'daily': return 'Hàng ngày';
            case 'weekly': return 'Hàng tuần';
            case 'monthly': return 'Hàng tháng';
            default: return frequency;
        }
    };

    if (loading) {
        return (
            <div className={className}>
                <Card>
                    <CardContent className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                        Đang tải...
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="grid gap-6 md:grid-cols-2">
                {/* Schedule Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Cấu hình Lịch Backup
                        </CardTitle>
                        <CardDescription>
                            Thiết lập backup tự động cho hệ thống
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Kích hoạt backup tự động</label>
                            <Switch
                                checked={config.enabled}
                                onCheckedChange={(checked: boolean) =>
                                    setConfig(prev => ({ ...prev, enabled: checked }))
                                }
                            />
                        </div>

                        {config.enabled && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tần suất</label>
                                    <Select
                                        value={config.frequency}
                                        onValueChange={(value) =>
                                            setConfig(prev => ({ ...prev, frequency: value as 'daily' | 'weekly' | 'monthly' }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">Hàng ngày</SelectItem>
                                            <SelectItem value="weekly">Hàng tuần</SelectItem>
                                            <SelectItem value="monthly">Hàng tháng</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Thời gian chạy</label>
                                    <Input
                                        type="time"
                                        value={config.time}
                                        onChange={(e) =>
                                            setConfig(prev => ({ ...prev, time: e.target.value }))
                                        }
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Lưu trữ (ngày)</label>
                                        <Input
                                            type="number"
                                            min="1"
                                            max="365"
                                            value={config.retentionDays}
                                            onChange={(e) =>
                                                setConfig(prev => ({
                                                    ...prev,
                                                    retentionDays: parseInt(e.target.value) || 30
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Số backup tối đa</label>
                                        <Input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={config.maxBackups}
                                            onChange={(e) =>
                                                setConfig(prev => ({
                                                    ...prev,
                                                    maxBackups: parseInt(e.target.value) || 10
                                                }))
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nội dung backup</label>
                                    <div className="space-y-2">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={config.includeAITools}
                                                onChange={(e) =>
                                                    setConfig(prev => ({
                                                        ...prev,
                                                        includeAITools: e.target.checked
                                                    }))
                                                }
                                            />
                                            <span className="text-sm">AI Tools</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={config.includeTemplates}
                                                onChange={(e) =>
                                                    setConfig(prev => ({
                                                        ...prev,
                                                        includeTemplates: e.target.checked
                                                    }))
                                                }
                                            />
                                            <span className="text-sm">Templates</span>
                                        </label>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="flex gap-2 pt-4">
                            <Button
                                onClick={saveConfig}
                                disabled={saving}
                                className="flex-1"
                            >
                                {saving && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                                Lưu cấu hình
                            </Button>
                            <Button
                                variant="outline"
                                onClick={runBackupNow}
                                disabled={runningBackup}
                            >
                                {runningBackup ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Play className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Backup Statistics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Thống kê Backup
                        </CardTitle>
                        <CardDescription>
                            Tình trạng và thống kê backup hệ thống
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                    {stats.totalBackups}
                                </div>
                                <div className="text-sm text-blue-600">Tổng backup</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                    {stats.automaticBackups}
                                </div>
                                <div className="text-sm text-green-600">Tự động</div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Backup thủ công:</span>
                                <span className="font-medium">{stats.manualBackups}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Tổng dung lượng:</span>
                                <span className="font-medium">{formatFileSize(stats.totalSize)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Backup cuối:</span>
                                <span className="font-medium text-sm">
                                    {formatDate(stats.lastBackupDate)}
                                </span>
                            </div>
                            {config.enabled && stats.nextScheduledBackup && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Backup tiếp theo:</span>
                                    <span className="font-medium text-sm">
                                        {formatDate(stats.nextScheduledBackup)}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t">
                            <div className="flex items-center gap-2">
                                {config.enabled ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span className="text-sm text-green-600">
                                            Backup tự động đang hoạt động ({getFrequencyLabel(config.frequency)})
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                                        <span className="text-sm text-yellow-600">
                                            Backup tự động đang tắt
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}