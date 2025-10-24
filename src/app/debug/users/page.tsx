'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, User, Shield, Crown, Users } from 'lucide-react';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    subjects: string;
    gradeLevel: string;
}

interface ApiResponse {
    success: boolean;
    data?: User[];
    count?: number;
    error?: string;
    message?: string;
}

export default function UsersDebugPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedEmail, setSelectedEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState('');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/debug/users');
            const result: ApiResponse = await response.json();

            if (result.success && result.data) {
                setUsers(result.data);
            } else {
                setError(result.error || 'Failed to fetch users');
            }
        } catch (err) {
            setError('Network error: ' + (err instanceof Error ? err.message : 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const updateUserRole = async (email: string, role: string) => {
        try {
            setUpdating(email);
            setError(null);

            const response = await fetch('/api/debug/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, role }),
            });

            const result: ApiResponse = await response.json();

            if (result.success) {
                await fetchUsers(); // Refresh the list
                alert(`✅ Đã cập nhật role của ${email} thành ${role}`);
            } else {
                setError(result.error || 'Failed to update user');
            }
        } catch (err) {
            setError('Network error: ' + (err instanceof Error ? err.message : 'Unknown error'));
        } finally {
            setUpdating(null);
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin':
                return <Crown className="w-4 h-4" />;
            case 'moderator':
                return <Shield className="w-4 h-4" />;
            default:
                return <User className="w-4 h-4" />;
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'moderator':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                                <Users className="w-8 h-8" />
                                Database Users Manager
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Xem và quản lý users trong database - Debug Tool
                            </p>
                        </div>
                        <Button
                            onClick={fetchUsers}
                            disabled={loading}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Quick Update Section */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Quick Role Update</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-2">Email</label>
                                <Input
                                    type="email"
                                    placeholder="user@example.com"
                                    value={selectedEmail}
                                    onChange={(e) => setSelectedEmail(e.target.value)}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-2">Role</label>
                                <Select value={selectedRole} onValueChange={setSelectedRole}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="moderator">Moderator</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                onClick={() => updateUserRole(selectedEmail, selectedRole)}
                                disabled={!selectedEmail || !selectedRole || updating === selectedEmail}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {updating === selectedEmail ? 'Updating...' : 'Update Role'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <div className="text-red-800">
                                <strong>Error:</strong> {error}
                            </div>
                        </div>
                    </div>
                )}

                {/* Users List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>All Users ({users.length})</span>
                            {loading && <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-2 text-gray-600">Loading users...</p>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No users found in database</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-medium text-gray-900">User Info</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-900">Created</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-4 px-4">
                                                    <div>
                                                        <div className="font-medium text-gray-900">{user.name}</div>
                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                        <div className="text-xs text-gray-400">ID: {user.id}</div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Badge className={`flex items-center gap-1 w-fit ${getRoleBadgeColor(user.role)}`}>
                                                        {getRoleIcon(user.role)}
                                                        {user.role}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="text-sm text-gray-900">{formatDate(user.createdAt)}</div>
                                                    <div className="text-xs text-gray-500">Updated: {formatDate(user.updatedAt)}</div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => updateUserRole(user.email, 'admin')}
                                                            disabled={user.role === 'admin' || updating === user.email}
                                                            className="text-xs"
                                                        >
                                                            {updating === user.email ? 'Updating...' : 'Make Admin'}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => updateUserRole(user.email, 'user')}
                                                            disabled={user.role === 'user' || updating === user.email}
                                                            className="text-xs"
                                                        >
                                                            Make User
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Instructions */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Hướng dẫn sử dụng</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p><strong>1.</strong> Để truy cập admin, bạn cần có tài khoản với role = "admin"</p>
                            <p><strong>2.</strong> Sử dụng nút "Make Admin" để cấp quyền admin cho user</p>
                            <p><strong>3.</strong> Hoặc sử dụng form "Quick Role Update" ở trên để cập nhật role</p>
                            <p><strong>4.</strong> Sau khi có role admin, truy cập: <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3001/admin/dashboard</code></p>
                            <p><strong>5.</strong> Nếu chưa có tài khoản, đăng nhập demo tại: <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3001/auth/demo</code></p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}