"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Header from '@/components/layout/Header'
import SimplePersonalLibrary from '@/components/library/SimplePersonalLibrary'
import PromptEditor from '@/components/library/PromptEditor'
import { GeneratedPrompt } from '@/types/prompt'

export default function PersonalLibraryPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [editingPrompt, setEditingPrompt] = useState<GeneratedPrompt | null>(null)
    const [isEditorLoading, setIsEditorLoading] = useState(false)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin")
        }
    }, [status, router])

    const handleEdit = (prompt: GeneratedPrompt) => {
        setEditingPrompt(prompt)
    }

    const handleSaveEdit = async (updatedPrompt: Partial<GeneratedPrompt>) => {
        if (!editingPrompt) return

        setIsEditorLoading(true)
        try {
            const response = await fetch(`/api/library/prompts/${editingPrompt.id}/edit`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedPrompt),
            })

            if (!response.ok) {
                throw new Error('Failed to update prompt')
            }

            // Close editor and refresh the list
            setEditingPrompt(null)
            // The dashboard will reload its data automatically
        } catch (error) {
            console.error('Error updating prompt:', error)
            throw error // Re-throw to let the editor handle the error display
        } finally {
            setIsEditorLoading(false)
        }
    }

    const handleCancelEdit = () => {
        setEditingPrompt(null)
    }

    const handleDelete = async (promptId: string) => {
        const response = await fetch(`/api/library/prompts/${promptId}`, {
            method: 'DELETE'
        })

        if (!response.ok) {
            throw new Error('Failed to delete prompt')
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
                            <h1 className="text-3xl font-bold text-gray-900">Thư viện cá nhân</h1>
                            <p className="mt-2 text-gray-600">
                                Quản lý các prompt và kế hoạch bài dạy bạn đã tạo và lưu trữ
                            </p>
                        </div>

                        <div className="flex space-x-3">
                            <a
                                href="/dashboard"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Tạo prompt mới
                            </a>

                            <a
                                href="/library/community"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Thư viện cộng đồng
                            </a>
                        </div>
                    </div>
                </div>

                <SimplePersonalLibrary />
            </main>
        </div>
    )
}