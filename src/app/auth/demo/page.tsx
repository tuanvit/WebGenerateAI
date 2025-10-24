'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function DemoAuth() {
    const [email, setEmail] = useState('admin@example.com');
    const [name, setName] = useState('Admin User');
    const router = useRouter();

    const handleDemoLogin = async () => {
        if (!email || !name) {
            alert('Vui lòng nhập email và tên');
            return;
        }

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
            console.error('Demo login error:', error);
            alert('Có lỗi xảy ra khi đăng nhập');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Đăng nhập Demo
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Chỉ để test ứng dụng - không cần Google OAuth
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
                            onClick={handleDemoLogin}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Đăng nhập Demo
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
            </div>
        </div>
    );
}