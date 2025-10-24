"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
    LayoutDashboard,
    Bot,
    FileText,
    Settings,
    Menu,
    X,
    User,
    LogOut,
    Shield,
    Home
} from 'lucide-react';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const navigationItems = [
    {
        name: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
        section: 'dashboard'
    },
    {
        name: 'AI Tools',
        href: '/admin/ai-tools',
        icon: Bot,
        section: 'ai-tools'
    },
    {
        name: 'Templates',
        href: '/admin/templates',
        icon: FileText,
        section: 'templates'
    },
    {
        name: 'Cài đặt',
        href: '/admin/settings',
        icon: Settings,
        section: 'settings'
    }
];

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();

    // Check if user has admin role
    const isAdmin = (session?.user as any)?.role === 'admin';

    // Redirect non-admin users
    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/auth/signin?callbackUrl=' + encodeURIComponent(pathname));
            return;
        }

        if (!isAdmin) {
            router.push('/dashboard');
            return;
        }
    }, [session, status, isAdmin, router, pathname]);

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/' });
    };

    // Show loading state while checking authentication
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Don't render if not authenticated or not admin
    if (!session || !isAdmin) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Sidebar header */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                            <Shield className="w-8 h-8 text-blue-600" />
                            <span className="text-xl font-bold text-gray-900">Admin Panel</span>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {navigationItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.section}
                                    href={item.href}
                                    className={`
                                        flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                                        ${isActive
                                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }
                                    `}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User info */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {session.user?.name || 'Admin User'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {session.user?.email}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
                    {/* Mobile menu button */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Page title */}
                    <div className="flex-1 lg:ml-0">
                        <h1 className="text-lg font-semibold text-gray-900">
                            {navigationItems.find(item => pathname.startsWith(item.href))?.name || 'Admin Panel'}
                        </h1>
                    </div>

                    {/* User menu */}
                    <div className="relative">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="hidden sm:block text-sm font-medium">
                                {session.user?.name || 'Admin'}
                            </span>
                        </button>

                        {/* User dropdown menu */}
                        {userMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-900">
                                        {session.user?.name || 'Admin User'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {session.user?.email}
                                    </p>
                                    <p className="text-xs text-blue-600 font-medium mt-1">
                                        Quản trị viên
                                    </p>
                                </div>
                                <Link
                                    href="/dashboard"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    onClick={() => setUserMenuOpen(false)}
                                >
                                    <Home className="w-4 h-4 mr-2" />
                                    Về trang chính
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}