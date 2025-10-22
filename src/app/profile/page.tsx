"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Header from "@/components/layout/Header"
import ProfileForm from "@/components/profile/ProfileForm"
import { User } from "@/types/user"

export default function ProfilePage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin")
            return
        }

        if (status === "authenticated" && session?.user?.email) {
            fetchUserProfile()
        }
    }, [status, session?.user?.email, router])

    const fetchUserProfile = async () => {
        if (!session?.user?.email) return

        try {
            const response = await fetch(`/api/users/by-email/${encodeURIComponent(session.user.email)}`)
            if (response.ok) {
                const userData = await response.json()
                setUser(userData)
            } else {
                console.error("Lỗi tải thông tin người dùng:", response.statusText)
            }
        } catch (error) {
            console.error("Lỗi tải thông tin người dùng:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleProfileUpdate = async (updatedUser: User) => {
        setUser(updatedUser)
    }

    if (status === "loading" || isLoading) {
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

            <main className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Thông tin cá nhân
                                </h1>
                                <p className="mt-2 text-sm text-gray-600">
                                    Cập nhật thông tin cá nhân và sở thích giảng dạy của bạn
                                </p>
                            </div>
                            <ProfileForm
                                user={user}
                                onUpdate={handleProfileUpdate}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}