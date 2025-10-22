"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { SkipLink } from "@/components/ui/AccessibilityUtils"
import { useSimpleAuth } from "@/hooks/useSimpleAuth"

export default function Header() {
    const { data: session, status } = useSession()
    const { user: simpleUser, loading: simpleLoading, logout: simpleLogout } = useSimpleAuth()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const userMenuRef = useRef<HTMLDivElement>(null)

    // Use simple auth if available, otherwise fall back to NextAuth
    const currentUser = simpleUser || session?.user
    const isLoading = simpleLoading || status === "loading"
    const isAuthenticated = !!simpleUser || status === "authenticated"

    const handleSignOut = async () => {
        if (simpleUser) {
            await simpleLogout()
        } else {
            await signOut({ callbackUrl: "/" })
        }
    }

    // Close user menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    // Close menus on escape key
    useEffect(() => {
        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsMenuOpen(false)
                setIsUserMenuOpen(false)
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => {
            document.removeEventListener('keydown', handleEscape)
        }
    }, [])

    return (
        <>
            <SkipLink href="#main-content">Bỏ qua đến nội dung chính</SkipLink>

            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50" role="banner">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <Link
                                href="/"
                                className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1"
                                aria-label="AI Prompt Generator for Teachers - Trang chủ"
                            >
                                PromptEdu
                            </Link>
                            <span className="hidden sm:block text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full" aria-hidden="true">for Teachers</span>
                        </div>

                        <nav className="hidden md:flex items-center space-x-1" aria-label="Menu chính" role="navigation">
                            <Link
                                href="/create-prompt"
                                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                            >
                                ✨ Tạo Prompt
                            </Link>
                            <Link
                                href="/templates"
                                className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                            >
                                📚 Prompt Mẫu
                            </Link>
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        href="/dashboard"
                                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                    >
                                        Bảng điều khiển
                                    </Link>
                                    <Link
                                        href="/library"
                                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                    >
                                        Thư viện
                                    </Link>
                                    <div className="relative" ref={userMenuRef}>
                                        <button
                                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                            className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                            aria-expanded={isUserMenuOpen}
                                            aria-haspopup="true"
                                            aria-label={`Menu người dùng cho ${currentUser?.name || currentUser?.email}`}
                                        >
                                            <span className="mr-2">{currentUser?.name || currentUser?.email}</span>
                                            <svg
                                                className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {isUserMenuOpen && (
                                            <div
                                                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                                                role="menu"
                                                aria-orientation="vertical"
                                                aria-labelledby="user-menu-button"
                                            >
                                                <Link
                                                    href="/profile"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition-colors"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    role="menuitem"
                                                >
                                                    Thông tin cá nhân
                                                </Link>
                                                <button
                                                    onClick={handleSignOut}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition-colors"
                                                    role="menuitem"
                                                >
                                                    Đăng xuất
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : isLoading ? (
                                <div className="animate-pulse" aria-label="Đang tải thông tin người dùng">
                                    <div className="h-8 w-20 bg-gray-200 rounded"></div>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <Link
                                        href="/auth/simple"
                                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
                                    >
                                        🚀 Đăng nhập nhanh
                                    </Link>
                                    <Link
                                        href="/auth/signin"
                                        className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                    >
                                        Google
                                    </Link>
                                </div>
                            )}
                        </nav>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="text-gray-700 hover:text-blue-600 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                aria-expanded={isMenuOpen}
                                aria-label="Mở menu điều hướng"
                            >
                                <span className="sr-only">Mở menu chính</span>
                                {!isMenuOpen ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu */}
                    {isMenuOpen && (
                        <div className="md:hidden" role="navigation" aria-label="Menu di động">
                            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
                                {isAuthenticated ? (
                                    <>
                                        <div className="px-3 py-2 text-sm font-medium text-gray-900 border-b border-gray-200 mb-2">
                                            {currentUser?.name || currentUser?.email}
                                        </div>
                                        <Link
                                            href="/dashboard"
                                            className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Bảng điều khiển
                                        </Link>
                                        <Link
                                            href="/library"
                                            className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Thư viện
                                        </Link>
                                        <Link
                                            href="/profile"
                                            className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Thông tin cá nhân
                                        </Link>
                                        <button
                                            onClick={() => {
                                                handleSignOut()
                                                setIsMenuOpen(false)
                                            }}
                                            className="block w-full text-left text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        >
                                            Đăng xuất
                                        </button>
                                    </>
                                ) : (
                                    <div className="space-y-2">
                                        <Link
                                            href="/auth/simple"
                                            className="block bg-green-600 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Đăng nhập nhanh
                                        </Link>
                                        <Link
                                            href="/auth/signin"
                                            className="block bg-blue-600 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Đăng nhập Google
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </header>
        </>
    )
}