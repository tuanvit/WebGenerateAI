"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Header from '@/components/layout/Header'
import CommunityLibraryBrowser from '@/components/library/CommunityLibraryBrowser'
import { CommunityStats } from '@/components/community/CommunityStats'

export default function CommunityLibraryPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin")
        }
    }, [status, router])

    const handleSaveToPersonal = async (content: any) => {
        try {
            const response = await fetch('/api/library/community/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contentId: content.id }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save to personal library')
            }

            return data
        } catch (error) {
            console.error('Save error:', error)
            throw error
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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Thư viện cộng đồng</h1>
                            <p className="mt-2 text-gray-600">
                                Khám phá và chia sẻ prompt với cộng đồng giáo viên Việt Nam
                            </p>
                        </div>

                        <div className="flex space-x-3">
                            <a
                                href="/library/personal"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                Thư viện cá nhân
                            </a>

                            <a
                                href="/dashboard"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Tạo prompt mới
                            </a>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <CommunityStats />
                    <CommunityLibraryBrowser onSaveToPersonal={handleSaveToPersonal} />
                </div>
            </main>
        </div>
    )
}