'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SimpleAuth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const testAccounts = [
        { email: 'giaovien@demo.com', name: 'Cô Nguyễn Thị Lan', role: 'Giáo viên' },
        { email: 'thayminh@demo.com', name: 'Thầy Trần Văn Minh', role: 'Giáo viên' },
        { email: 'admin@demo.com', name: 'Quản trị viên', role: 'Admin' }
    ];

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/simple-auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Redirect to home page
                window.location.href = '/';
            } else {
                setError(data.error || 'Đăng nhập thất bại');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Có lỗi xảy ra khi đăng nhập');
        } finally {
            setLoading(false);
        }
    };

    const quickLogin = (accountEmail: string) => {
        setEmail(accountEmail);
        setPassword('demo123');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h2 className="text-4xl font-bold mb-2">
                        <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            Đăng nhập nhanh
                        </span>
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Hệ thống đăng nhập đơn giản để test ứng dụng
                    </p>
                </div>

                {/* Quick Login Buttons */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-700">Chọn tài khoản test:</h3>
                    {testAccounts.map((account, index) => (
                        <button
                            key={index}
                            onClick={() => quickLogin(account.email)}
                            className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            <div className="text-left">
                                <div className="font-medium text-gray-900">{account.name}</div>
                                <div className="text-sm text-gray-500">{account.email}</div>
                            </div>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {account.role}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-50 text-gray-500">Hoặc nhập thủ công</span>
                    </div>
                </div>

                {/* Manual Login Form */}
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Nhập email"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Mật khẩu
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Nhập mật khẩu (demo123)"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </div>

                    <div className="text-center">
                        <a
                            href="/auth/signin"
                            className="text-blue-600 hover:text-blue-500 text-sm"
                        >
                            Quay lại đăng nhập Google
                        </a>
                    </div>
                </form>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <h4 className="font-medium text-blue-900 mb-2">💡 Hướng dẫn:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Click vào tài khoản test để tự động điền thông tin</li>
                        <li>• Mật khẩu cho tất cả tài khoản test: <code className="bg-blue-100 px-1 rounded">demo123</code></li>
                        <li>• Sau khi đăng nhập, bạn có thể sử dụng đầy đủ tính năng</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}