"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Header from "@/components/layout/Header"
import Link from "next/link"

interface LibraryStats {
    user: {
        totalPrompts: number
        sharedPrompts: number
        savedPrompts: number
        userSharedContent: number
    }
    community: {
        totalContent: number
    }
}

export default function Library() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [stats, setStats] = useState<LibraryStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin")
        } else if (status === "authenticated") {
            fetchStats()
        }
    }, [status, router])

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/library/stats')
            if (response.ok) {
                const data = await response.json()
                setStats(data)
            }
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Đang tải...</p>
                </div>
            </div>
        )
    }

    if (!session) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Thư viện</h1>
                    <p className="mt-2 text-gray-600">
                        Quản lý và chia sẻ các prompt AI của bạn
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Library */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Thư viện cá nhân</h2>
                        <p className="text-gray-600 mb-4">
                            Quản lý các prompt và kế hoạch bài dạy bạn đã tạo và lưu trữ.
                        </p>
                        <Link
                            href="/library/personal"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Xem thư viện cá nhân
                        </Link>
                    </div>

                    {/* Community Library */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Thư viện cộng đồng</h2>
                        <p className="text-gray-600 mb-4">
                            Khám phá và chia sẻ prompt với cộng đồng giáo viên Việt Nam.
                        </p>
                        <div className="space-x-3">
                            <Link
                                href="/library/community"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                                Khám phá cộng đồng
                            </Link>
                            <Link
                                href="/library/my-shared"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Quản lý prompt đã chia sẻ
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Thống kê nhanh</h2>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {stats?.user.totalPrompts || 0}
                                </div>
                                <div className="text-sm text-gray-500">Prompt đã tạo</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {stats?.user.userSharedContent || 0}
                                </div>
                                <div className="text-sm text-gray-500">Đã chia sẻ cộng đồng</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {stats?.user.savedPrompts || 0}
                                </div>
                                <div className="text-sm text-gray-500">Đã lưu từ cộng đồng</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">
                                    {stats?.community.totalContent || 0}
                                </div>
                                <div className="text-sm text-gray-500">Tổng nội dung cộng đồng</div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}