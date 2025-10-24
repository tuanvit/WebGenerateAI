'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function SimpleAuth() {
    const [email, setEmail] = useState('admin@example.com');
    const [name, setName] = useState('Admin User');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSimpleLogin = async () => {
        if (!email || !name) {
            alert('Vui lòng nhập email và tên');
            return;
        }

        setLoading(true);

        try {
            const result = await signIn('demo', {
                email,
                name,
                redirect: false
            });

            if (result?.ok) {
                // Chuyển hướng về admin dashboard nếu là admin
                if (email === 'admin@example.com') {
                    router.push('/admin/dashboard');
                } else {
                    router.push('/dashboard');
                }
            } else {
                alert('Đăng nhập thất bại: ' + (result?.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Simple login error:', error);
            alert('Có lỗi xảy ra khi đăng nhập');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Đăng nhập Đơn giản
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Đăng nhập nhanh chóng - không cần Google OAuth
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Họ và tên
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Nhập họ và tên của bạn"
                            />
                        </div>

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
                                placeholder="Nhập email của bạn"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            onClick={handleSimpleLogin}
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập Đơn giản'}
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
                </div>

                {/* Quick Login Presets */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Tài khoản test nhanh:</h3>
                    <div className="space-y-2">
                        <button
                            onClick={() => {
                                setEmail('admin@example.com');
                                setName('Admin User');
                            }}
                            className="w-full text-left p-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            <div className="font-medium text-gray-900">Admin User</div>
                            <div className="text-sm text-gray-500">admin@example.com</div>
                            <div className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded inline-block mt-1">
                                Admin
                            </div>
                        </button>

                        <button
                            onClick={() => {
                                setEmail('giaovien@demo.com');
                                setName('Cô Nguyễn Thị Lan');
                            }}
                            className="w-full text-left p-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            <div className="font-medium text-gray-900">Cô Nguyễn Thị Lan</div>
                            <div className="text-sm text-gray-500">giaovien@demo.com</div>
                            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded inline-block mt-1">
                                Giáo viên
                            </div>
                        </button>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <h4 className="font-medium text-blue-900 mb-2">💡 Hướng dẫn:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Click vào tài khoản test để tự động điền thông tin</li>
                        <li>• Không cần mật khẩu - chỉ cần email và tên</li>
                        <li>• Admin có thể truy cập trang quản lý</li>
                        <li>• Giáo viên có thể sử dụng tính năng tạo prompt</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}