'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function SimpleAuth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSimpleLogin = async () => {
        if (!email || !password) {
            alert('Vui lòng nhập email và mật khẩu');
            return;
        }

        setLoading(true);

        try {
            // Simple validation for demo purposes
            const validCredentials = [
                { email: 'admin@example.com', password: 'admin123', name: 'Admin User', role: 'admin' },
                { email: 'teacher@example.com', password: 'teacher123', name: 'Giáo viên', role: 'teacher' },
                { email: 'user@example.com', password: 'user123', name: 'Người dùng', role: 'user' }
            ];

            const user = validCredentials.find(cred => cred.email === email && cred.password === password);

            if (!user) {
                alert('Email hoặc mật khẩu không đúng');
                return;
            }

            const result = await signIn('demo', {
                email: user.email,
                name: user.name,
                redirect: false
            });

            if (result?.ok) {
                // Chuyển hướng dựa trên role
                if (user.role === 'admin') {
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
                        Đăng nhập
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Nhập email và mật khẩu để đăng nhập
                    </p>
                </div>

                <div className="mt-8 space-y-6">
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
                                placeholder="Nhập email của bạn"
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
                                placeholder="Nhập mật khẩu của bạn"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            onClick={handleSimpleLogin}
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


                </div>


            </div>
        </div>
    );
}