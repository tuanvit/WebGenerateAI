'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BackupScheduler } from './BackupScheduler';
import {
    Download,
    Upload,
    Plus,
    MoreHorizontal,
    Trash2,
    Shield,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    Clock,
    Database
} from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';

interface BackupMetadata {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    createdBy: string;
    size: number;
    type: 'manual' | 'automatic';
    status: 'creating' | 'completed' | 'failed';
    aiToolsCount: number;
    templatesCount: number;
    checksum: string;
}

interface BackupManagerProps {
    className?: string;
}

export function BackupManager({ className }: BackupManagerProps) {
    const [backups, setBackups] = useState<BackupMetadata[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [importing, setImporting] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [newBackupName, setNewBackupName] = useState('');
    const [newBackupDescription, setNewBackupDescription] = useState('');
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importOptions, setImportOptions] = useState({
        overwriteExisting: false,
        validateData: true,
        createBackupBeforeImport: true,
        dryRun: false
    });
    const { toast } = useToast();

    useEffect(() => {
        loadBackups();
    }, []);

    const loadBackups = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/backup');
            if (!response.ok) {
                throw new Error('Failed to load backups');
            }
            const data = await response.json();
            setBackups(data.backups || []);
        } catch (error) {
            console.error('Error loading backups:', error);
            toast({
                title: 'Lỗi',
                description: 'Không thể tải danh sách backup',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const createBackup = async () => {
        if (!newBackupName.trim()) {
            toast({
                title: 'Lỗi',
                description: 'Vui lòng nhập tên backup',
                variant: 'destructive'
            });
            return;
        }

        try {
            setCreating(true);
            const response = await fetch('/api/admin/backup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: newBackupName,
                    description: newBackupDescription,
                    type: 'manual'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create backup');
            }

            const backup = await response.json();
            setBackups(prev => [backup, ...prev]);
            setShowCreateDialog(false);
            setNewBackupName('');
            setNewBackupDescription('');

            toast({
                title: 'Thành công',
                description: 'Backup đã được tạo thành công'
            });
        } catch (error) {
            console.error('Error creating backup:', error);
            toast({
                title: 'Lỗi',
                description: 'Không thể tạo backup',
                variant: 'destructive'
            });
        } finally {
            setCreating(false);
        }
    };

    const downloadBackup = async (backupId: string, backupName: string) => {
        try {
            const response = await fetch(`/api/admin/backup/${backupId}`);
            if (!response.ok) {
                throw new Error('Failed to download backup');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup-${backupName}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({
                title: 'Thành công',
                description: 'Backup đã được tải xuống'
            });
        } catch (error) {
            console.error('Error downloading backup:', error);
            toast({
                title: 'Lỗi',
                description: 'Không thể tải xuống backup',
                variant: 'destructive'
            });
        }
    };

    const deleteBackup = async (backupId: string, backupName: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa backup "${backupName}"?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/backup/${backupId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete backup');
            }

            setBackups(prev => prev.filter(b => b.id !== backupId));

            toast({
                title: 'Thành công',
                description: 'Backup đã được xóa'
            });
        } catch (error) {
            console.error('Error deleting backup:', error);
            toast({
                title: 'Lỗi',
                description: 'Không thể xóa backup',
                variant: 'destructive'
            });
        }
    };

    const verifyBackup = async (backupId: string) => {
        try {
            const response = await fetch(`/api/admin/backup/${backupId}/verify`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Failed to verify backup');
            }

            const result = await response.json();

            if (result.valid) {
                toast({
                    title: 'Backup hợp lệ',
                    description: 'Backup đã được kiểm tra và không có lỗi'
                });
            } else {
                toast({
                    title: 'Backup có vấn đề',
                    description: `Lỗi: ${result.errors.join(', ')}`,
                    variant: 'destructive'
                });
            }
        } catch (error) {
            console.error('Error verifying backup:', error);
            toast({
                title: 'Lỗi',
                description: 'Không thể kiểm tra backup',
                variant: 'destructive'
            });
        }
    };

    const restoreBackup = async (backupId: string, backupName: string) => {
        if (!confirm(`Bạn có chắc chắn muốn khôi phục từ backup "${backupName}"? Thao tác này sẽ ghi đè dữ liệu hiện tại.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/backup/restore/${backupId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    overwriteExisting: true,
                    validateData: true,
                    createBackupBeforeRestore: true
                })
            });

            if (!response.ok) {
                throw new Error('Failed to restore backup');
            }

            const result = await response.json();

            toast({
                title: 'Khôi phục thành công',
                description: `Đã khôi phục ${result.aiToolsImported} AI tools và ${result.templatesImported} templates`
            });

            // Reload backups to show the new pre-restore backup
            loadBackups();
        } catch (error) {
            console.error('Error restoring backup:', error);
            toast({
                title: 'Lỗi',
                description: 'Không thể khôi phục backup',
                variant: 'destructive'
            });
        }
    };

    const importBackup = async () => {
        if (!importFile) {
            toast({
                title: 'Lỗi',
                description: 'Vui lòng chọn file backup',
                variant: 'destructive'
            });
            return;
        }

        try {
            setImporting(true);
            const formData = new FormData();
            formData.append('file', importFile);
            formData.append('options', JSON.stringify(importOptions));

            const response = await fetch('/api/admin/backup/import', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to import backup');
            }

            const result = await response.json();

            toast({
                title: 'Import thành công',
                description: `Đã import ${result.aiToolsImported} AI tools và ${result.templatesImported} templates`
            });

            setShowImportDialog(false);
            setImportFile(null);
            loadBackups();
        } catch (error) {
            console.error('Error importing backup:', error);
            toast({
                title: 'Lỗi',
                description: 'Không thể import backup',
                variant: 'destructive'
            });
        } finally {
            setImporting(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'creating':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'failed':
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
            default:
                return <Database className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge variant="default" className="bg-green-100 text-green-800">Hoàn thành</Badge>;
            case 'creating':
                return <Badge variant="secondary">Đang tạo</Badge>;
            case 'failed':
                return <Badge variant="destructive">Thất bại</Badge>;
            default:
                return <Badge variant="outline">Không xác định</Badge>;
        }
    };

    return (
        <div className={className}>
            <Tabs defaultValue="backups" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="backups">Danh sách Backup</TabsTrigger>
                    <TabsTrigger value="schedule">Lịch tự động</TabsTrigger>
                </TabsList>

                <TabsContent value="backups">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Database className="h-5 w-5" />
                                        Quản lý Backup & Restore
                                    </CardTitle>
                                    <CardDescription>
                                        Tạo, quản lý và khôi phục backup dữ liệu hệ thống
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <Upload className="h-4 w-4 mr-2" />
                                                Import
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Import Backup</DialogTitle>
                                                <DialogDescription>
                                                    Chọn file backup để import dữ liệu
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">
                                                        File Backup (JSON)
                                                    </label>
                                                    <Input
                                                        type="file"
                                                        accept=".json"
                                                        onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={importOptions.overwriteExisting}
                                                            onChange={(e) => setImportOptions(prev => ({
                                                                ...prev,
                                                                overwriteExisting: e.target.checked
                                                            }))}
                                                        />
                                                        <span className="text-sm">Ghi đè dữ liệu hiện có</span>
                                                    </label>
                                                    <label className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={importOptions.createBackupBeforeImport}
                                                            onChange={(e) => setImportOptions(prev => ({
                                                                ...prev,
                                                                createBackupBeforeImport: e.target.checked
                                                            }))}
                                                        />
                                                        <span className="text-sm">Tạo backup trước khi import</span>
                                                    </label>
                                                    <label className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={importOptions.dryRun}
                                                            onChange={(e) => setImportOptions(prev => ({
                                                                ...prev,
                                                                dryRun: e.target.checked
                                                            }))}
                                                        />
                                                        <span className="text-sm">Chỉ kiểm tra (không import thực tế)</span>
                                                    </label>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setShowImportDialog(false)}
                                                >
                                                    Hủy
                                                </Button>
                                                <Button
                                                    onClick={importBackup}
                                                    disabled={importing || !importFile}
                                                >
                                                    {importing && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                                                    Import
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                                        <DialogTrigger asChild>
                                            <Button size="sm">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Tạo Backup
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Tạo Backup Mới</DialogTitle>
                                                <DialogDescription>
                                                    Tạo backup toàn bộ dữ liệu AI tools và templates
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">
                                                        Tên Backup *
                                                    </label>
                                                    <Input
                                                        value={newBackupName}
                                                        onChange={(e) => setNewBackupName(e.target.value)}
                                                        placeholder="Nhập tên backup..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">
                                                        Mô tả
                                                    </label>
                                                    <Textarea
                                                        value={newBackupDescription}
                                                        onChange={(e) => setNewBackupDescription(e.target.value)}
                                                        placeholder="Mô tả backup (tùy chọn)..."
                                                        rows={3}
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setShowCreateDialog(false)}
                                                >
                                                    Hủy
                                                </Button>
                                                <Button
                                                    onClick={createBackup}
                                                    disabled={creating || !newBackupName.trim()}
                                                >
                                                    {creating && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                                                    Tạo Backup
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                                    Đang tải...
                                </div>
                            ) : backups.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    Chưa có backup nào. Tạo backup đầu tiên để bảo vệ dữ liệu của bạn.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tên</TableHead>
                                            <TableHead>Trạng thái</TableHead>
                                            <TableHead>Loại</TableHead>
                                            <TableHead>Dữ liệu</TableHead>
                                            <TableHead>Kích thước</TableHead>
                                            <TableHead>Ngày tạo</TableHead>
                                            <TableHead className="w-[100px]">Thao tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {backups.map((backup) => (
                                            <TableRow key={backup.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{backup.name}</div>
                                                        {backup.description && (
                                                            <div className="text-sm text-gray-500 truncate max-w-[200px]">
                                                                {backup.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(backup.status)}
                                                        {getStatusBadge(backup.status)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={backup.type === 'manual' ? 'default' : 'secondary'}>
                                                        {backup.type === 'manual' ? 'Thủ công' : 'Tự động'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <div>{backup.aiToolsCount} AI Tools</div>
                                                        <div>{backup.templatesCount} Templates</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{formatFileSize(backup.size)}</TableCell>
                                                <TableCell>
                                                    {new Date(backup.createdAt).toLocaleDateString('vi-VN')}
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={backup.status === 'completed' ? () => downloadBackup(backup.id, backup.name) : undefined}
                                                                className={backup.status !== 'completed' ? 'opacity-50 cursor-not-allowed' : ''}
                                                            >
                                                                <Download className="h-4 w-4 mr-2" />
                                                                Tải xuống
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={backup.status === 'completed' ? () => verifyBackup(backup.id) : undefined}
                                                                className={backup.status !== 'completed' ? 'opacity-50 cursor-not-allowed' : ''}
                                                            >
                                                                <Shield className="h-4 w-4 mr-2" />
                                                                Kiểm tra
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={backup.status === 'completed' ? () => restoreBackup(backup.id, backup.name) : undefined}
                                                                className={backup.status !== 'completed' ? 'opacity-50 cursor-not-allowed' : ''}
                                                            >
                                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                                Khôi phục
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => deleteBackup(backup.id, backup.name)}
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Xóa
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="schedule">
                    <BackupScheduler />
                </TabsContent>
            </Tabs>
        </div>
    );
}